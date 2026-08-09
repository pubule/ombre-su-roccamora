// I cinque endpoint dei salvataggi.
//
// L'email arriva gia' verificata da index.js e non e' MAI un parametro della
// richiesta: ogni query filtra per proprietario, quindi un tavolo di un altro
// account non e' raggiungibile nemmeno conoscendone l'id.
const jsonRisposta = (o, stato = 200) => Response.json(o, { status: stato });

async function mioTavolo(env, email, id) {
  if (!id) return false;
  return (await env.DB.prepare('SELECT 1 FROM tavoli WHERE id = ? AND proprietario = ?')
    .bind(id, email).first()) != null;
}

export async function api(request, env, email) {
  const url = new URL(request.url);
  const p = url.pathname;
  const metodo = request.method;

  if (p === '/api/stato' && metodo === 'GET') {
    const tavoli = await env.DB.prepare(
      'SELECT id, nome, creato FROM tavoli WHERE proprietario = ? ORDER BY creato')
      .bind(email).all();
    // senza `dati`: questa risposta serve a decidere cosa scaricare, non a
    // trascinarsi dietro tutte le partite a ogni apertura
    const salvataggi = await env.DB.prepare(
      `SELECT s.tavolo, s.episodio, s.aggiornato FROM salvataggi s
         JOIN tavoli t ON t.id = s.tavolo
        WHERE t.proprietario = ?`).bind(email).all();
    return jsonRisposta({ email, tavoli: tavoli.results, salvataggi: salvataggi.results });
  }

  if (p === '/api/tavolo' && metodo === 'POST') {
    const { id, nome } = await request.json();
    if (!id || !nome) return jsonRisposta({ errore: 'id e nome sono obbligatori' }, 400);
    await env.DB.prepare('INSERT INTO tavoli (id, proprietario, nome, creato) VALUES (?, ?, ?, ?)')
      .bind(id, email, String(nome).slice(0, 80), Date.now()).run();
    return jsonRisposta({ id });
  }

  if (p === '/api/salvataggio' && metodo === 'GET') {
    const tavolo = url.searchParams.get('tavolo');
    if (!(await mioTavolo(env, email, tavolo))) return jsonRisposta({ errore: 'non trovato' }, 404);
    const r = await env.DB.prepare(
      'SELECT tavolo, episodio, aggiornato, dati FROM salvataggi WHERE tavolo = ? AND episodio = ?')
      .bind(tavolo, url.searchParams.get('episodio')).first();
    return r ? jsonRisposta(r) : jsonRisposta({ errore: 'non trovato' }, 404);
  }

  if (p === '/api/salvataggio' && metodo === 'POST') {
    const { tavolo, episodio, aggiornato, dati } = await request.json();
    if (!(await mioTavolo(env, email, tavolo))) return jsonRisposta({ errore: 'non trovato' }, 404);
    if (!episodio || !Number.isFinite(aggiornato) || typeof dati !== 'string')
      return jsonRisposta({ errore: 'salvataggio malformato' }, 400);
    // Vince chi e' piu' recente, non chi arriva per ultimo: un pacchetto
    // rimasto in coda mentre si giocava altrove non puo' riportare indietro
    // una partita.
    await env.DB.prepare(
      `INSERT INTO salvataggi (tavolo, episodio, aggiornato, dati) VALUES (?, ?, ?, ?)
       ON CONFLICT(tavolo, episodio) DO UPDATE
         SET aggiornato = excluded.aggiornato, dati = excluded.dati
         WHERE excluded.aggiornato > salvataggi.aggiornato`)
      .bind(tavolo, episodio, aggiornato, dati).run();
    return jsonRisposta({ ok: true });
  }

  if (p === '/api/salvataggio' && metodo === 'DELETE') {
    const tavolo = url.searchParams.get('tavolo');
    if (!(await mioTavolo(env, email, tavolo))) return jsonRisposta({ errore: 'non trovato' }, 404);
    await env.DB.prepare('DELETE FROM salvataggi WHERE tavolo = ? AND episodio = ?')
      .bind(tavolo, url.searchParams.get('episodio')).run();
    return jsonRisposta({ ok: true });
  }

  return jsonRisposta({ errore: 'endpoint sconosciuto' }, 404);
}
