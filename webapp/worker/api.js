// I cinque endpoint dei salvataggi.
//
// L'email arriva gia' verificata da index.js e non e' MAI un parametro della
// richiesta: ogni query filtra per proprietario, quindi un tavolo di un altro
// account non e' raggiungibile nemmeno conoscendone l'id.
const jsonRisposta = (o, stato = 200) => Response.json(o, { status: stato });

// PROPRIETARIO oppure MEMBRO. E' il confine di fiducia dell'intera faccenda: se
// qui passa qualcuno che non dovrebbe, legge e sovrascrive le partite di un
// altro. `email` arriva verificata da index.js e non e' mai un parametro della
// richiesta.
async function mioTavolo(env, email, id) {
  if (!id) return false;
  return (await env.DB.prepare(
    `SELECT 1 FROM tavoli WHERE id = ? AND proprietario = ?
     UNION ALL
     SELECT 1 FROM membri WHERE tavolo = ? AND email = ?`)
    .bind(id, email, id, email).first()) != null;
}

// Alcune cose restano dell'ARBITRO e basta: invitare, cacciare, cancellare il
// tavolo. Un giocatore che siede a un tavolo non puo' invitarne altri.
async function arbitroDi(env, email, id) {
  if (!id) return false;
  return (await env.DB.prepare(
    `SELECT 1 FROM tavoli WHERE id = ? AND proprietario = ?
     UNION ALL
     SELECT 1 FROM membri WHERE tavolo = ? AND email = ? AND ruolo = 'arbitro'`)
    .bind(id, email, id, email).first()) != null;
}

const emailValida = (x) => typeof x === 'string' && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(x) && x.length <= 190;

export async function api(request, env, email) {
  const url = new URL(request.url);
  const p = url.pathname;
  const metodo = request.method;

  if (p === '/api/stato' && metodo === 'GET') {
    // I tavoli MIEI e quelli dove sono stato invitato, con dentro che ruolo ho
    // e quale eroe ho preso: e' cio' che serve alla schermata d'ingresso per
    // sapere se mandarmi alla plancia dell'arbitro o alla vista del mio eroe.
    const tavoli = await env.DB.prepare(
      `SELECT id, nome, creato, 'arbitro' AS ruolo, NULL AS eroe
         FROM tavoli WHERE proprietario = ?
       UNION ALL
       SELECT t.id, t.nome, t.creato, m.ruolo, m.eroe
         FROM membri m JOIN tavoli t ON t.id = m.tavolo
        WHERE m.email = ? AND t.proprietario <> ?
       ORDER BY creato`).bind(email, email, email).all();
    // senza `dati`: questa risposta serve a decidere cosa scaricare, non a
    // trascinarsi dietro tutte le partite a ogni apertura
    const salvataggi = await env.DB.prepare(
      `SELECT s.tavolo, s.episodio, s.aggiornato FROM salvataggi s
        WHERE s.tavolo IN (
          SELECT id FROM tavoli WHERE proprietario = ?
          UNION SELECT tavolo FROM membri WHERE email = ?)`)
      .bind(email, email).all();
    return jsonRisposta({ email, tavoli: tavoli.results, salvataggi: salvataggi.results });
  }

  // --------------------------------------------------------------- membri
  if (p === '/api/membri' && metodo === 'GET') {
    const tavolo = url.searchParams.get('tavolo');
    if (!(await mioTavolo(env, email, tavolo))) return jsonRisposta({ errore: 'non trovato' }, 404);
    // chi siede a questo tavolo lo vedono tutti quelli che ci siedono: sapere
    // con chi si gioca non e' un segreto
    const r = await env.DB.prepare(
      'SELECT email, nome, eroe, ruolo, invitato FROM membri WHERE tavolo = ? ORDER BY invitato')
      .bind(tavolo).all();
    return jsonRisposta({ membri: r.results });
  }

  if (p === '/api/membri' && metodo === 'POST') {
    const { tavolo, email: invitato, nome, eroe, ruolo } = await request.json();
    // INVITARE E' DELL'ARBITRO. Un giocatore seduto a un tavolo non puo'
    // portarci altri: sarebbe un tavolo che si allarga da solo.
    if (!(await arbitroDi(env, email, tavolo))) return jsonRisposta({ errore: 'non trovato' }, 404);
    if (!emailValida(invitato)) return jsonRisposta({ errore: 'email non valida' }, 400);
    if (ruolo && ruolo !== 'arbitro' && ruolo !== 'giocatore') {
      return jsonRisposta({ errore: 'ruolo sconosciuto' }, 400);
    }
    try {
      await env.DB.prepare(
        `INSERT INTO membri (tavolo, email, nome, eroe, ruolo, invitato) VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(tavolo, email) DO UPDATE
           SET nome = excluded.nome, eroe = excluded.eroe, ruolo = excluded.ruolo`)
        .bind(tavolo, invitato, (nome || '').trim() || null, eroe || null,
              ruolo || 'giocatore', Date.now()).run();
    } catch (e) {
      // l'indice unico su (tavolo, eroe) morde qui: due giocatori non possono
      // prendere lo stesso eroe, ed e' il database a dirlo, non un controllo
      // che qualcuno un giorno dimentichera' di fare
      return jsonRisposta({ errore: 'quell’eroe è già di qualcun altro a questo tavolo' }, 409);
    }
    return jsonRisposta({ ok: true });
  }

  if (p === '/api/membri' && metodo === 'DELETE') {
    const tavolo = url.searchParams.get('tavolo');
    const chi = url.searchParams.get('email');
    // l'arbitro caccia chiunque; un giocatore puo' togliere solo se stesso
    const suo = chi === email;
    if (!suo && !(await arbitroDi(env, email, tavolo))) return jsonRisposta({ errore: 'non trovato' }, 404);
    if (suo && !(await mioTavolo(env, email, tavolo))) return jsonRisposta({ errore: 'non trovato' }, 404);
    await env.DB.prepare('DELETE FROM membri WHERE tavolo = ? AND email = ?')
      .bind(tavolo, chi).run();
    return jsonRisposta({ ok: true });
  }

  if (p === '/api/tavolo' && metodo === 'POST') {
    const { id, nome } = await request.json();
    if (!id || !nome) return jsonRisposta({ errore: 'id e nome sono obbligatori' }, 400);
    await env.DB.prepare('INSERT INTO tavoli (id, proprietario, nome, creato) VALUES (?, ?, ?, ?)')
      .bind(id, email, String(nome).slice(0, 80), Date.now()).run();
    return jsonRisposta({ id });
  }

  if (p === '/api/tavolo' && metodo === 'DELETE') {
    const id = url.searchParams.get('id');
    // NON `mioTavolo`: quello include i membri, e un giocatore invitato
    // cancellerebbe la campagna di chi lo ha invitato. Cancellare un tavolo e'
    // del solo PROPRIETARIO — nemmeno di un membro con ruolo arbitro.
    const mio = (await env.DB.prepare('SELECT 1 FROM tavoli WHERE id = ? AND proprietario = ?')
      .bind(id, email).first()) != null;
    if (!mio) return jsonRisposta({ errore: 'non trovato' }, 404);
    // I salvataggi se ne vanno con lui: ON DELETE CASCADE, che in D1 morde
    // davvero (provato). Cancellare un tavolo cancella una campagna intera —
    // la domanda «sei sicuro» la fa la schermata, qui si esegue.
    await env.DB.prepare('DELETE FROM tavoli WHERE id = ? AND proprietario = ?')
      .bind(id, email).run();
    return jsonRisposta({ ok: true });
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
    // buttare via una partita e' dell'arbitro: un giocatore che si sbaglia non
    // deve poter cancellare la serata di tutti
    if (!(await arbitroDi(env, email, tavolo))) return jsonRisposta({ errore: 'non trovato' }, 404);
    await env.DB.prepare('DELETE FROM salvataggi WHERE tavolo = ? AND episodio = ?')
      .bind(tavolo, url.searchParams.get('episodio')).run();
    return jsonRisposta({ ok: true });
  }

  return jsonRisposta({ errore: 'endpoint sconosciuto' }, 404);
}
