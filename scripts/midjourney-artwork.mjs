#!/usr/bin/env node
// Genera su Midjourney le artwork che mancano in artworks/ e ne raccoglie le 4
// varianti; la migliore la sceglie una persona (o Claude che guarda i file), poi
// si promuove col nome esatto che il codice referenzia.
//
//   node scripts/midjourney-artwork.mjs                        # elenca cosa manca (nessuna generazione)
//   node scripts/midjourney-artwork.mjs --vai --limite 5       # genera davvero, 5 soggetti
//   node scripts/midjourney-artwork.mjs --vai --filtro "Episodio 13"
//   node scripts/midjourney-artwork.mjs --scegli "Il Notaio" 3 # promuove la variante 3
//
// Prima di --vai serve un Chrome in ascolto su CDP, avviato da te (Midjourney sta
// dietro Cloudflare: un browser lanciato da Playwright non supera la verifica).
//
//   & "C:\Program Files\Google\Chrome\Application\chrome.exe" `
//       --remote-debugging-port=9222 --user-data-dir="<repo>\.midjourney-profilo"
//
// In quella finestra fai il login a Midjourney una volta sola: il profilo resta
// in .midjourney-profilo/. CDP=<url> cambia l'indirizzo, ATTESA_LOGIN=<minuti> la
// pazienza.
//
// CODA e' quello che tiene insieme lo stile: i prompt nei .md descrivono solo il
// soggetto, la coerenza visiva della campagna sta nei parametri appesi in fondo
// (ancora di stile, profilo di personalizzazione, versione del modello). Senza,
// Midjourney vira sul fotorealismo e le carte non sembrano piu' lo stesso gioco.
//
//   $env:CODA = '--sref <url immagine ancora> --sw 800 --profile <id> --v 8.1'

import { chromium } from 'playwright';
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, copyFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RADICE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ARTWORKS = path.join(RADICE, 'artworks');
const CANDIDATI = path.join(RADICE, 'logs', 'candidati');
const PROFILO = path.join(RADICE, '.midjourney-profilo');
const CDP = process.env.CDP ?? 'http://localhost:9222';
const FILE_CODA = path.join(RADICE, 'scripts', 'midjourney-coda.txt');
const FILE_ATTESA = path.join(RADICE, 'logs', 'candidati', '_in-attesa.json');

// I parametri di stile stanno in un file versionato, non in una variabile che si
// puo' dimenticare: dimenticarli produce artwork fuori stile senza accorgersene.
// Il file ha due sezioni, [default] e [luoghi]: l'ancora di stile porta con se'
// anche il contenuto, quindi un'ancora abitata riempie di gente i prompt che
// vietano le figure.
function leggiCoda() {
  if (process.env.CODA) {
    const c = ` ${process.env.CODA.trim()}`;
    return { default: c, luoghi: c, tessere: c };
  }
  const sezioni = { default: '', luoghi: '', tessere: '' };
  if (!existsSync(FILE_CODA)) return sezioni;
  let corrente = 'default';
  for (const riga of readFileSync(FILE_CODA, 'utf8').split(/\r?\n/)) {
    const r = riga.trim();
    if (!r || r.startsWith('#')) continue;
    const sezione = r.match(/^\[(\w+)\]$/);
    if (sezione) corrente = sezione[1];
    else sezioni[corrente] = `${sezioni[corrente]} ${r}`;
  }
  if (!sezioni.luoghi) sezioni.luoghi = sezioni.default;
  if (!sezioni.tessere) sezioni.tessere = sezioni.default;
  return sezioni;
}

// Un prompt che elenca "figures" fra i --no e' un luogo deserto: niente persone.
const vietaFigure = (prompt) => /--no[^\n]*\bfigures\b/.test(prompt);

// Le tessere di Spedizione sono quadrate e viste dall'alto: vogliono una coda
// senza ancora, che imporrebbe il punto di vista sbagliato.
const eTessera = (prompt) => /top-down/i.test(prompt) || /--ar 1:1/.test(prompt);

// La scelta si fa guardando i PNG, non fidandosi del prompt: questi sono i
// criteri, in ordine di peso.
const CRITERI = `Criteri di scelta, in ordine di peso:
  1. Fedelta' al prompt: soggetto, azione, ambiente, ora del giorno.
  2. Difetti squalificanti: cornici, bordi, testo, lettere, firme, watermark,
     mani o volti deformi, tagli innaturali del soggetto.
  3. Stile della campagna: dipinto a olio, gaslamp gothic 1889, una sola fonte
     di luce calda nel buio, palette teal/sepia con accenti cremisi e oro.
  4. Leggibilita' come carta: il soggetto si capisce anche piccolo, e il centro
     regge il montaggio dentro la cornice.
  5. Atmosfera: quella che fa piu' paura o piu' curiosita' al tavolo.`;

// --- estrazione dei prompt dai file markdown ------------------------------

// Un blocco ``` è un prompt. Il nome del file di destinazione viene da una riga
// di intestazione che cita `Nome.png`: se la riga ne cita N, i N blocchi che la
// seguono si prendono i nomi in ordine (formato degli Episodi 2-5). Una riga di
// testo senza nomi chiude l'intestazione, così un nome non può mai finire su un
// prompt di un altro paragrafo. I blocchi senza nome (Episodio 1, i dorsi) e i
// nomi-modello tipo `Dorso <Nome>.png` restano orfani: il markdown non dice come
// vanno salvati, e qui non si indovina.
export function estraiPrompt(testo) {
  const righe = testo.split(/\r?\n/);
  const trovati = [];
  const orfani = [];
  let coda = [];
  for (let i = 0; i < righe.length; i++) {
    const riga = righe[i].trim();

    if (riga === '```') {
      let fine = i + 1;
      while (fine < righe.length && righe[fine].trim() !== '```') fine++;
      const prompt = righe.slice(i + 1, fine).join('\n').trim();
      const nome = coda.shift();
      if (prompt && nome && !nome.includes('<')) trovati.push({ nome, prompt });
      else if (prompt) orfani.push({ riga: i + 1, prompt: prompt.slice(0, 60) });
      i = fine;
      continue;
    }

    if (riga === '') continue;
    const nomi = [...riga.matchAll(/`(?:artworks\/)?([^`\n]+\.png)`/g)].map((m) => m[1]);
    coda = nomi;
  }
  return { trovati, orfani };
}

function fileDeiPrompt() {
  const elenco = [];
  const radice = path.join(RADICE, 'PROMPT-MIDJOURNEY.md');
  if (existsSync(radice)) elenco.push(radice);
  for (const voce of readdirSync(RADICE, { withFileTypes: true })) {
    if (!voce.isDirectory()) continue;
    for (const f of readdirSync(path.join(RADICE, voce.name)))
      if (f.startsWith('PROMPT-MIDJOURNEY-') && f.endsWith('.md'))
        elenco.push(path.join(RADICE, voce.name, f));
  }
  return elenco;
}

function raccogliMancanti() {
  const visti = new Set();
  const mancanti = [];
  const orfani = [];
  for (const file of fileDeiPrompt()) {
    const rel = path.relative(RADICE, file);
    const esito = estraiPrompt(readFileSync(file, 'utf8'));
    for (const o of esito.orfani) orfani.push({ ...o, file: rel });
    for (const { nome, prompt } of esito.trovati) {
      if (visti.has(nome)) continue;
      visti.add(nome);
      if (!existsSync(path.join(ARTWORKS, nome))) mancanti.push({ nome, prompt, file: rel });
    }
  }
  return { mancanti, orfani };
}

// --- Midjourney -----------------------------------------------------------

// Da sloggati la barra c'e' gia' ma è disabled ("Log in to start creating..."):
// aspettare che sia visibile non basta, va aspettata abilitata.
const BARRA = '#desktop_input_bar:not([disabled]), textarea:not([disabled])';

// La risposta di /api/submit-jobs porta gia' il job_id vero, softban o no —
// non serve piu' cercarlo nel feed. Le versioni precedenti di questo script
// affidavano i job NON softban a una ricerca per testo nella pagina (aspettando
// fino a 15 minuti fissi), e quella ricerca ha sbagliato job due volte prima di
// essere sostituita da un ancoraggio piu' preciso — ma restava comunque cieca
// al vero problema: senza Fast Hours anche i job non-softban possono metterci
// piu' di 15 minuti a comparire nel feed, quindi la ricerca falliva non per un
// bug di matching ma per pura lentezza della coda. Usare l'id che l'API
// restituisce subito elimina il problema alla radice, per entrambi i casi.
async function invia(pagina, prompt) {
  const barra = pagina.locator(BARRA).first();
  await barra.waitFor({ state: 'visible', timeout: 60_000 });
  await barra.click();
  await barra.fill(prompt);

  const rispostaPromessa = pagina
    .waitForResponse((r) => r.url().includes('/api/submit-jobs'), { timeout: 30_000 })
    .then((r) => r.json())
    .catch(() => null);
  await pagina.keyboard.press('Enter');
  const risposta = await rispostaPromessa;
  const job = risposta?.success?.[0];
  if (!job) throw new Error("l'invio non ha restituito un job_id (risposta di /api/submit-jobs mancante o malformata)");
  return job.job_id;
}

// Un job = un prompt = 4 varianti, agli indici 0_0..0_3. Si accetta comunque una
// lista di job (piu' lanci dello stesso soggetto) e si scartano i doppioni.
//
// Il download passa per un fetch DENTRO la pagina: il CDN di Midjourney risponde
// 403 alle richieste fatte fuori dal browser, perche' l'APIRequestContext di
// Playwright non condivide la sessione del Chrome a cui siamo attaccati.
async function scarica(pagina, ids) {
  const immagini = [];
  const visti = new Set();
  for (const id of [ids].flat()) {
    for (let i = 0; i < 4; i++) {
      const b64 = await pagina
        .evaluate(async (url) => {
          const r = await fetch(url);
          if (!r.ok) return null;
          const buf = new Uint8Array(await r.arrayBuffer());
          let s = '';
          for (const b of buf) s += String.fromCharCode(b);
          return btoa(s);
        }, `https://cdn.midjourney.com/${id}/0_${i}.png`)
        .catch(() => null);
      if (!b64) continue;
      const corpo = Buffer.from(b64, 'base64');
      const impronta = `${corpo.length}`;
      if (visti.has(impronta)) continue;
      visti.add(impronta);
      immagini.push(corpo);
    }
  }
  if (!immagini.length) throw new Error(`nessuna immagine scaricabile dai job: ${[ids].flat().join(', ')}`);
  return immagini;
}

// Job softban ancora in rendering: { nome: {prompt, coda, id, accodato} }, su
// file cosi' un --raccogli successivo (anche in un'altra sessione) li ritrova.
function leggiAttesa() {
  if (!existsSync(FILE_ATTESA)) return {};
  try {
    return JSON.parse(readFileSync(FILE_ATTESA, 'utf8'));
  } catch {
    return {};
  }
}

function scriviAttesa(inAttesa) {
  mkdirSync(path.dirname(FILE_ATTESA), { recursive: true });
  writeFileSync(FILE_ATTESA, JSON.stringify(inAttesa, null, 2) + '\n');
}

async function scaricaIn(pagina, nome, ids) {
  const base = nome.replace(/\.png$/i, '');
  const cartella = path.join(CANDIDATI, base);
  mkdirSync(cartella, { recursive: true });
  const immagini = await scarica(pagina, ids);
  immagini.forEach((b, i) => writeFileSync(path.join(cartella, `${i + 1}.png`), b));
  console.log(`  ${immagini.length} varianti in logs/candidati/${base}/`);
  return base;
}

// --- promozione della variante scelta --------------------------------------

function promuovi(nome, variante) {
  const base = nome.replace(/\.png$/i, '');
  const sorgente = path.join(CANDIDATI, base, `${variante}.png`);
  if (!existsSync(sorgente)) throw new Error(`variante inesistente: ${path.relative(RADICE, sorgente)}`);
  const destinazione = path.join(ARTWORKS, `${base}.png`);
  copyFileSync(sorgente, destinazione);
  console.log(`artworks/${base}.png  <-  candidato ${variante}`);
}

// --- avvio ----------------------------------------------------------------

function argomenti(argv) {
  const a = { vai: false, limite: Infinity, filtro: null, scegli: null, scarica: null, raccogli: false };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--vai') a.vai = true;
    else if (argv[i] === '--raccogli') a.raccogli = true;
    else if (argv[i] === '--limite') a.limite = Number(argv[++i]);
    else if (argv[i] === '--filtro') a.filtro = new RegExp(argv[++i], 'i');
    else if (argv[i] === '--scegli') a.scegli = { nome: argv[++i], variante: Number(argv[++i]) };
    else if (argv[i] === '--scarica') {
      a.scarica = { nome: argv[++i], job: argv.slice(i + 1).filter((x) => !x.startsWith('--')) };
      i = argv.length;
    }
  }
  return a;
}

async function main() {
  const opz = argomenti(process.argv.slice(2));

  if (opz.scegli) {
    promuovi(opz.scegli.nome, opz.scegli.variante);
    return;
  }

  // Un solo giro su tutto quello che aspetta di finire di generare: niente
  // attesa bloccata, si scarica cio' che e' pronto ORA e si lascia il resto sul
  // file per il prossimo --raccogli.
  if (opz.raccogli) {
    const inAttesa = leggiAttesa();
    const nomi = Object.keys(inAttesa);
    if (!nomi.length) {
      console.log('Niente in attesa.');
      return;
    }
    const browser = await chromium.connectOverCDP(CDP);
    const p = await browser.contexts()[0].newPage();
    await p.goto('https://www.midjourney.com/imagine', { waitUntil: 'domcontentloaded' });
    console.log(`Controllo ${nomi.length} job in attesa...`);
    let recuperati = 0;
    for (const nome of nomi) {
      const { prompt, coda, id, accodato } = inAttesa[nome];
      const pronto = await p
        .evaluate(async (jobId) => {
          for (let i = 0; i < 4; i++) {
            const r = await fetch(`https://cdn.midjourney.com/${jobId}/0_${i}.png`);
            if (r.ok) return true;
          }
          return false;
        }, id)
        .catch(() => false);
      if (!pronto) {
        const minuti = Math.round((Date.now() - new Date(accodato).getTime()) / 60_000);
        console.log(`  ${nome}: ancora in rendering (in coda da ${minuti} min)`);
        continue;
      }
      try {
        const base = await scaricaIn(p, nome, id);
        writeFileSync(path.join(CANDIDATI, base, 'prompt.txt'), prompt + coda + '\n');
        writeFileSync(path.join(CANDIDATI, base, 'job.txt'), id + '\n');
        delete inAttesa[nome];
        recuperati++;
      } catch (errore) {
        console.error(`  ${nome}: errore nel download — ${errore.message}`);
      }
    }
    scriviAttesa(inAttesa);
    await p.close();
    await browser.close();
    console.log(`\n${recuperati} recuperati, ${Object.keys(inAttesa).length} ancora in attesa.`);
    if (recuperati) console.log(`Guarda i PNG e promuovi la migliore:\n${CRITERI}`);
    return;
  }

  // Recupera nei candidati un prompt lanciato a mano su Midjourney.
  if (opz.scarica) {
    const browser = await chromium.connectOverCDP(CDP);
    const p = await browser.contexts()[0].newPage();
    await p.goto('https://www.midjourney.com/imagine', { waitUntil: 'domcontentloaded' });
    await scaricaIn(p, opz.scarica.nome, opz.scarica.job);
    await p.close();
    await browser.close();
    return;
  }

  const { mancanti, orfani } = raccogliMancanti();

  let lavoro = mancanti;
  if (opz.filtro) lavoro = lavoro.filter((v) => opz.filtro.test(v.file) || opz.filtro.test(v.nome));
  lavoro = lavoro.slice(0, opz.limite);

  console.log(`Artwork mancanti: ${mancanti.length}. In coda ora: ${lavoro.length}.`);
  if (orfani.length)
    console.log(`Prompt senza un nome file dichiarato nel markdown (da sistemare a mano): ${orfani.length}`);

  if (!opz.vai) {
    for (const v of lavoro) console.log(`  ${v.file}  ->  artworks/${v.nome}`);
    for (const o of orfani) console.log(`  ORFANO ${o.file}:${o.riga}  ${o.prompt}...`);
    console.log('\nNessuna generazione: aggiungi --vai per farle davvero.');
    return;
  }
  if (!lavoro.length) return;

  const code = leggiCoda();
  if (!code.default)
    console.warn(
      `ATTENZIONE: nessuna coda di stile. I prompt partono senza ancora ne' profilo, e il\n` +
        `risultato non sara' coerente con le artwork gia' in artworks/. Riempi ${path.relative(RADICE, FILE_CODA)}.`,
    );
  else {
    console.log(`Coda soggetti:${code.default}`);
    console.log(`Coda tessere :${code.tessere}`);
  }
  mkdirSync(CANDIDATI, { recursive: true });

  // Ci si attacca a un Chrome avviato a mano invece di lanciarne uno: Midjourney
  // sta dietro Cloudflare, e un browser lanciato da Playwright porta i flag di
  // automazione che fanno girare a vuoto la verifica anti-bot. Il Chrome che apri
  // tu e' un browser normale, con la tua sessione gia' dentro.
  const browser = await chromium.connectOverCDP(CDP).catch(() => {
    throw new Error(
      `nessun Chrome in ascolto su ${CDP}. Avvialo cosi', fai il login a Midjourney, poi rilancia:\n\n` +
        `  & "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" \`\n` +
        `      --remote-debugging-port=9222 --user-data-dir="${PROFILO}"\n`,
    );
  });
  const contesto = browser.contexts()[0] ?? (await browser.newContext());
  const pagina = contesto.pages().find((p) => p.url().includes('midjourney.com')) ?? (await contesto.newPage());
  await pagina.bringToFront();
  if (!pagina.url().includes('/imagine'))
    await pagina.goto('https://www.midjourney.com/imagine', { waitUntil: 'domcontentloaded' });

  const minuti = Number(process.env.ATTESA_LOGIN ?? 5);
  try {
    await pagina.locator(BARRA).first().waitFor({ state: 'visible', timeout: minuti * 60_000 });
  } catch {
    throw new Error(
      `la barra dei prompt e' rimasta disabilitata per ${minuti} minuti: fai il login a Midjourney in quella finestra e rilancia (ATTESA_LOGIN=<minuti> per aspettare di piu').`,
    );
  }
  console.log('Sessione Midjourney pronta, comincio.');
  // Scheda separata per ispezionare i job: il feed non va mai lasciato.
  let lettore = await contesto.newPage();

  // Fase 1: si invia tutta la coda senza aspettare. L'id del job arriva subito
  // dalla risposta di /api/submit-jobs (softban o no) — non serve piu' cercarlo
  // nel feed, quindi non serve piu' distinguere i due casi: si prova il download
  // una volta sola per ciascuno, chi non e' pronto finisce in coda per dopo.
  let fatte = 0;
  const pronti = [];
  const daScaricare = []; // { voce, coda, id } — non ancora scaricato
  for (const voce of lavoro) {
    const tessera = eTessera(voce.prompt);
    const coda = tessera ? code.tessere : vietaFigure(voce.prompt) ? code.luoghi : code.default;
    console.log(`\n[${++fatte}/${lavoro.length}] ${voce.nome}${tessera ? '  (tessera dall\'alto)' : ''}`);
    try {
      const id = await invia(pagina, voce.prompt + coda);
      daScaricare.push({ voce, coda, id });
    } catch (errore) {
      console.error(`  SALTATA: ${errore.message}`);
    }
  }

  // Fase 2: un solo tentativo immediato su tutti i job appena inviati, non
  // un'attesa bloccata. Non esiste un tempo giusto da aspettare qui dentro:
  // senza Fast Hours anche i job normali vanno in coda Relax, senza garanzia di
  // durata (osservato: pronti pochi minuti dopo che un'attesa di 12-15 minuti
  // li aveva gia' dati per persi, softban o no). Chi non e' ancora pronto ora
  // finisce sul file d'attesa e si riprova con `--raccogli` quando si vuole,
  // senza sprecare tempo dello script a girare a vuoto nel frattempo.
  if (daScaricare.length) {
    console.log(`\nTentativo immediato su ${daScaricare.length} job...`);
    const risultati = await Promise.all(
      daScaricare.map(({ id }) =>
        lettore
          .evaluate(async (jobId) => {
            for (let i = 0; i < 4; i++) {
              const r = await fetch(`https://cdn.midjourney.com/${jobId}/0_${i}.png`);
              if (r.ok) return true;
            }
            return false;
          }, id)
          .catch(() => false),
      ),
    );
    const inAttesa = leggiAttesa();
    for (let i = 0; i < daScaricare.length; i++) {
      const { voce, coda, id } = daScaricare[i];
      if (risultati[i]) {
        try {
          const base = await scaricaIn(lettore, voce.nome, id);
          writeFileSync(path.join(CANDIDATI, base, 'prompt.txt'), voce.prompt + coda + '\n');
          writeFileSync(path.join(CANDIDATI, base, 'job.txt'), id + '\n');
          pronti.push(base);
          continue;
        } catch (errore) {
          console.error(`  SALTATA (${voce.nome}): ${errore.message} — job: ${id}`);
          continue;
        }
      }
      inAttesa[voce.nome] = { prompt: voce.prompt, coda, id, accodato: new Date().toISOString() };
      console.log(`  ${voce.nome}: non ancora pronto, in attesa (job ${id})`);
    }
    scriviAttesa(inAttesa);
  }

  await lettore.close().catch(() => {});
  await browser.close(); // stacca la connessione CDP, la finestra resta tua

  if (pronti.length) {
    console.log(`\nGuarda i PNG e promuovi la migliore:\n${CRITERI}\n`);
    for (const base of pronti)
      console.log(`  node scripts/midjourney-artwork.mjs --scegli "${base}" <1-4>`);
  }
  const numAttesa = Object.keys(leggiAttesa()).length;
  if (numAttesa) console.log(`\n${numAttesa} in attesa di rendering — riprova con: node scripts/midjourney-artwork.mjs --raccogli`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main();
