// LE AZIONI DEVONO STARE NELLO SCHERMO DEL TELEFONO.
//
// Il layout immersivo non scorre — `overflow: hidden`, ed è giusto per un
// tablet fermo al centro del tavolo. Su un telefono in mano quella regola
// tagliava via il pannello delle azioni: era nel DOM, era «visibile» secondo
// Playwright, e cominciava 700 px sotto l'inizio di uno schermo che finiva
// prima. Irraggiungibile, perché la pagina non scorreva — e chi giocava vedeva
// «tocca a te» senza avere niente da toccare.
//
// Per questo qui non si guarda se il pannello ESISTE: si guarda DOVE FINISCE.
//
// Uso:
//   ./deploy/build-dist.sh
//   npx --no-install wrangler dev --var OSR_DEV_EMAIL:giocatore@esempio.it --port 8787
//   node webapp/test-telefono-azioni.mjs      (o OSR_BASE=… )
import { chromium } from 'playwright';
import { readFileSync } from 'fs';
import { costruisciMazzo } from './public/motore/regole.js';
const BASE = process.env.OSR_BASE || 'http://127.0.0.1:8787';
const C = JSON.parse(readFileSync('webapp/data/comune.json','utf8'));
const EP = JSON.parse(readFileSync('webapp/data/ep1.json','utf8'));
const ELENA=C.eroi.find(e=>e.nome.includes('ELENA')).nome, OTTONE=C.eroi.find(e=>e.nome.includes('OTTONE')).nome;
const T0 = EP.tessere[0].id;
const chiama=(chi,m,p,c)=>fetch(BASE+p,{method:m,headers:{'X-Osr-Dev-Email':chi,...(c?{'Content-Type':'application/json'}:{})},body:c?JSON.stringify(c):undefined});
const id = crypto.randomUUID();
await chiama('arbitro@esempio.it','POST','/api/tavolo',{id,nome:'T'});
await chiama('arbitro@esempio.it','PUT','/api/party',{tavolo:id,party:[ELENA,OTTONE]});
await chiama('arbitro@esempio.it','POST','/api/membri',{tavolo:id,email:'giocatore@esempio.it',nome:'Fabio',eroe:ELENA});
// l'arbitro mette la partita sul tavolo, col turno di ELENA
const partita = { v:1, episodio:'ep1', modo:'digitale', party:[ELENA,OTTONE], fase:'spedizione',
  indagine:{ora:20,visitati:[],oggetti:[],caricheUsate:{},chiusa:true,approfondimentiLetti:[],risposte:['','','','']},
  vantaggi:{tier:'preparati'}, rng:{seme:5,passo:0}, aggiornato:Date.now(),
  spedizione:{ round:1, canto:0, cantoBonus:false, fase:'eroi', esito:null, digitale:true,
    rivelate:[T0], grate:[], nemici:[], log:[], compiti:{}, cercate:{},
    eroiPos:{[ELENA]:{t:T0,x:1,y:1},[OTTONE]:{t:T0,x:2,y:1}}, vite:{[ELENA]:6,[OTTONE]:7},
    azioni:{}, storditi:{}, eroiFatti:[], eroiAttivo:ELENA, scortati:[], mazzo:null,
    pendenza:null, insidie:{}, abilita:{} } };
// il mazzo Minaccia: nella partita vera lo costruisce l'avvio della spedizione
const CARTE = JSON.parse(readFileSync('webapp/data/carte.json','utf8'));
partita.spedizione.mazzo = costruisciMazzo({ seme: 3, passo: 0 }, CARTE, EP, 'ep1');
await chiama('arbitro@esempio.it','POST',`/api/tavolo/${id}/apri`,{tavolo:id,stato:partita});
const b = await chromium.launch();
// UNO SCHERMO DA TELEFONO VERO, barra del browser compresa. Con un viewport
// alto il difetto non si vedeva: le azioni entravano lo stesso, e il test
// passava anche col vecchio CSS. La misura conta.
const p = await b.newPage({ viewport: { width: 390, height: 640 } });
const err=[]; p.on('pageerror',e=>err.push('JS: '+e.message));
await p.goto(BASE,{waitUntil:'networkidle'});
await p.evaluate((id)=>{ localStorage.setItem('osr.tavolo', id); localStorage.setItem('osr.tavolo.nome','T'); }, id);
await p.reload({waitUntil:'networkidle'});
await p.waitForTimeout(2500);
let ko = 0;
const ok = (c, m) => { if (!c) { console.error('FAIL:', m); ko++; } };

const cl = await p.evaluate(() => document.querySelector('#app').className);
ok(cl.includes('vista-eroe'), `il telefono ha il layout da telefono (visto «${cl}»)`);
ok((await p.locator('.fascia-turno').innerText()).match(/tocca a te/i),
   'ed è il suo turno, quindi le azioni servono davvero');

const m = await p.evaluate(() => {
  const e = document.querySelector('#p-azioni');
  if (!e) return null;
  const b = e.getBoundingClientRect();
  return { top: Math.round(b.top), fondo: Math.round(b.bottom),
           viewport: innerHeight, scroll: document.documentElement.scrollHeight };
});
ok(m, 'il pannello delle azioni esiste');
if (m) {
  // RAGGIUNGIBILE: o sta dentro lo schermo, o la pagina scorre abbastanza da
  // arrivarci. Prima non valeva nessuna delle due.
  ok(m.fondo <= m.scroll,
     `le azioni si raggiungono scorrendo (finiscono a ${m.fondo}, pagina alta ${m.scroll})`);
  // e COMINCIANO dentro lo schermo: un pannello che comincia sotto la piega non
  // si sa nemmeno che c'è, e chi gioca resta fermo a guardare «tocca a te».
  // Che finisca più giù va bene: da lì si scorre sapendo cosa si sta cercando.
  ok(m.top < m.viewport - 40,
     `e cominciano dentro lo schermo (top ${m.top}, schermo ${m.viewport})`);
}
// --- LA MINACCIA: la carta la vedono tutti, e una per volta
//
// Prima la pesca si risolveva tutta in un comando e la metteva in scena solo il
// client di chi arbitra: sul telefono compariva la PRIMA carta e basta, e chi
// ricaricava si ritrovava a notte inoltrata mentre l'arbitro leggeva ancora.
{
  // niente bottone «fase minaccia» sul telefono: la notte la chiama chi conduce
  ok(await p.locator('#fase-minaccia').count() === 0,
     'il telefono non offre il bottone della fase Minaccia');

  // l'arbitro fa partire la pesca dal suo dispositivo
  const r = await chiama('arbitro@esempio.it', 'POST', `/api/tavolo/${id}/comando`, { tipo: 'fase-minaccia' });
  ok(r.ok, `la pesca parte (visto ${r.status})`);
  await p.waitForTimeout(1500);

  // si cerca LA CARTA, non la parola: il titolo sta nella barra e `innerText`
  // restituisce il testo di regole, che non contiene «minaccia»
  ok(await p.locator('.carta-grande').count() === 1, 'la carta arriva sul telefono');
  ok(await p.locator('#ok-msg').count() === 0, 'senza «continua»: la pesca non è sua');

  // LA CARTA E' NELLO STATO: chi ricarica la ritrova, invece di saltare avanti
  const v = await (await chiama('arbitro@esempio.it', 'GET', `/api/tavolo/${id}/stato`)).json();
  ok(v.stato.spedizione.carta, 'la carta aperta sta nello stato, non solo a schermo');
  await p.reload({ waitUntil: 'networkidle' });
  await p.waitForTimeout(2000);
  ok(await p.locator('.carta-grande').count() === 1,
     'e dopo un refresh è ancora lì — non si salta alla notte');

  // la SECONDA carta arriva quando l'arbitro prosegue
  if ((v.stato.spedizione.minacceDaPescare || 0) > 0) {
    await chiama('arbitro@esempio.it', 'POST', `/api/tavolo/${id}/comando`, { tipo: 'carta-vista' });
    await p.waitForTimeout(1500);
    const v2 = await (await chiama('arbitro@esempio.it', 'GET', `/api/tavolo/${id}/stato`)).json();
    ok(v2.stato.spedizione.carta && v2.stato.spedizione.carta.titolo !== v.stato.spedizione.carta.titolo,
       'la seconda carta arriva quando chi arbitra prosegue');
  }
}

// --- LA NOTTE SI GUARDA, E POI SI TORNA AGLI EROI
//
// La notte veniva applicata in locale da chi arbitra: il tavolo non ne sapeva
// niente, e il telefono restava fermo su «agisce la notte» per sempre — anche
// quando il turno era gia' tornato agli eroi. E chi guardava non vedeva
// muoversi nulla, perche' il copione non arrivava.
{
  // si smaltiscono le carte rimaste, se ce ne sono
  for (let i = 0; i < 4; i++) {
    const st = await (await chiama('arbitro@esempio.it', 'GET', `/api/tavolo/${id}/stato`)).json();
    if (!st.stato.spedizione.carta) break;
    await chiama('arbitro@esempio.it', 'POST', `/api/tavolo/${id}/comando`, { tipo: 'carta-vista' });
    await p.waitForTimeout(400);
  }

  const r = await chiama('arbitro@esempio.it', 'POST', `/api/tavolo/${id}/comando`, { tipo: 'fase-nemici' });
  ok(r.ok, `la notte parte dal dispositivo di chi arbitra (visto ${r.status})`);
  const d = await r.json();
  const ev = (d.eventi || []).find((x) => x.tipo === 'turno-nemici');
  ok(ev, 'e il copione della notte torna indietro come evento');
  if (ev) ok(ev.vite0 && Object.keys(ev.vite0).length > 0,
             'con le vite di partenza, o l’animazione mostrerebbe tutti già a terra');

  // il telefono esce da solo dall'attesa: la fase è tornata agli eroi
  await p.waitForTimeout(4000);
  const t = await p.locator('#app').innerText();
  ok(!/la notte/i.test(t) || /tocca a/i.test(t),
     `il telefono non resta fermo sulla notte (visto «${t.slice(0, 60).replace(/\s+/g, ' ')}»)`);
}

ok(err.length === 0, `senza errori JS: ${err.slice(0, 2).join(' | ')}`);

await b.close();
await chiama('arbitro@esempio.it','DELETE',`/api/tavolo?id=${id}`);
console.log(ko === 0 ? 'test-telefono-azioni: le azioni si raggiungono' : `${ko} FAIL`);
process.exit(ko ? 1 : 0);
