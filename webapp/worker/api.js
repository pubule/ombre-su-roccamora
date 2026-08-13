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
      `SELECT id, nome, creato, party, 'arbitro' AS ruolo, NULL AS eroe
         FROM tavoli WHERE proprietario = ?
       UNION ALL
       SELECT t.id, t.nome, t.creato, t.party, m.ruolo, m.eroe
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

  // PRENDERSI UN EROE. Il posto e' tuo, e quale eroe giochi lo decidi tu: e' la
  // cosa che lo schema prevedeva fin dall'inizio («`eroe` NULL finche' non
  // sceglie») e che mancava — finche' non c'e' stata, sceglieva l'arbitro per
  // tutti, uno per uno, prima di ogni serata.
  //
  // Si scrive SOLO il proprio posto: il tavolo a cui si siede lo decide chi
  // arbitra, l'eroe lo si prende da soli. E solo fra quelli della compagnia e
  // solo se libero — l'indice unico su (tavolo, eroe) morde comunque, ma un
  // rifiuto in chiaro e' meglio di un errore di database.
  if (p === '/api/mio-eroe' && metodo === 'PUT') {
    const { tavolo, eroe } = await request.json();
    const mio = await env.DB.prepare('SELECT 1 FROM membri WHERE tavolo = ? AND email = ?')
      .bind(tavolo, email).first();
    if (!mio) return jsonRisposta({ errore: 'non trovato' }, 404);
    if (eroe) {
      const t = await env.DB.prepare('SELECT party FROM tavoli WHERE id = ?').bind(tavolo).first();
      const party = t && t.party ? JSON.parse(t.party) : null;
      if (!party || !party.length) {
        return jsonRisposta({ errore: 'chi arbitra non ha ancora scelto la compagnia' }, 409);
      }
      if (!party.includes(eroe)) {
        return jsonRisposta({ errore: 'quell’eroe non è nella compagnia di questo tavolo' }, 400);
      }
      const preso = await env.DB.prepare(
        'SELECT 1 FROM membri WHERE tavolo = ? AND eroe = ? AND email <> ?')
        .bind(tavolo, eroe, email).first();
      if (preso) return jsonRisposta({ errore: 'quell’eroe l’ha già preso qualcun altro' }, 409);
    }
    await env.DB.prepare('UPDATE membri SET eroe = ? WHERE tavolo = ? AND email = ?')
      .bind(eroe || null, tavolo, email).run();
    return jsonRisposta({ ok: true });
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
    // L'EROE DEV'ESSERE DELLA COMPAGNIA. Assegnarne uno fuori squadra dava un
    // posto muto: il motore rifiuta i suoi comandi con «non e' in questa
    // squadra» e sul telefono non si accende mai niente — nessun errore,
    // nessuna spiegazione. Se il tavolo non ha ancora un party non si vincola
    // nulla: si sta ancora componendo la compagnia.
    if (eroe) {
      const t = await env.DB.prepare('SELECT party FROM tavoli WHERE id = ?').bind(tavolo).first();
      const party = t && t.party ? JSON.parse(t.party) : null;
      if (party && !party.includes(eroe)) {
        return jsonRisposta({ errore: 'quell’eroe non è nella compagnia di questo tavolo' }, 400);
      }
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

  // LE SCELTE DEI BIVI. Appartengono alla campagna, non alla serata: una scelta
  // dell'Ep.8 pesa fino all'Ep.20, quindi non puo' vivere nel blob di un
  // episodio. Le legge chiunque sieda al tavolo — sapere che strada ha preso il
  // gruppo non e' un segreto — e le scrive chi arbitra, perche' e' lui che
  // sigilla il Frammento a fine serata.
  if (p === '/api/scelte' && metodo === 'GET') {
    const tavolo = url.searchParams.get('tavolo');
    if (!(await mioTavolo(env, email, tavolo))) return jsonRisposta({ errore: 'non trovato' }, 404);
    const r = await env.DB.prepare(
      'SELECT bivio, opzione, quando FROM scelte_campagna WHERE tavolo = ? ORDER BY quando')
      .bind(tavolo).all();
    return jsonRisposta({ scelte: r.results });
  }

  if (p === '/api/scelte' && metodo === 'PUT') {
    const { tavolo, bivio, opzione } = await request.json();
    if (!(await arbitroDi(env, email, tavolo))) return jsonRisposta({ errore: 'non trovato' }, 404);
    if (!bivio || !opzione) return jsonRisposta({ errore: 'servono bivio e opzione' }, 400);
    await env.DB.prepare(
      `INSERT INTO scelte_campagna (tavolo, bivio, opzione, quando) VALUES (?, ?, ?, ?)
       ON CONFLICT(tavolo, bivio) DO UPDATE SET opzione = excluded.opzione, quando = excluded.quando`)
      .bind(tavolo, bivio, opzione, Date.now()).run();
    return jsonRisposta({ ok: true });
  }

  // IL PARTY DEL TAVOLO — gli eroi di questa campagna, scelti una volta e poi
  // sempre quelli. Cambiarlo e' del solo PROPRIETARIO: e' la composizione della
  // compagnia, non una preferenza di serata.
  //
  // NB: sta sotto `/api/party` e non `/api/tavolo/party` — tutto quel che
  // comincia per `/api/tavolo/` lo instrada `index.js` verso il Durable Object
  // della partita viva, e questo finirebbe li' invece che qui.
  if (p === '/api/party' && metodo === 'PUT') {
    const { tavolo, party } = await request.json();
    const mio = (await env.DB.prepare('SELECT 1 FROM tavoli WHERE id = ? AND proprietario = ?')
      .bind(tavolo, email).first()) != null;
    if (!mio) return jsonRisposta({ errore: 'non trovato' }, 404);
    if (!Array.isArray(party)) return jsonRisposta({ errore: 'il party è una lista di eroi' }, 400);
    // le regole scalano da 2 a 10: fuori da li' non e' una squadra, ed e' meglio
    // dirlo qui che scoprirlo a serata cominciata
    if (party.length < 2 || party.length > 10) {
      return jsonRisposta({ errore: 'la compagnia va da 2 a 10 eroi' }, 400);
    }
    // un eroe tolto dal party non puo' restare assegnato a qualcuno: sarebbe un
    // posto che non gioca, e nessuno capirebbe perche'
    await env.DB.prepare(
      `UPDATE membri SET eroe = NULL
        WHERE tavolo = ? AND eroe IS NOT NULL AND eroe NOT IN (SELECT value FROM json_each(?))`)
      .bind(tavolo, JSON.stringify(party)).run();
    await env.DB.prepare('UPDATE tavoli SET party = ? WHERE id = ?')
      .bind(JSON.stringify(party), tavolo).run();
    return jsonRisposta({ ok: true });
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
