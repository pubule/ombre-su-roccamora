// Genera i 3 reperti stampabili dell'Episodio 1 (diario, registro, fascicolo)
// componendo lo sfondo pergamena + testo + sigillo con Playwright (screenshot di
// una pagina HTML). Testi presi 1:1 da src/gen_cards.py / src/story.py.
//
// Layout a flusso normale (niente altezze/posizioni indovinate a mano): il
// body cresce in base al contenuto (height:auto), poi si misura scrollHeight
// e si scatta esattamente quella dimensione — cosi' niente testo tagliato o
// spazi vuoti enormi quando cambiano font-size/testi.
//
// Uso: node scripts/reperti/generate-reperti.js

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

const ROOT = path.resolve(__dirname, '..', '..');
const BG = pathToFileURL(path.join(ROOT, 'artworks', 'Sfondo pergamena per i Reperti.png')).href;
// Sigillo.png (non il .jpg): gia' mascherato con alpha reale attorno alla
// forma organica della cera (stesso asset usato da deluxe_style.seal() per
// copertine/regolamento) - niente color-key o clip a cerchio qui, altrimenti
// si ritorna al vecchio artefatto: un anello piatto e uniforme attorno alla
// cera vera, dove il .jpg forzato in un cerchio perfetto tagliava nel suo
// sfondo a scacchi finto-trasparente invece che seguire il bordo del sigillo.
const SEAL = `data:image/png;base64,${fs.readFileSync(path.join(ROOT, 'artworks', 'Sigillo.png')).toString('base64')}`;
const OUT_DIR = path.join(ROOT);
fs.mkdirSync(OUT_DIR, { recursive: true });

const W = 1500;
const PAD = 190; // margine destro/di base
const PAD_LEFT = 280; // margine sinistro maggiorato: il nuovo sfondo ha una "costa"
                       // rilegata decorativa sul bordo sinistro, il testo va spostato
                       // a destra per non nascerle troppo vicino

const BASE_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=La+Belle+Aurore&family=IM+Fell+English+SC&family=Old+Standard+TT:ital,wght@0,400;0,700;1,400&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: ${W}px; }
  body { position: relative; background: url('${BG}') center top / ${W}px auto repeat-y; }
  /* Niente pannelli/alone: il testo si "brucia" nella pergamena con lo stesso
     blend mode Multiply che si userebbe in Photoshop/Photopea per un layer
     inchiostro sopra una foto (il colore scurisce in proporzione a quello che
     c'e' gia' sotto, quindi segue ombre/pieghe della carta senza bordi finti). */
  .hand, .serif, .caps { color: #3a2415; mix-blend-mode: multiply; font-weight: bold; }
  .hand { font-family: 'La Belle Aurore', cursive; }
  .serif { font-family: 'Old Standard TT', serif; }
  .caps { font-family: 'IM Fell English SC', serif; letter-spacing: 2px; text-transform: uppercase; }
  .wrap { padding: 140px ${PAD}px 140px ${PAD_LEFT}px; }
`;

function page(bodyHtml) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>${BASE_CSS}</style></head><body>${bodyHtml}</body></html>`;
}

// Retro del reperto: stampato su cartoncino, il verso si vede quando lo si
// prende in mano — solo la pergamena, niente testo/sigillo, cosi' non sembra
// un foglio bianco qualunque. Stessa larghezza e stessa altezza del fronte
// (misurata dopo il render) per restare allineato in stampa fronte/retro.
function backPage() {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: ${W}px; }
    body { background: url('${BG}') center top / ${W}px auto repeat-y; }
  </style></head><body></body></html>`;
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page_ = await browser.newPage({ viewport: { width: W, height: 2000 } });

  // --- Reperto A: diario di Ruggero ---
  const vociA = [
    "12 del mese. Stanotte di nuovo la musica. Viene da sotto la cripta, ne sono certo: il pavimento la beve e la restituisce alle mie campane. Don Callisto dice che sogno.",
    "15 del mese. Ho trovato una corda d’argento sui gradini della cripta. Non è roba da chiesa. L’ho portata a casa, Bice non deve spaventarsi.",
    "19 del mese. Il liutaio sale all’organo anche di notte, ormai. Stanotte l’ho visto uscire dalla cripta con la sua chiave. Mi ha guardato. Non ha detto nulla.",
    "21 del mese. Le mie campane suonano senza di me e io conto i rintocchi come un condannato conta i gradini. Domani scendo anch’io, e che Dio mi perdoni la curiosità.",
  ];
  const repertoA = page(`
    <div class="wrap"><div style="zoom:0.90;">
      <div class="serif" style="font-style:italic; font-size:38px; color:#3a2415; mix-blend-mode:multiply; margin-bottom:30px;">Reperto A — dal diario di Ruggero Alvise, campanaro</div>
      <div style="font-size:64px; line-height:88px;">
        ${vociA.map((v) => `<p class="hand" style="margin-bottom:30px;">${v}</p>`).join('')}
      </div>
      <div style="margin-top:100px;">
        <div class="serif" style="font-style:italic; font-size:34px; color:#4a4a4e; mix-blend-mode:multiply; margin-bottom:16px;">L’ultima pagina è strappata. Ricalcando a grafite i solchi della penna, affiora:</div>
        <div class="hand" style="font-size:64px; line-height:88px; color:#4a4a4e; mix-blend-mode:multiply;">...alle 3 in punto, ogni notte. Tre rintocchi, poi uno, poi cinque. Non sono io a suonare.</div>
      </div>
    </div></div>
  `);

  // --- Reperto B: registro consegne bottega Ferri ---
  const righeB = [
    ['3 del mese', 'sei corde di minugia, colofonia', 'Teatro dell’Eco', 'saldato'],
    ['7 del mese', 'riparazione violoncello, ponticello', 'Casa Morvilli', 'saldato'],
    ['10 del mese', 'accordatura organo — III settimana', 'Cattedrale di S. Teodoro', 'in opera'],
    ['14 del mese', 'una corda d’argento, su misura', 'commessa privata', 'ritirata'],
    ['18 del mese', 'sedici candele di cera nera', 'C.B., molo terzo', 'pagato B.F.'],
    ['21 del mese', 'quaranta candele di cera nera', 'C.B., molo terzo, il vecchio deposito', 'pagato B.F.'],
  ];
  const repertoB = page(`
    <div class="wrap"><div style="zoom:0.84;">
      <div style="text-align:center; margin-bottom:60px;">
        <div class="caps" style="font-size:68px;">bottega b. ferri · liutaio · registro delle consegne</div>
        <div class="serif" style="font-style:italic; font-size:36px; color:#3a2415; mix-blend-mode:multiply; margin-top:14px;">Reperto B — trovato aperto sul banco da lavoro</div>
      </div>
      <table style="width:100%; border-collapse:collapse; font-size:44px;">
        <thead>
          <tr class="serif" style="font-weight:bold;">
            <th style="text-align:left; border-bottom:2px solid #3a2415; padding:10px 8px; mix-blend-mode:multiply;">data</th>
            <th style="text-align:left; border-bottom:2px solid #3a2415; padding:10px 8px; mix-blend-mode:multiply;">fornitura</th>
            <th style="text-align:left; border-bottom:2px solid #3a2415; padding:10px 8px; mix-blend-mode:multiply;">destinazione</th>
            <th style="text-align:left; border-bottom:2px solid #3a2415; padding:10px 8px; mix-blend-mode:multiply;">nota</th>
          </tr>
        </thead>
        <tbody class="hand">
          ${righeB.map((r) => `<tr>${r.map((v) => `<td style="border-bottom:1px solid #3a2415; padding:20px 8px; font-size:52px; mix-blend-mode:multiply;">${v}</td>`).join('')}</tr>`).join('')}
        </tbody>
      </table>
      <div class="hand" style="margin-top:80px; font-size:56px; line-height:72px;">
        il bronzo canta, la pietra risponde, l’acqua ricorda — II mov. quasi pronto
      </div>
    </div></div>
  `);

  // --- Reperto C: fascicolo 1741 dall'Archivio Civico ---
  const decretoC = `Addì XII di novembre, l’anno del Signore MDCCXLI.<br/><br/>
Il Consiglio, udite le testimonianze de’ parroci e de’ barcaioli, <b>bandisce in perpetuo</b> la confraternita detta del <b>CORO SOMMERSO</b>, per pratiche contrarie a Dio ed alla quiete delle acque; la quale confraternita usava radunarsi nelle cavità sotto la Cattedrale, <i>dove l’acqua canta</i>, e quivi levare canti che non sono di questo mondo né per questo mondo.<br/><br/>
Si ordina: che le dette cavità siano murate; che le campane tacciano dal vespro all’alba per un anno intero; che il sigillo della confraternita — <b>un’onda incisa</b> — sia scalpellato ovunque si trovi.<br/><br/>
Chi canterà al di sotto, non si lamenti di ciò che al di sotto risponde.`;
  const consultC = [
    ['1893, marzo', 'don E. Callisto, per la parrocchia'],
    ['1901, ottobre', 'G. Morvilli, storico'],
    ['due mesi or sono', 'B. Ferri, liutaio'],
  ];
  const repertoC = page(`
    <div class="wrap"><div style="zoom:0.73;">
      <div style="text-align:center; margin-bottom:60px;">
        <div class="caps" style="font-size:64px;">atti del consiglio di roccamora · anno mdccxli</div>
        <div class="serif" style="font-style:italic; font-size:36px; color:#3a2415; mix-blend-mode:multiply; margin-top:14px;">Reperto C — fascicolo n. 44, Archivio Civico</div>
      </div>
      <div class="serif" style="font-size:54px; line-height:76px; text-align:justify;">
        ${decretoC}
      </div>
      <div style="text-align:right; margin-top:60px;">
        <img src="${SEAL}" style="width:220px; height:220px; transform:rotate(-8deg); filter:drop-shadow(0 4px 10px rgba(0,0,0,0.5));" />
      </div>
      <div style="margin-top:60px;">
        <div class="serif" style="font-weight:bold; font-size:40px; margin-bottom:24px;">SCHEDA DELLE CONSULTAZIONI — fascicolo n. 44</div>
        ${consultC.map(([dt, chi]) => `
          <div style="display:flex; border-bottom:1px solid #3a2415; padding:18px 0;">
            <div class="hand" style="width:420px; font-size:44px;">${dt}</div>
            <div class="hand" style="font-size:44px;">${chi}</div>
          </div>`).join('')}
      </div>
    </div></div>
  `);

  // --- Reperto del Preludio: registro delle consultazioni della Societa' ---
  const consultP = [
    ['1868, giugno', 'A. Morvilli, socio fondatore', 'atti del processo Dellacqua'],
    ['1871, marzo', 'M.', 'carte della Dogana Vecchia'],
    ['1874, inverno', 'M.', 'mappe dei condotti sotto la Cattedrale'],
    ['la settimana scorsa', '<i>(pagina strappata)</i>', '1741 — fascicolo della confraternita…'],
  ];
  const repertoP = page(`
    <div class="wrap"><div style="zoom:0.84;">
      <div style="text-align:center; margin-bottom:60px;">
        <div class="caps" style="font-size:60px;">società del lume · registro delle consultazioni</div>
        <div class="serif" style="font-style:italic; font-size:36px; color:#3a2415; mix-blend-mode:multiply; margin-top:14px;">Reperto A del Preludio — trovato aperto nell’archivio del palazzo</div>
      </div>
      <table style="width:100%; border-collapse:collapse; font-size:44px;">
        <thead>
          <tr class="serif" style="font-weight:bold;">
            <th style="text-align:left; border-bottom:2px solid #3a2415; padding:10px 8px; mix-blend-mode:multiply;">data</th>
            <th style="text-align:left; border-bottom:2px solid #3a2415; padding:10px 8px; mix-blend-mode:multiply;">richiedente</th>
            <th style="text-align:left; border-bottom:2px solid #3a2415; padding:10px 8px; mix-blend-mode:multiply;">fascicolo</th>
          </tr>
        </thead>
        <tbody class="hand">
          ${consultP.map((r) => `<tr>${r.map((v) => `<td style="border-bottom:1px solid #3a2415; padding:20px 8px; font-size:50px; mix-blend-mode:multiply;">${v}</td>`).join('')}</tr>`).join('')}
        </tbody>
      </table>
      <div class="serif" style="font-style:italic; margin-top:80px; font-size:36px; color:#4a4a4e; mix-blend-mode:multiply;">
        L’ultima riga si interrompe dove la pagina è stata strappata di netto. Il lembo
        rimasto trattiene mezza parola e l’inizio di un disegno a inchiostro: una linea che ondeggia.
      </div>
    </div></div>
  `);

  // --- Episodio 2, Reperto A: taccuino di collaudo di Ilario (L1) ---
  const vociA2 = [
    "Colata di saggio, ore 17. Campanella n. 1: suono pieno, coda lunga. La lega risponde.",
    "Ore 19. Campanella n. 2, dalla seconda cassa: coda corta, un sibilo sotto il colpo. Rifare il provino.",
    "Ore 20. Provino rifatto, stessa cassa. Il martello non mente.",
  ];
  const repertoA2 = page(`
    <div class="wrap"><div style="zoom:0.90;">
      <div class="serif" style="font-style:italic; font-size:38px; color:#3a2415; mix-blend-mode:multiply; margin-bottom:30px;">Reperto A — dal taccuino di collaudo di Ilario Dossena, mastro fonditore</div>
      <div style="font-size:60px; line-height:84px;">
        ${vociA2.map((v) => `<p class="hand" style="margin-bottom:30px;">${v}</p>`).join('')}
      </div>
      <div style="margin-top:90px;">
        <div class="serif" style="font-style:italic; font-size:34px; color:#4a4a4e; mix-blend-mode:multiply; margin-bottom:16px;">L’ultima nota è ripassata due volte, incisa nella carta:</div>
        <div class="hand" style="font-size:66px; line-height:90px; color:#4a4a4e; mix-blend-mode:multiply;">suono sbagliato — questa lega non è la mia.</div>
      </div>
    </div></div>
  `);

  // --- Episodio 2, Reperto B: registro delle chiatte (L8) ---
  const righeB2 = [
    ['2 del mese', 'laterizi refrattari', 'Fonderie', 'saldato'],
    ['6 del mese', 'sabbia di stampo, otto sacchi', 'Fonderie', 'saldato'],
    ['11 del mese', 'carbone di storta', 'Deposito Daziario', 'in bolla'],
    ['14 del mese', 'zavorra', 'Isola delle Scorie', 'contanti, senza mittente'],
    ['17 del mese', 'zavorra', 'Isola delle Scorie', 'contanti, senza mittente'],
  ];
  const repertoB2 = page(`
    <div class="wrap"><div style="zoom:0.84;">
      <div style="text-align:center; margin-bottom:60px;">
        <div class="caps" style="font-size:64px;">camera dei pesi e delle misure · registro delle chiatte</div>
        <div class="serif" style="font-style:italic; font-size:36px; color:#3a2415; mix-blend-mode:multiply; margin-top:14px;">Reperto B — copiato dal registro delle pese notturne</div>
      </div>
      <table style="width:100%; border-collapse:collapse; font-size:44px;">
        <thead>
          <tr class="serif" style="font-weight:bold;">
            <th style="text-align:left; border-bottom:2px solid #3a2415; padding:10px 8px; mix-blend-mode:multiply;">data</th>
            <th style="text-align:left; border-bottom:2px solid #3a2415; padding:10px 8px; mix-blend-mode:multiply;">carico</th>
            <th style="text-align:left; border-bottom:2px solid #3a2415; padding:10px 8px; mix-blend-mode:multiply;">destinazione</th>
            <th style="text-align:left; border-bottom:2px solid #3a2415; padding:10px 8px; mix-blend-mode:multiply;">nota</th>
          </tr>
        </thead>
        <tbody class="hand">
          ${righeB2.map((r) => `<tr>${r.map((v) => `<td style="border-bottom:1px solid #3a2415; padding:20px 8px; font-size:50px; mix-blend-mode:multiply;">${v}</td>`).join('')}</tr>`).join('')}
        </tbody>
      </table>
      <div class="serif" style="font-style:italic; margin-top:80px; font-size:36px; color:#4a4a4e; mix-blend-mode:multiply;">
        Una chiatta di zavorra si pesa alla partenza, mai al ritorno. Queste due
        pesavano di più al ritorno.
      </div>
    </div></div>
  `);

  // --- Episodio 2, Reperto C: la lettera di C.B. (L5) ---
  const repertoC2 = page(`
    <div class="wrap"><div style="zoom:0.90;">
      <div class="serif" style="font-style:italic; font-size:38px; color:#3a2415; mix-blend-mode:multiply; margin-bottom:60px;">Reperto C — lettera senza busta, trovata tra le ricevute del capomastro</div>
      <div class="hand" style="font-size:62px; line-height:92px;">
        <p style="margin-bottom:40px;">Al collaudo penserà il vostro mastro. Il resto a consegna.</p>
        <p style="margin-bottom:40px;">Niente nomi, niente registri: le voci costano più del bronzo.</p>
        <p style="text-align:right; margin-top:80px;">— C.B.</p>
      </div>
      <div class="serif" style="font-style:italic; margin-top:100px; font-size:36px; color:#4a4a4e; mix-blend-mode:multiply;">
        Carta buona, piegata in tre. Nessun sigillo — chi scrive così non ne ha bisogno.
      </div>
    </div></div>
  `);

  // --- Episodio 3, Reperto A: registro dei livelli del Lavatoio (L1) ---
  const righeA3 = [
    ['lunedì', 'primo: al segno', 'secondo: al segno', 'terzo: due dita SOTTO'],
    ['martedì', 'primo: al segno', 'secondo: al segno', 'terzo: al segno'],
    ['mercoledì', 'primo: al segno', 'secondo: un dito sopra', 'terzo: tre dita SOTTO'],
    ['giovedì', 'primo: al segno', 'secondo: al segno', 'terzo: al segno'],
    ['venerdì', 'primo: al segno', 'secondo: al segno', 'terzo: QUATTRO dita sotto'],
  ];
  const repertoA3 = page(`
    <div class="wrap"><div style="zoom:0.84;">
      <div style="text-align:center; margin-bottom:60px;">
        <div class="caps" style="font-size:64px;">lavatoio grande · registro dei livelli</div>
        <div class="serif" style="font-style:italic; font-size:36px; color:#3a2415; mix-blend-mode:multiply; margin-top:14px;">Reperto A — la settimana copiata dal registro della loggia</div>
      </div>
      <table style="width:100%; border-collapse:collapse; font-size:44px;">
        <tbody class="hand">
          ${righeA3.map((r) => `<tr>${r.map((v) => `<td style="border-bottom:1px solid #3a2415; padding:20px 8px; font-size:42px; white-space:nowrap; mix-blend-mode:multiply;">${v}</td>`).join('')}</tr>`).join('')}
        </tbody>
      </table>
      <div class="serif" style="font-style:italic; margin-top:80px; font-size:36px; color:#4a4a4e; mix-blend-mode:multiply;">
        Di giorno nessuno attinge dal terzo pozzo — è murato. Un pozzo murato che
        «beve» solo certe notti non sta bevendo: sta INGHIOTTENDO qualcosa che scende.
      </div>
    </div></div>
  `);

  // --- Episodio 3, Reperto B: la commissione di C.B. (L6) ---
  const repertoB3 = page(`
    <div class="wrap"><div style="zoom:0.90;">
      <div class="serif" style="font-style:italic; font-size:38px; color:#3a2415; mix-blend-mode:multiply; margin-bottom:60px;">Reperto B — commissione appesa alla lesina, bottega del lattoniere Bo</div>
      <div class="hand" style="font-size:60px; line-height:90px;">
        <p style="margin-bottom:40px;">Al mastro lattoniere. Dodici canne di piombo, misura da organo, sigillo a cera piena. Nessuna deve suonare.</p>
        <p style="margin-bottom:40px;">Ritiro a mezzo garzone, a lume spento. Il compenso è anticipato: contatelo, e non contate altro.</p>
        <p style="text-align:right; margin-top:80px;">— C.B.</p>
      </div>
      <div class="serif" style="font-style:italic; margin-top:100px; font-size:36px; color:#4a4a4e; mix-blend-mode:multiply;">
        Carta di pregio, piegata coi guanti. La stessa mano elegante che il capomastro
        della fonderia conosceva bene — e i pozzi murati del Borgo sono undici, non dodici.
      </div>
    </div></div>
  `);

  // --- Episodio 3, Reperto C: la pagina del quaderno di Tobia (L4) ---
  const repertoC3 = page(`
    <div class="wrap"><div style="zoom:0.90;">
      <div class="serif" style="font-style:italic; font-size:38px; color:#3a2415; mix-blend-mode:multiply; margin-bottom:60px;">Reperto C — pagina ricalcata a matita, dal quaderno dei pozzi di Tobia Manfredi</div>
      <div class="hand" style="font-size:62px; line-height:92px;">
        <p style="margin-bottom:40px;">Il terzo pozzo non gela mai. Non è l’acqua a scaldarlo.</p>
        <p style="margin-bottom:40px;">Sotto la corte non c’è una canna: c’è una GOLA. Le falde ci passano tutte, come corde sul ponticello.</p>
        <p style="margin-bottom:40px;">Se qualcuno la accorda, Roccamora intera fa da cassa. Per questo li hanno murati. Per questo non l’ho detto a nessuno.</p>
      </div>
      <div class="serif" style="font-style:italic; margin-top:100px; font-size:36px; color:#4a4a4e; mix-blend-mode:multiply;">
        La pagina originale è stata strappata dal quaderno. Questa è la ricalcatura
        che Tobia teneva nascosta dietro il cassetto — come chi sa di avere in casa una cosa pericolosa.
      </div>
    </div></div>
  `);

  // --- Episodio 4, Reperto A: registro delle macchine sceniche (L5) ---
  const righeA4 = [
    ['lunedì, 02:10', 'contrappeso morto', 'movimentato — kg 80', 'firma: nessuna'],
    ['martedì, 02:40', 'contrappeso morto', 'movimentato — kg 160', 'firma: nessuna'],
    ['mercoledì, 03:05', 'contrappeso morto', 'movimentato — kg 80', 'firma: nessuna'],
    ['giovedì, 02:20', 'contrappeso morto', 'movimentato — kg 160', 'firma: nessuna'],
  ];
  const repertoA4 = page(`
    <div class="wrap"><div style="zoom:0.84;">
      <div style="text-align:center; margin-bottom:60px;">
        <div class="caps" style="font-size:64px;">teatro comunale · registro delle macchine sceniche</div>
        <div class="serif" style="font-style:italic; font-size:36px; color:#3a2415; mix-blend-mode:multiply; margin-top:14px;">Reperto A — la settimana copiata dal registro del sottopalco</div>
      </div>
      <table style="width:100%; border-collapse:collapse; font-size:44px;">
        <tbody class="hand">
          ${righeA4.map((r) => `<tr>${r.map((v) => `<td style="border-bottom:1px solid #3a2415; padding:20px 8px; font-size:42px; white-space:nowrap; mix-blend-mode:multiply;">${v}</td>`).join('')}</tr>`).join('')}
        </tbody>
      </table>
      <div class="serif" style="font-style:italic; margin-top:80px; font-size:36px; color:#4a4a4e; mix-blend-mode:multiply;">
        Il contrappeso morto è fuori uso dal 1870. Ottanta chili è un uomo.
        Centosessanta sono due. E i registri, di notte, non si firmano da soli.
      </div>
    </div></div>
  `);

  // --- Episodio 4, Reperto B: la commissione del notaio (L6) ---
  const repertoB4 = page(`
    <div class="wrap"><div style="zoom:0.90;">
      <div class="serif" style="font-style:italic; font-size:38px; color:#3a2415; mix-blend-mode:multiply; margin-bottom:60px;">Reperto B — commissione trovata sotto il fermacarte, casa del maestro Alboni</div>
      <div class="hand" style="font-size:60px; line-height:90px;">
        <p style="margin-bottom:40px;">Al maestro concertatore. L’accordatura della conchiglia si compia entro la gala, pannello per pannello, a teatro chiuso.</p>
        <p style="margin-bottom:40px;">Il mio assistito ama la lirica e detesta i ritardi. I saldi dei suoi debiti restino il nostro comune segreto.</p>
        <p style="text-align:right; margin-top:80px;">— not. Grillanda, per conto del benefattore</p>
      </div>
      <div class="serif" style="font-style:italic; margin-top:100px; font-size:36px; color:#4a4a4e; mix-blend-mode:multiply;">
        Carta di pregio, piegata coi guanti: la terza volta che questa risma
        compare in un caso della Società. Il notaio firma. Il benefattore mai.
      </div>
    </div></div>
  `);

  // --- Episodio 4, Reperto C: lo spartito annotato dalla Vetri (L2) ---
  const repertoC4 = page(`
    <div class="wrap"><div style="zoom:0.90;">
      <div class="serif" style="font-style:italic; font-size:38px; color:#3a2415; mix-blend-mode:multiply; margin-bottom:60px;">Reperto C — uno dei dodici spartiti anonimi, con le annotazioni della signora Vetri</div>
      <div class="hand" style="font-size:62px; line-height:92px;">
        <p style="margin-bottom:40px;">La leggo una volta e mi resta in testa per giorni. La mia cameriera dice che la canticchio nel sonno.</p>
        <p style="margin-bottom:40px;">Io nel sonno non canto mai. Non ho MAI cantato nel sonno.</p>
        <p style="margin-bottom:40px;">E questa non è musica scritta PER me. È musica scritta DA me — che io non ho mai scritto.</p>
      </div>
      <div class="serif" style="font-style:italic; margin-top:100px; font-size:36px; color:#4a4a4e; mix-blend-mode:multiply;">
        L’inchiostro dei righi, sotto la lente, luccica: polvere di cera nera.
        La pagina non è scritta per essere letta. È scritta per trattenere.
      </div>
    </div></div>
  `);

  // --- Episodio 5, Reperto A: il registro privato di Mola (L5) ---
  const righeA5 = [
    ['9 del mese', 'casse due', 'fossa 12, fila C', 'M.d.R.'],
    ['14 del mese', 'casse tre', 'ossario, scaffale IX', 'M.d.R.'],
    ['21 del mese', 'casse due', 'ossario, scaffale XI', 'M.d.R.'],
    ['28 del mese', 'casse tre', 'fossa 31, fila F', 'M.d.R.'],
  ];
  const repertoA5 = page(`
    <div class="wrap"><div style="zoom:0.84;">
      <div style="text-align:center; margin-bottom:60px;">
        <div class="caps" style="font-size:66px;">quaderno di z. mola · conto delle consegne</div>
        <div class="serif" style="font-style:italic; font-size:36px; color:#3a2415; mix-blend-mode:multiply; margin-top:14px;">Reperto A — trovato sotto il pagliericcio, in casa del becchino</div>
      </div>
      <table style="width:100%; border-collapse:collapse; font-size:44px;">
        <tbody class="hand">
          ${righeA5.map((r) => `<tr>${r.map((v) => `<td style="border-bottom:1px solid #3a2415; padding:20px 8px; font-size:44px; white-space:nowrap; mix-blend-mode:multiply;">${v}</td>`).join('')}</tr>`).join('')}
        </tbody>
      </table>
      <div class="hand" style="margin-top:70px; font-size:56px; line-height:76px;">
        totale: ventidue. Ne mancano due. Poi basta, giuro su mia moglie: basta.
      </div>
    </div></div>
  `);

  // --- Episodio 5, Reperto B: l'autorizzazione timbrata (L6) ---
  const repertoB5 = page(`
    <div class="wrap"><div style="zoom:0.90;">
      <div class="serif" style="font-style:italic; font-size:38px; color:#3a2415; mix-blend-mode:multiply; margin-bottom:60px;">Reperto B — autorizzazione trovata sotto il tampone, studio del Maestro dei Registri</div>
      <div class="serif" style="font-size:52px; line-height:82px;">
        <p style="margin-bottom:40px; text-align:center;" class="caps">CANCELLERIA DIOCESANA — ATTI MORTUARI</p>
        <p style="margin-bottom:40px;">Si autorizza la ricognizione e traslazione delle salme giacenti presso l’Ossario Comunale, scaffali come da elenco allegato, a cura del personale incaricato.</p>
        <p style="text-align:right; margin-top:60px;" class="hand">il funzionario delegato — dott. Silvio Ordan</p>
      </div>
      <div class="serif" style="font-style:italic; margin-top:100px; font-size:36px; color:#4a4a4e; mix-blend-mode:multiply;">
        Il timbro è autentico: non esce dalla stanza del cancelliere da vent’anni.
        Il dott. Silvio Ordan non risulta in nessun annuario. Mai esistito.
      </div>
    </div></div>
  `);

  // --- Episodio 5, Reperto C: il diario di Fedele (L9) ---
  const repertoC5 = page(`
    <div class="wrap"><div style="zoom:0.90;">
      <div class="serif" style="font-style:italic; font-size:38px; color:#3a2415; mix-blend-mode:multiply; margin-bottom:60px;">Reperto C — dal diario di Fedele, custode dei Battuti, trovato nella sagrestia vecchia</div>
      <div class="hand" style="font-size:62px; line-height:92px;">
        <p style="margin-bottom:40px;">Martedì. La parete di fondo suona vuota dove ha sempre suonato piena. Non l’ho detto a nessuno.</p>
        <p style="margin-bottom:40px;">Giovedì. Di notte cantano. Non è il vento: il vento non tiene il tempo.</p>
        <p style="margin-bottom:40px;">Stanotte l’ho sentito accordarsi. Domani chiudo il muro e non lo dico a nessuno: certe porte, a denunciarle, si aprono.</p>
      </div>
      <div class="serif" style="font-style:italic; margin-top:100px; font-size:36px; color:#4a4a4e; mix-blend-mode:multiply;">
        L’ultima pagina è pulita e la calcina sulla copertina è fresca.
        Fedele è morto la mattina dopo, con la cazzuola in mano.
      </div>
    </div></div>
  `);

  // --- Episodio 6, Reperto A: il diario di lavorazione di Ferri (L5) ---
  const repertoA6 = page(`
    <div class="wrap"><div style="zoom:0.90;">
      <div class="serif" style="font-style:italic; font-size:38px; color:#3a2415; mix-blend-mode:multiply; margin-bottom:60px;">Reperto A — dal diario di lavorazione di B. Ferri, liutaio</div>
      <div class="hand" style="font-size:60px; line-height:90px;">
        <p style="margin-bottom:40px;">Il bronzo tiene. La pietra tiene. Le ossa tremano ma terranno: uno strumento imperfetto suonato bene vale uno perfetto suonato male.</p>
        <p style="margin-bottom:40px;">La solista non serve: DODICI gole in accordo la valgono. Devono valerla.</p>
        <p style="margin-bottom:40px;">Stanotte, al colmo, provo il tutti. Se la città sapesse, canterebbe con me.</p>
      </div>
      <div class="serif" style="font-style:italic; margin-top:100px; font-size:36px; color:#4a4a4e; mix-blend-mode:multiply;">
        La grafia peggiora pagina dopo pagina. Non è fretta: è febbre.
        L’ultima riga è di ieri.
      </div>
    </div></div>
  `);

  // --- Episodio 6, Reperto B: la pianta della camera (L7) ---
  const repertoB6 = page(`
    <div class="wrap"><div style="zoom:0.90;">
      <div class="serif" style="font-style:italic; font-size:38px; color:#3a2415; mix-blend-mode:multiply; margin-bottom:60px;">Reperto B — pianta allegata agli atti del capitolo, anno 1741</div>
      <div class="serif" style="font-size:50px; line-height:80px;">
        <p style="margin-bottom:40px;" class="caps">della camera delle acque e delle sue tre sale</p>
        <p style="margin-bottom:40px;">Tre sale-vestibolo custodiscono la camera: quella del bronzo, quella della pietra, quella dell’organo. Non sono stanze: sono VALVOLE.</p>
        <p style="margin-bottom:40px;">Chi voglia imporre di nuovo il sonno, taccia prima le tre valvole — indi legga la formula, a voce ferma, nell’ora in cui l’acqua è più alta.</p>
      </div>
      <div class="serif" style="font-style:italic; margin-top:100px; font-size:36px; color:#4a4a4e; mix-blend-mode:multiply;">
        In margine, a mano più recente e a matita: «pregando Iddio che mai serva».
      </div>
    </div></div>
  `);

  // --- Episodio 6, Reperto C: lo schedario della cripta (L8) ---
  const righeC6 = [
    ['coristi, dodici', 'saldati anticipati', 'vestiario compreso'],
    ['rimborso barca', 'porta d’acqua', 'ora di chiamata: 2:30'],
    ['maestranze, ultima notte', 'saldate', 'silenzio compreso'],
    ['onorario del direttore', 'NULLA', 'il direttore non lavora per denaro'],
  ];
  const repertoC6 = page(`
    <div class="wrap"><div style="zoom:0.84;">
      <div style="text-align:center; margin-bottom:60px;">
        <div class="caps" style="font-size:64px;">schedario «cripta» · conto della serata</div>
        <div class="serif" style="font-style:italic; font-size:36px; color:#3a2415; mix-blend-mode:multiply; margin-top:14px;">Reperto C — caduto dal carro del trasloco, Corte del Ragioniere</div>
      </div>
      <table style="width:100%; border-collapse:collapse; font-size:44px;">
        <tbody class="hand">
          ${righeC6.map((r) => `<tr>${r.map((v) => `<td style="border-bottom:1px solid #3a2415; padding:20px 8px; font-size:44px; mix-blend-mode:multiply;">${v}</td>`).join('')}</tr>`).join('')}
        </tbody>
      </table>
      <div class="serif" style="font-style:italic; margin-top:80px; font-size:36px; color:#4a4a4e; mix-blend-mode:multiply;">
        Quattro cantieri in cinque anni, tutti in pareggio perfetto. Il committente
        non cerca profitto: compra un risultato. E non ha fretta.
      </div>
    </div></div>
  `);


  // --- Episodio 7, Reperto A: il taccuino di Fava (L7, portineria) ---
  const repertoA7 = page(`
    <div class="wrap"><div style="zoom:0.90;">
      <div class="serif" style="font-style:italic; font-size:38px; color:#3a2415; mix-blend-mode:multiply; margin-bottom:60px;">Reperto A — dal taccuino di E. Fava, accordatore</div>
      <div class="hand" style="font-size:58px; line-height:88px;">
        <p style="margin-bottom:40px;">Il LA del Marchetti cala di un quarto di tono DENTRO il salotto nuovo. Fuori, sul pianerottolo, è giusto. Non è lo strumento. È la stanza.</p>
        <p style="margin-bottom:40px;">Le note muoiono a tre passi dalla parete di ponente. La parete BEVE.</p>
        <p style="margin-bottom:40px;">Campione preso. Polvere grigia che luccica: non è sabbia. Domani scrivo all’impresa.</p>
      </div>
      <div class="serif" style="font-style:italic; margin-top:100px; font-size:36px; color:#4a4a4e; mix-blend-mode:multiply;">
        L’ultima pagina è strappata. Sulla precedente, la pressione della
        matita: un indirizzo, e un’ora — le nove.
      </div>
    </div></div>
  `);

  // --- Episodio 7, Reperto B: il deposito del brevetto (L5) ---
  const repertoB7 = page(`
    <div class="wrap"><div style="zoom:0.90;">
      <div class="serif" style="font-style:italic; font-size:38px; color:#3a2415; mix-blend-mode:multiply; margin-bottom:60px;">Reperto B — domanda di privativa industriale n. 1117</div>
      <div class="serif" style="font-size:50px; line-height:80px;">
        <p style="margin-bottom:40px;" class="caps">intonaco fonoassorbente «voltan»</p>
        <p style="margin-bottom:40px;">Composizione: calce idraulica, sabbia di fiume, e MATERIA INERTE DI RECUPERO (non specificata — art. 12, segreto industriale).</p>
        <p style="margin-bottom:40px;">Richiedente: «La Quiete S.A.», domiciliata presso studio notarile. Spese di deposito: saldate in contanti, anticipate.</p>
      </div>
      <div class="serif" style="font-style:italic; margin-top:100px; font-size:36px; color:#4a4a4e; mix-blend-mode:multiply;">
        Il foglio di accompagnamento è carta di pregio, piegata in tre
        senza un’ombra di dita. Nessuna firma. Solo la carta.
      </div>
    </div></div>
  `);

  // --- Episodio 7, Reperto C: le bolle della calce (L6) ---
  const righeC7 = [
    ['calcina speciale, sacchi 40', 'terzo piano', 'ore 3:00 — a mano'],
    ['calcina speciale, sacchi 40', 'terzo piano', 'ore 2:30 — a mano'],
    ['viveri e candele, cesta 1', 'terzo piano', 'ore 3:00 — il capoturno NON firma'],
    ['calcina ordinaria, sacchi 12', 'piano terra', 'ore 8:00 — regolare'],
  ];
  const repertoC7 = page(`
    <div class="wrap"><div style="zoom:0.84;">
      <div style="text-align:center; margin-bottom:60px;">
        <div class="caps" style="font-size:64px;">bolle di consegna · cantiere di sant’orsola</div>
        <div class="serif" style="font-style:italic; font-size:36px; color:#3a2415; mix-blend-mode:multiply; margin-top:14px;">Reperto C — dal chiodo della baracca, ricopiate in fretta</div>
      </div>
      <table style="width:100%; border-collapse:collapse; font-size:44px;">
        <tbody class="hand">
          ${righeC7.map((r) => `<tr>${r.map((v) => `<td style="border-bottom:1px solid #3a2415; padding:20px 8px; font-size:44px; mix-blend-mode:multiply;">${v}</td>`).join('')}</tr>`).join('')}
        </tbody>
      </table>
      <div class="serif" style="font-style:italic; margin-top:80px; font-size:36px; color:#4a4a4e; mix-blend-mode:multiply;">
        Il triplo del fabbisogno, metà delle consegne di notte — e il terzo
        piano è murato da mesi. I muri non mangiano. Chi è murato, sì.
      </div>
    </div></div>
  `);


  // --- Episodio 8, Reperto A: l'inventario del tesoro (L6) ---
  const repertoA8 = page(`
    <div class="wrap"><div style="zoom:0.90;">
      <div class="serif" style="font-style:italic; font-size:38px; color:#3a2415; mix-blend-mode:multiply; margin-bottom:60px;">Reperto A — inventario del sequestro demaniale, copia del praticante</div>
      <div class="serif" style="font-size:50px; line-height:80px;">
        <p style="margin-bottom:40px;" class="caps">beni della disciolta confraternita · anno 1741</p>
        <p style="margin-bottom:40px;">Casse ventidue, once quattromila circa, in marenghi e verghe di fusione antica. Sigilli demaniali dal n. 1 al n. 22.</p>
        <p style="margin-bottom:40px;">Destinazione: deposito giudiziario. Custodia: a chi tiene le matrici dei sigilli, d’ufficio.</p>
      </div>
      <div class="hand" style="margin-top:80px; font-size:52px; line-height:78px;">
        Nota a margine, mano diversa: «il deposito non esiste più. Le casse nemmeno. Chiedere ai sigilli.»
      </div>
    </div></div>
  `);

  // --- Episodio 8, Reperto B: il fascicolo del sequestro (L7) ---
  const repertoB8 = page(`
    <div class="wrap"><div style="zoom:0.90;">
      <div class="serif" style="font-style:italic; font-size:38px; color:#3a2415; mix-blend-mode:multiply; margin-bottom:60px;">Reperto B — dal fascicolo del sequestro, Archivio Demaniale</div>
      <div class="serif" style="font-size:50px; line-height:80px;">
        <p style="margin-bottom:40px;" class="caps">verbale di apposizione dei sigilli · 1741</p>
        <p style="margin-bottom:40px;">Si attesta l’apposizione dei sigilli demaniali nn. 1-22 alle casse della disciolta confraternita, alla presenza dell’esattore capo.</p>
        <p style="margin-bottom:40px;">Le matrici seguono la carica, non l’archivio: passano d’ufficio a chi eredita la funzione.</p>
      </div>
      <div class="serif" style="font-style:italic; margin-top:100px; font-size:36px; color:#4a4a4e; mix-blend-mode:multiply;">
        I sigilli sul faldone sono scaduti da un secolo. La ceralacca di due
        di essi è fresca: lucida, elastica, di quest’anno.
      </div>
    </div></div>
  `);

  // --- Episodio 8, Reperto C: le bolle del carbone (L5) ---
  const righeC8 = [
    ['carbone da forgia, sacchi 30', 'molo in disarmo', 'giovedì, ore 23 — coi cani'],
    ['carbone da forgia, sacchi 30', 'molo in disarmo', 'giovedì, ore 23 — coi cani'],
    ['carbone da stufa, sacchi 8', 'Monte di Pietà', 'martedì, ore 8 — regolare'],
    ['carbone da forgia, sacchi 30', 'molo in disarmo', 'giovedì, ore 23 — coi cani'],
  ];
  const repertoC8 = page(`
    <div class="wrap"><div style="zoom:0.84;">
      <div style="text-align:center; margin-bottom:60px;">
        <div class="caps" style="font-size:64px;">bolle del carbone · carbonaia del porto</div>
        <div class="serif" style="font-style:italic; font-size:36px; color:#3a2415; mix-blend-mode:multiply; margin-top:14px;">Reperto C — dal chiodo della carbonaia, ricopiate in fretta</div>
      </div>
      <table style="width:100%; border-collapse:collapse; font-size:44px;">
        <tbody class="hand">
          ${righeC8.map((r) => `<tr>${r.map((v) => `<td style="border-bottom:1px solid #3a2415; padding:20px 8px; font-size:44px; mix-blend-mode:multiply;">${v}</td>`).join('')}</tr>`).join('')}
        </tbody>
      </table>
      <div class="serif" style="font-style:italic; margin-top:80px; font-size:36px; color:#4a4a4e; mix-blend-mode:multiply;">
        Carbone da forgia, il triplo del fabbisogno di un porto senza
        fonderie. E il carro del giovedì torna scarico ma pesante: il
        carbone non piega le assi. L’oro sì.
      </div>
    </div></div>
  `);


  // --- Episodio 9, Reperto A: il verbale della ritrattazione (L6) ---
  const repertoA9 = page(`
    <div class="wrap"><div style="zoom:0.88;">
      <div class="serif" style="font-style:italic; font-size:38px; color:#3a2415; mix-blend-mode:multiply; margin-bottom:50px;">Reperto A — verbale di ritrattazione (bozza)</div>
      <div class="serif" style="font-size:46px; line-height:72px;">
        <p style="margin-bottom:34px;" class="caps">deposizione del teste anselmo riva</p>
        <p style="margin-bottom:34px;">Il sottoscritto dichiara di aver ERRATO nel riferire quanto visto la notte in questione; di non aver scorto alcuna imbarcazione sotto la Cattedrale; e di rimettersi al giudizio della Corte.</p>
      </div>
      <div style="margin-top:70px; font-size:44px;">
        <p class="serif">Data: <b>__ del mese corrente</b> (domani)</p>
        <p class="serif" style="margin-top:30px;">Firma del teste: <span style="border-bottom:2px solid #3a2415; display:inline-block; width:400px;">&nbsp;</span></p>
      </div>
      <div class="serif" style="font-style:italic; margin-top:70px; font-size:34px; color:#4a4a4e; mix-blend-mode:multiply;">
        Battuto a macchina PRIMA che Riva l’abbia firmato — anzi, prima che
        l’abbiano convinto. Il foglio bianco per la firma è un atto di fede
        in un sicario.
      </div>
    </div></div>
  `);

  // --- Episodio 9, Reperto B: la parcella dell'avvocato (L5) ---
  const repertoB9 = page(`
    <div class="wrap"><div style="zoom:0.90;">
      <div class="serif" style="font-style:italic; font-size:38px; color:#3a2415; mix-blend-mode:multiply; margin-bottom:60px;">Reperto B — nota d’onorario, avv. T. Grassi</div>
      <div class="serif" style="font-size:48px; line-height:76px;">
        <p style="margin-bottom:36px;">Per la difesa nel procedimento dei fatti dell’inverno: <b>onorario saldato in acconto</b>.</p>
        <p style="margin-bottom:36px;">Pagatore: «Pio Fondo di Carità Cittadina» (senza altra indicazione).</p>
        <p style="margin-bottom:36px;">Modalità: <b>numerario</b> — marenghi d’oro, consegna a mano.</p>
      </div>
      <div class="serif" style="font-style:italic; margin-top:90px; font-size:34px; color:#4a4a4e; mix-blend-mode:multiply;">
        L’oro è la lega dell’ansa morta; la busta è piegata in tre, senza
        un’ombra di dita, coi guanti. Chi paga l’avvocato paga anche i clan:
        un solo portafoglio.
      </div>
    </div></div>
  `);

  // --- Episodio 9, Reperto C: il biglietto di C.B. (L8) ---
  const repertoC9 = page(`
    <div class="wrap"><div style="zoom:0.94;">
      <div class="serif" style="font-style:italic; font-size:38px; color:#3a2415; mix-blend-mode:multiply; margin-bottom:80px;">Reperto C — biglietto trovato nel cestino della Locanda del Forestiero</div>
      <div class="hand" style="font-size:66px; line-height:104px;">
        <p style="margin-bottom:50px;">Che sia PULITO.</p>
        <p style="margin-bottom:50px;">Il teste non deve avere un volto sui giornali di domani, solo un’assenza.</p>
        <p style="text-align:right; margin-top:70px;">— M.</p>
      </div>
      <div class="serif" style="font-style:italic; margin-top:90px; font-size:34px; color:#4a4a4e; mix-blend-mode:multiply;">
        Carta di pregio, filigrana della cartiera dei casi passati; la «M.»
        ha il ricciolo del Tessitore. La stessa mano che scrive le vostre
        lettere d’incarico scrive gli ordini a chi vi dà la caccia.
      </div>
    </div></div>
  `);

  // --- Episodio 10, Reperto A: la denuncia di abbandono del 1879 (L3) ---
  const repertoA10 = page(`
    <div class="wrap"><div style="zoom:0.88;">
      <div class="serif" style="font-style:italic; font-size:38px; color:#3a2415; mix-blend-mode:multiply; margin-bottom:44px;">Reperto A — denuncia di abbandono del tetto coniugale (Archivio Civico, 1879)</div>
      <div class="serif" style="font-size:46px; line-height:72px;">
        <p style="margin-bottom:32px;">Il sottoscritto <b>Corrado Malfanti</b> dichiara che la moglie <b>Ada</b> ha abbandonato il tetto coniugale, allontanandosi di sua volontà e senza far ritorno.</p>
        <p style="margin-bottom:32px;">Chiede che ne sia presa nota agli atti.</p>
      </div>
      <div style="margin-top:60px; font-size:44px;">
        <p class="serif">Data della denuncia: <b>il quarto giorno</b> dalla scomparsa.</p>
        <p class="serif" style="margin-top:26px;">Firma: <span class="hand" style="font-size:52px;">Corrado Malfanti</span></p>
      </div>
      <div class="serif" style="font-style:italic; margin-top:64px; font-size:34px; color:#4a4a4e; mix-blend-mode:multiply;">
        L’inchiostro è premuto forte, la mano recita. Quattro giorni: nessuno
        denuncia così in fretta un abbandono che spera passeggero — si
        denuncia così in fretta solo ciò che si è già fatto sparire.
      </div>
    </div></div>
  `);

  // --- Episodio 10, Reperto B: il libro mastro della muratura (L5) ---
  const repertoB10 = page(`
    <div class="wrap"><div style="zoom:0.90;">
      <div class="serif" style="font-style:italic; font-size:38px; color:#3a2415; mix-blend-mode:multiply; margin-bottom:56px;">Reperto B — libro mastro di B. Sassi, muratore</div>
      <div class="serif" style="font-size:46px; line-height:74px;">
        <p style="margin-bottom:32px;"><b>1879</b> — Corte della Faenza: chiudere il vano piccolo, primo piano. <i>Pagato in contanti. Non registrare.</i></p>
        <p style="margin-bottom:32px; border-top:2px solid #6b5636; padding-top:32px;"><b>ieri</b> — tornare ad aprire lo stesso vano. Malfanti insiste. Prima dell’alba, dalla cantina.</p>
      </div>
      <div class="serif" style="font-style:italic; margin-top:80px; font-size:34px; color:#4a4a4e; mix-blend-mode:multiply;">
        La stessa mano, dieci anni dopo, costretta a disfare quel che murò.
        Chi chiude un vano «e non registra» sa di murare qualcosa che non è
        calce.
      </div>
    </div></div>
  `);

  // --- Episodio 10, Reperto C: la commessa del fornitore (L8) — il SEME ---
  const repertoC10 = page(`
    <div class="wrap"><div style="zoom:0.92;">
      <div class="serif" style="font-style:italic; font-size:38px; color:#3a2415; mix-blend-mode:multiply; margin-bottom:64px;">Reperto C — commessa di fornitura (Borgo delle Cisterne)</div>
      <div class="serif" style="font-size:48px; line-height:78px;">
        <p style="margin-bottom:34px;">Fornitura: <b>sabbia scelta del Borgo delle Cisterne</b>, per restauri in città.</p>
        <p style="margin-bottom:34px;">Pagamento: <b>in anticipo</b>, a mezzo lettera. Consegne su indicazione.</p>
      </div>
      <div class="hand" style="font-size:64px; line-height:100px; margin-top:50px; text-align:right;">
        <p>— C.B.</p>
      </div>
      <div class="serif" style="font-style:italic; margin-top:70px; font-size:34px; color:#4a4a4e; mix-blend-mode:multiply;">
        Carta di pregio, filigrana della cartiera dei casi passati; la sabbia
        pagata prima ancora d’essere cavata. Chi sceglie i materiali sceglie
        che cosa la città ricorderà.
      </div>
    </div></div>
  `);

  // --- Episodio 11, Reperto A: il taccuino delle misure (L1) ---
  const repertoA11 = page(`
    <div class="wrap"><div style="zoom:0.90;">
      <div class="serif" style="font-style:italic; font-size:38px; color:#3a2415; mix-blend-mode:multiply; margin-bottom:44px;">Reperto A — taccuino di rilievo di E. Ratti (pagine sciolte)</div>
      <div class="serif" style="font-size:44px; line-height:70px;">
        <p style="margin-bottom:28px;">fontana del chiostro → portico, <b>40 passi</b> — <i>bassa marea</i></p>
        <p style="margin-bottom:28px;">campanile S. Teodoro → tetti, quota — <i>ora d’accordatura</i></p>
        <p style="margin-bottom:28px; border-top:2px solid #6b5636; padding-top:28px;">Torre Civica → <b>Cattedrale</b>: convergenza. <span class="hand" style="font-size:50px;">è QUI</span></p>
      </div>
      <div class="serif" style="font-style:italic; margin-top:64px; font-size:34px; color:#4a4a4e; mix-blend-mode:multiply;">
        Pagine senza data, prese a caso non chiudono. Datate con la marea e le
        campane, trovano un ordine — e l’ordine punta tutto allo stesso vuoto.
      </div>
    </div></div>
  `);

  // --- Episodio 11, Reperto B: la mappa parziale (L3) ---
  const repertoB11 = page(`
    <div class="wrap"><div style="zoom:0.90;">
      <div class="serif" style="font-style:italic; font-size:38px; color:#3a2415; mix-blend-mode:multiply; margin-bottom:56px;">Reperto B — riporto delle misure sulla pianta civica</div>
      <div class="serif" style="font-size:46px; line-height:74px;">
        <p style="margin-bottom:32px;">Linee di rilievo tracciate da campanili, fontane e portici: tutte convergono in un solo fuoco.</p>
        <p style="margin-bottom:32px; border-top:2px solid #6b5636; padding-top:32px;">Il fuoco cade <b>sotto la navata della Cattedrale</b> — dove la pianta ufficiale non segna nulla.</p>
      </div>
      <div class="serif" style="font-style:italic; margin-top:80px; font-size:34px; color:#4a4a4e; mix-blend-mode:multiply;">
        Non è un censimento di campane: è un rilievo di puntamento. Qualcuno
        vuole sapere al palmo dove si trova un vuoto che le mappe negano.
      </div>
    </div></div>
  `);

  // --- Episodio 11, Reperto C: la commessa del rilievo (L5) — il SEME ---
  const repertoC11 = page(`
    <div class="wrap"><div style="zoom:0.92;">
      <div class="serif" style="font-style:italic; font-size:38px; color:#3a2415; mix-blend-mode:multiply; margin-bottom:64px;">Reperto C — commessa di rilievo fonico (studio corrispondente)</div>
      <div class="serif" style="font-size:48px; line-height:78px;">
        <p style="margin-bottom:34px;">Incarico: <b>censimento fonico di Roccamora</b> — campane, organi, fontane.</p>
        <p style="margin-bottom:34px;">Pagamento: <b>in anticipo</b>, a mezzo lettera. Consegne al fermo-posta indicato.</p>
      </div>
      <div class="hand" style="font-size:64px; line-height:100px; margin-top:50px; text-align:right;">
        <p>— C.B.</p>
      </div>
      <div class="serif" style="font-style:italic; margin-top:70px; font-size:34px; color:#4a4a4e; mix-blend-mode:multiply;">
        Carta di pregio, filigrana della cartiera dei casi passati; il rilievo
        pagato prima di cominciare. Non uno studio: una penna sola, che accorda
        la città come uno strumento prima del concerto.
      </div>
    </div></div>
  `);

  // --- Episodio 12, Reperto A: la perizia dei sigilli (L1) ---
  const repertoA12 = page(`
    <div class="wrap"><div style="zoom:0.90;">
      <div class="serif" style="font-style:italic; font-size:38px; color:#3a2415; mix-blend-mode:multiply; margin-bottom:44px;">Reperto A — perizia dei sigilli (Palazzo del Lume)</div>
      <div class="serif" style="font-size:46px; line-height:72px;">
        <p style="margin-bottom:30px;">Ceralacca <b>mai scaldata due volte</b>. Punzoni originali della Società. Serrature <b>vergini</b>.</p>
        <p style="margin-bottom:30px; border-top:2px solid #6b5636; padding-top:30px;">Nessuna traccia di apertura forzata. I Frammenti sono stati copiati e <b>richiusi da chi aveva le chiavi</b>.</p>
      </div>
      <div class="serif" style="font-style:italic; margin-top:64px; font-size:34px; color:#4a4a4e; mix-blend-mode:multiply;">
        Non è entrato nessuno: è uscito qualcosa, per la porta principale.
        Cercare uno scassinatore è guardare il fantasma sbagliato.
      </div>
    </div></div>
  `);

  // --- Episodio 12, Reperto B: la pagina ricopiata (L6) ---
  const repertoB12 = page(`
    <div class="wrap"><div style="zoom:0.90;">
      <div class="serif" style="font-style:italic; font-size:38px; color:#3a2415; mix-blend-mode:multiply; margin-bottom:56px;">Reperto B — Frammento e copia, a confronto</div>
      <div class="serif" style="font-size:46px; line-height:74px;">
        <p style="margin-bottom:32px;">A sinistra il Frammento originale; a destra la copia. La mano è <b>identica</b>: nessun tremore, nessuna esitazione di falsario.</p>
        <p style="margin-bottom:32px; border-top:2px solid #6b5636; padding-top:32px;">Non un’imitazione: <b>la stessa mano</b>. E in calce, l’ordine protocollato che la dispose.</p>
      </div>
      <div class="serif" style="font-style:italic; margin-top:76px; font-size:34px; color:#4a4a4e; mix-blend-mode:multiply;">
        O il falsario è il più grande mai visto, o non è un falsario.
        Nessuno protocolla un tradimento: si protocolla una «routine».
      </div>
    </div></div>
  `);

  // --- Episodio 12, Reperto C: la ricevuta del fermo-posta (L3) — il SEME ---
  const repertoC12 = page(`
    <div class="wrap"><div style="zoom:0.92;">
      <div class="serif" style="font-style:italic; font-size:38px; color:#3a2415; mix-blend-mode:multiply; margin-bottom:64px;">Reperto C — ricevuta di fermo-posta</div>
      <div class="serif" style="font-size:48px; line-height:78px;">
        <p style="margin-bottom:34px;">Casella intestata a: <b>B. Camillo</b>. Ritiri notturni, regolari.</p>
        <p style="margin-bottom:34px;">Pagamento: <b>in anticipo</b>, a mezzo lettera. Contenuto: copie e Frammenti.</p>
      </div>
      <div class="hand" style="font-size:64px; line-height:100px; margin-top:50px; text-align:right;">
        <p>— C.B.</p>
      </div>
      <div class="serif" style="font-style:italic; margin-top:70px; font-size:34px; color:#4a4a4e; mix-blend-mode:multiply;">
        Carta di pregio, filigrana della cartiera dei casi passati. «B. Camillo»
        non è un nome: è un’etichetta. Il compratore delle copie e il padrone
        delle scatole vuote sono la stessa penna.
      </div>
    </div></div>
  `);

  const items = [
    ['Episodio 1', 'Reperto A - Diario di Ruggero', repertoA],
    ['Episodio 1', 'Reperto B - Registro delle Consegne', repertoB],
    ['Episodio 1', 'Reperto C - Fascicolo del 1741', repertoC],
    ['Preludio', 'Registro delle Consultazioni', repertoP],
    ['Episodio 2', 'Reperto A - Taccuino di Collaudo', repertoA2],
    ['Episodio 2', 'Reperto B - Registro delle Chiatte', repertoB2],
    ['Episodio 2', 'Reperto C - Lettera di C.B.', repertoC2],
    ['Episodio 3', 'Reperto A - Registro dei Livelli', repertoA3],
    ['Episodio 3', 'Reperto B - Commissione di C.B.', repertoB3],
    ['Episodio 3', 'Reperto C - Pagina del Quaderno', repertoC3],
    ['Episodio 4', 'Reperto A - Registro delle Macchine', repertoA4],
    ['Episodio 4', 'Reperto B - Commissione del Notaio', repertoB4],
    ['Episodio 4', 'Reperto C - Spartito Annotato', repertoC4],
    ['Episodio 5', 'Reperto A - Registro di Mola', repertoA5],
    ['Episodio 5', 'Reperto B - Autorizzazione Timbrata', repertoB5],
    ['Episodio 5', 'Reperto C - Diario di Fedele', repertoC5],
    ['Episodio 6', 'Reperto A - Diario di Ferri', repertoA6],
    ['Episodio 6', 'Reperto B - Pianta della Camera', repertoB6],
    ['Episodio 6', 'Reperto C - Schedario della Cripta', repertoC6],
    ['Episodio 7', 'Reperto A - Taccuino di Fava', repertoA7],
    ['Episodio 7', 'Reperto B - Deposito del Brevetto', repertoB7],
    ['Episodio 7', 'Reperto C - Bolle della Calce', repertoC7],
    ['Episodio 8', 'Reperto A - Inventario del Tesoro', repertoA8],
    ['Episodio 8', 'Reperto B - Fascicolo del Sequestro', repertoB8],
    ['Episodio 8', 'Reperto C - Bolle del Carbone', repertoC8],
    ['Episodio 9', 'Reperto A - Verbale della Ritrattazione', repertoA9],
    ['Episodio 9', 'Reperto B - Parcella dell’Avvocato', repertoB9],
    ['Episodio 9', 'Reperto C - Biglietto di C.B.', repertoC9],
    ['Episodio 10', 'Reperto A - Denuncia di Abbandono', repertoA10],
    ['Episodio 10', 'Reperto B - Libro Mastro della Muratura', repertoB10],
    ['Episodio 10', 'Reperto C - Commessa del Fornitore', repertoC10],
    ['Episodio 11', 'Reperto A - Taccuino delle Misure', repertoA11],
    ['Episodio 11', 'Reperto B - Mappa Parziale', repertoB11],
    ['Episodio 11', 'Reperto C - Commessa del Rilievo', repertoC11],
    ['Episodio 12', 'Reperto A - Perizia dei Sigilli', repertoA12],
    ['Episodio 12', 'Reperto B - Pagina Ricopiata', repertoB12],
    ['Episodio 12', 'Reperto C - Ricevuta del Fermo-Posta', repertoC12],
  ];

  for (const [episodio, name, html] of items) {
    const episodioDir = path.join(OUT_DIR, episodio, 'reperti');
    fs.mkdirSync(episodioDir, { recursive: true });
    // page.setContent() gira su origin about:blank, che Chromium non lascia
    // caricare risorse file:// (sfondo/sigillo restavano bianchi). Scrivendo
    // l'HTML su disco e navigandoci, l'origin diventa file:// e le immagini
    // locali si caricano normalmente.
    const tmpHtml = path.join(episodioDir, `.tmp-${name}.html`);
    fs.writeFileSync(tmpHtml, html, 'utf8');
    await page_.goto(pathToFileURL(tmpHtml).href, { waitUntil: 'networkidle' });
    await page_.evaluate(() => document.fonts.ready);
    await page_.waitForTimeout(300);
    // Layout a flusso: il body non ha altezza fissata, cresce col contenuto.
    // Si misura scrollHeight DOPO il render e si adatta il viewport, cosi'
    // lo screenshot prende esattamente tutto il contenuto (niente tagli,
    // niente spazio vuoto indovinato a mano).
    const contentHeight = await page_.evaluate(() => document.body.scrollHeight);
    await page_.setViewportSize({ width: W, height: contentHeight });
    await page_.waitForTimeout(100);
    const outPath = path.join(episodioDir, `${name}.png`);
    await page_.screenshot({ path: outPath });
    fs.unlinkSync(tmpHtml);
    console.log('ok ->', outPath, `(${contentHeight}px)`);

    // retro, stessa taglia del fronte appena misurato
    const tmpBackHtml = path.join(episodioDir, `.tmp-${name}-retro.html`);
    fs.writeFileSync(tmpBackHtml, backPage(), 'utf8');
    await page_.goto(pathToFileURL(tmpBackHtml).href, { waitUntil: 'networkidle' });
    await page_.waitForTimeout(100);
    const backOutPath = path.join(episodioDir, `${name} (retro).png`);
    await page_.screenshot({ path: backOutPath });
    fs.unlinkSync(tmpBackHtml);
    console.log('ok ->', backOutPath, `(${contentHeight}px)`);
  }

  await browser.close();
})();
