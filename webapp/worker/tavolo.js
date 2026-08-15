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
//
// UN POSTO, PIU' EROI. Dal 15/08/2026 un dispositivo puo' giocarne piu' d'uno —
// due amici con un iPad solo — quindi il posto porta un INSIEME. Chi arbitra
// resta senza: li tiene tutti per definizione, e una lista non direbbe niente
// di piu' del suo ruolo.
async function postoDi(env, email, id) {
  const proprietario = await env.DB.prepare(
    'SELECT 1 FROM tavoli WHERE id = ? AND proprietario = ?').bind(id, email).first();
  if (proprietario) return { ruolo: 'arbitro', eroi: [], email };

  const m = await env.DB.prepare(
    'SELECT ruolo FROM membri WHERE tavolo = ? AND email = ?').bind(id, email).first();
  if (!m) return null;
  const r = await env.DB.prepare(
    'SELECT eroe FROM eroi_posto WHERE tavolo = ? AND email = ? ORDER BY eroe').bind(id, email).all();
  return { ruolo: m.ruolo === 'arbitro' ? 'arbitro' : 'giocatore',
           eroi: (r.results || []).map((x) => x.eroe), email };
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
  // in JSON perche' ora sono piu' d'uno. I nomi hanno le virgolette curve
  // («NINO “GRIMALDELLO” CAUTO») e passavano gia' in un header prima d'oggi:
  // cambia la forma, non quel che ci sta dentro.
  avanti.headers.set('X-Osr-Eroi', JSON.stringify(posto.eroi || []));
  avanti.headers.set('X-Osr-Email', posto.email);
  return stub.fetch(avanti);
}
