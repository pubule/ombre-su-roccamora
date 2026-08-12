// LA PORTA DEL TAVOLO: chi sei, e a che posto siedi.
//
// Sta fra Access e il Durable Object, e fa una cosa sola ma è quella che tiene
// in piedi tutto il resto: stabilisce il POSTO di chi bussa, leggendolo da
// `membri`, e lo passa al tavolo negli header.
//
// Il posto NON arriva mai dal client. Se arrivasse, chiunque potrebbe
// dichiararsi arbitro e farsi mandare la soluzione — la proiezione filtra in
// base al posto, e un posto che si autodichiara non filtra niente.
//
//   /api/tavolo/<id>/ws        il canale
//   /api/tavolo/<id>/comando   una mossa
//   /api/tavolo/<id>/stato     la fotografia
//   /api/tavolo/<id>/apri      comincia o riprende (solo arbitro)

const nonTrovato = () => Response.json({ errore: 'non trovato' }, { status: 404 });

// Il posto di questa email a questo tavolo. `null` = non ci siede.
async function postoDi(env, email, id) {
  const proprietario = await env.DB.prepare(
    'SELECT 1 FROM tavoli WHERE id = ? AND proprietario = ?').bind(id, email).first();
  if (proprietario) return { ruolo: 'arbitro', eroe: null, email };

  const m = await env.DB.prepare(
    'SELECT ruolo, eroe FROM membri WHERE tavolo = ? AND email = ?').bind(id, email).first();
  if (!m) return null;
  return { ruolo: m.ruolo === 'arbitro' ? 'arbitro' : 'giocatore', eroe: m.eroe || null, email };
}

export async function tavolo(request, env, email) {
  const url = new URL(request.url);
  // /api/tavolo/<id>/<cosa>
  const pezzi = url.pathname.split('/').filter(Boolean);   // api, tavolo, <id>, <cosa>
  const id = pezzi[2];
  const cosa = pezzi[3];
  if (!id || !cosa) return nonTrovato();

  const posto = await postoDi(env, email, id);
  // 404 e non 403: a chi non siede a questo tavolo non si dice nemmeno che
  // esiste — è la stessa scelta degli altri endpoint
  if (!posto) return nonTrovato();
  if (cosa === 'apri' && posto.ruolo !== 'arbitro') return nonTrovato();

  // Una partita, un oggetto: `idFromName` sull'id del tavolo manda tutte le
  // richieste della stessa serata sullo stesso Durable Object, in ordine.
  const stub = env.PARTITA.get(env.PARTITA.idFromName(id));

  const avanti = new Request(`https://tavolo/${cosa}`, request);
  avanti.headers.set('X-Osr-Ruolo', posto.ruolo);
  avanti.headers.set('X-Osr-Eroe', posto.eroe || '');
  avanti.headers.set('X-Osr-Email', posto.email);
  return stub.fetch(avanti);
}
