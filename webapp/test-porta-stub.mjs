// LO STUB DI CLOUDFLARE ACCESS: una policy finta, che si legge e si riscrive.
//
// Serve perché la porta (`webapp/worker/porta.js`) parla con l'API vera, e un
// banco che chiama l'API vera cambierebbe chi può entrare nel sito di davvero.
// Il seme che rende provabile tutto è `CF_API_BASE`: puntato qui, il Worker fa
// le stesse chiamate e noi vediamo COSA ha mandato — che è la sola cosa che
// conta, perché il difetto da prendere è «riscrive l'include da zero».
//
//   node webapp/test-porta-stub.mjs        (a mano, per guardarci dentro)
//
// oppure importato da un banco: `const s = await alzaStub(8791)`.
import http from 'node:http';

export const CRITERIO_INIZIALE = () => ({
  id: 'prova',
  name: 'Mail giocatori',
  decision: 'allow',
  include: [
    { email: { email: 'arbitro@esempio.it' } },
    // UNA VOCE CHE NON È UN'EMAIL. È qui apposta: se il Worker riscrivesse
    // l'elenco da zero la perderebbe, e chi l'aveva messa dalla dashboard se ne
    // accorgerebbe il giorno in cui qualcuno non entra più.
    { email_domain: { domain: 'esempio.it' } },
  ],
  exclude: [],
  require: [],
  session_duration: '730h',
});

export async function alzaStub(porta = 8791) {
  const stato = {
    criterio: CRITERIO_INIZIALE(),
    chiamate: [],          // { metodo, autorizzazione, corpo }
    rompi: 0,              // se > 0, risponde così invece di fare il suo lavoro
  };

  const server = http.createServer((req, res) => {
    let dati = '';
    req.on('data', (c) => { dati += c; });
    req.on('end', () => {
      const corpo = dati ? JSON.parse(dati) : null;
      stato.chiamate.push({
        metodo: req.method,
        percorso: req.url,
        autorizzazione: req.headers.authorization || null,
        corpo,
      });
      if (stato.rompi) {
        res.writeHead(stato.rompi, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
          success: false, errors: [{ code: 1010, message: 'lo stub è rotto apposta' }], result: null,
        }));
      }
      if (req.method === 'PUT') stato.criterio = { ...stato.criterio, ...corpo };
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, errors: [], messages: [], result: stato.criterio }));
    });
  });

  await new Promise((ok) => server.listen(porta, '127.0.0.1', ok));

  return {
    stato,
    emails: () => (stato.criterio.include || [])
      .map((v) => v && v.email && v.email.email).filter(Boolean),
    scritture: () => stato.chiamate.filter((c) => c.metodo === 'PUT'),
    azzera: () => { stato.chiamate.length = 0; },
    ripristina: () => { stato.criterio = CRITERIO_INIZIALE(); stato.chiamate.length = 0; stato.rompi = 0; },
    chiudi: () => new Promise((ok) => server.close(ok)),
  };
}

// lanciato a mano: resta su e stampa quel che riceve
if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`) {
  const s = await alzaStub(Number(process.env.PORTA || 8791));
  console.log('stub della porta su http://127.0.0.1:8791 — ctrl-c per chiudere');
  setInterval(() => {
    const c = s.stato.chiamate.splice(0);
    for (const x of c) console.log(x.metodo, x.percorso, JSON.stringify(x.corpo || '').slice(0, 200));
  }, 500);
}
