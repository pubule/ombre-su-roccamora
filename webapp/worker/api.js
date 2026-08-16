import { apriPorta, leggiPorta, portiere } from './porta.js';

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

// LA CRESCITA E' DI CHI LA GIOCA. Le caselle di un eroe le spunta chi ha quel
// posto — la scheda e' sua, e al tavolo la matita ce l'ha lui — mentre chi
// arbitra le spunta per chiunque, perche' tiene in mano gli eroi che nessuno
// ha reclamato e perche' quando si gioca in due davanti a uno schermo solo la
// mano e' una.
//
// E' la stessa forma di `posso()` nella vista (`digitale.js`), e deve esserlo:
// se il server e il bottone non fossero d'accordo, si vedrebbe un bottone che
// il server rifiuta — che e' peggio che non vederlo.
async function puoSegnare(env, email, tavolo, eroe) {
  if (await arbitroDi(env, email, tavolo)) return true;
  return (await env.DB.prepare(
    'SELECT 1 FROM eroi_posto WHERE tavolo = ? AND email = ? AND eroe = ?')
    .bind(tavolo, email, eroe).first()) != null;
}

const emailValida = (x) => typeof x === 'string' && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(x) && x.length <= 190;

// LA PORTA, quando si puo'. Apre il criterio di Access a degli indirizzi e
// restituisce una parola sola, che e' quel che la schermata deve dire:
// «aperta» / «gia» (c'era) / «spenta» (nessun token) / «errore».
//
// Chi non e' portiere non fa partire niente: la rubrica si scrive lo stesso, e
// la porta resta un gesto di chi tiene le chiavi.
async function provaAdAprire(env, chi, emails) {
  if (!portiere(env, chi)) return 'spenta';
  const r = await apriPorta(env, emails);
  if (r.spenta) return 'spenta';
  if (r.errore) return 'errore';
  return r.aggiunti.length ? 'aperta' : 'gia';
}

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
       SELECT t.id, t.nome, t.creato, t.party, m.ruolo,
              (SELECT group_concat(e.eroe, char(10)) FROM eroi_posto e
                WHERE e.tavolo = t.id AND e.email = m.email) AS eroe
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
    // `eroi` e' la lista (un posto puo' averne piu' d'uno: un iPad, due amici);
    // `eroe` resta il primo, perche' e' quel che guardano le pagine che non
    // sanno ancora dei due — una serata non si interrompe per un aggiornamento
    const conEroi = (tavoli.results || []).map((t) => {
      // `group_concat` li unisce con un a capo: nei nomi degli eroi non c'è
      const eroi = t.eroe ? String(t.eroe).split('\n').filter(Boolean) : [];
      return { ...t, eroi, eroe: eroi[0] || null };
    });
    return jsonRisposta({ email, tavoli: conEroi, salvataggi: salvataggi.results });
  }

  // --------------------------------------------------------------- membri
  if (p === '/api/membri' && metodo === 'GET') {
    const tavolo = url.searchParams.get('tavolo');
    if (!(await mioTavolo(env, email, tavolo))) return jsonRisposta({ errore: 'non trovato' }, 404);
    // chi siede a questo tavolo lo vedono tutti quelli che ci siedono: sapere
    // con chi si gioca non e' un segreto
    const [r, e] = await Promise.all([
      env.DB.prepare(
        'SELECT email, nome, ruolo, invitato FROM membri WHERE tavolo = ? ORDER BY invitato')
        .bind(tavolo).all(),
      env.DB.prepare('SELECT email, eroe FROM eroi_posto WHERE tavolo = ? ORDER BY eroe')
        .bind(tavolo).all(),
    ]);
    // UN POSTO PUO' AVERNE PIU' D'UNO (un iPad, due amici): `eroi` e' la lista,
    // e `eroe` resta il primo per quel che non e' ancora stato riscritto.
    const suoi = {};
    for (const x of e.results || []) (suoi[x.email] = suoi[x.email] || []).push(x.eroe);
    return jsonRisposta({ membri: (r.results || []).map((m) => ({
      ...m, eroi: suoi[m.email] || [], eroe: (suoi[m.email] || [])[0] || null })) });
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
    const corpo = await request.json();
    const { tavolo } = corpo;
    // `eroi` e' la forma di oggi; `eroe` singolo resta accettato perche' e' quel
    // che manda una pagina aperta prima dell'aggiornamento — e una serata non
    // si interrompe per un ricaricamento.
    const voluti = [...new Set((Array.isArray(corpo.eroi) ? corpo.eroi
      : (corpo.eroe ? [corpo.eroe] : [])).filter(Boolean))];
    const mio = await env.DB.prepare('SELECT 1 FROM membri WHERE tavolo = ? AND email = ?')
      .bind(tavolo, email).first();
    if (!mio) return jsonRisposta({ errore: 'non trovato' }, 404);
    if (voluti.length) {
      const t = await env.DB.prepare('SELECT party FROM tavoli WHERE id = ?').bind(tavolo).first();
      const party = t && t.party ? JSON.parse(t.party) : null;
      if (!party || !party.length) {
        return jsonRisposta({ errore: 'chi arbitra non ha ancora scelto la compagnia' }, 409);
      }
      for (const eroe of voluti) {
        if (!party.includes(eroe)) {
          return jsonRisposta({ errore: 'quell’eroe non è nella compagnia di questo tavolo' }, 400);
        }
        const preso = await env.DB.prepare(
          'SELECT 1 FROM eroi_posto WHERE tavolo = ? AND eroe = ? AND email <> ?')
          .bind(tavolo, eroe, email).first();
        if (preso) return jsonRisposta({ errore: 'quell’eroe l’ha già preso qualcun altro' }, 409);
      }
    }
    // si riscrive il proprio posto in un colpo: prima si lascia quel che si
    // aveva, poi si prende quel che si vuole. In mezzo il posto e' senza eroi,
    // ed e' lo stato giusto in cui restare se qualcosa va storto — un posto
    // senza eroi non comanda niente.
    const scritture = [env.DB.prepare('DELETE FROM eroi_posto WHERE tavolo = ? AND email = ?')
      .bind(tavolo, email)];
    for (const eroe of voluti) {
      scritture.push(env.DB.prepare(
        'INSERT OR IGNORE INTO eroi_posto (tavolo, email, eroe) VALUES (?, ?, ?)')
        .bind(tavolo, email, eroe));
    }
    try { await env.DB.batch(scritture); } catch {
      // la chiave primaria (tavolo, eroe) morde qui: un eroe ha un posto solo,
      // e a dirlo e' il database — non un controllo che qualcuno dimentichera'
      return jsonRisposta({ errore: 'quell’eroe è già di qualcun altro a questo tavolo' }, 409);
    }
    return jsonRisposta({ ok: true });
  }

  // LA RUBRICA: le persone con cui giochi, in un posto solo.
  //
  // E' di chi la tiene (`proprietario`), e non e' legata a un tavolo: le stesse
  // persone giocano piu' campagne, e riscriverne nome ed email a ogni tavolo
  // nuovo era il lavoro che l'app faceva rifare. Insieme al nome si porta
  // dentro anche la PORTA, che era l'unico passaggio rimasto sulla dashboard —
  // e quindi l'unico che si dimenticava.
  if (p === '/api/rubrica' && metodo === 'GET') {
    const [r, seduti, porta] = await Promise.all([
      env.DB.prepare(
        'SELECT email, nome, creata FROM persone WHERE proprietario = ? ORDER BY nome, email')
        .bind(email).all(),
      // a quanti dei MIEI tavoli siede: serve a dire «togliendola resta seduta
      // a due tavoli», invece di far scoprire dopo che era ancora in gioco
      env.DB.prepare(
        `SELECT m.email AS email, COUNT(*) AS quanti FROM membri m
           JOIN tavoli t ON t.id = m.tavolo
          WHERE t.proprietario = ? GROUP BY m.email`).bind(email).all(),
      leggiPorta(env),
    ]);
    const quanti = {};
    for (const x of (seduti.results || [])) quanti[x.email] = x.quanti;
    const dentro = new Set(porta.emails || []);
    const sePortiere = portiere(env, email);
    const persone = (r.results || []).map((x) => ({
      email: x.email,
      nome: x.nome,
      tavoli: quanti[x.email] || 0,
      // lo stato della porta si dice solo a chi puo' cambiarlo e solo se c'e'
      // qualcosa da dire: un semaforo spento confonde piu' di nessun semaforo
      porta: (sePortiere && porta.configurata && !porta.errore)
        ? (dentro.has(String(x.email).toLowerCase()) ? 'dentro' : 'fuori') : null,
    }));
    const inRubrica = new Set(persone.map((x) => String(x.email).toLowerCase()));
    return jsonRisposta({
      persone,
      portiere: sePortiere,
      configurata: !!porta.configurata && sePortiere,
      errore: sePortiere ? (porta.errore || null) : null,
      // nel criterio ma non in rubrica: si mostrano e basta — la porta si apre
      // da sola e si chiude a mano
      estranei: (sePortiere && porta.configurata && !porta.errore)
        ? (porta.emails || []).filter((x) => !inRubrica.has(x)) : [],
    });
  }

  if (p === '/api/rubrica' && metodo === 'POST') {
    const { email: chi, nome } = await request.json();
    if (!emailValida(chi)) return jsonRisposta({ errore: 'email non valida' }, 400);
    await env.DB.prepare(
      `INSERT INTO persone (proprietario, email, nome, creata) VALUES (?, ?, ?, ?)
       ON CONFLICT(proprietario, email) DO UPDATE SET nome = excluded.nome`)
      .bind(email, chi, (nome || '').trim().slice(0, 80) || null, Date.now()).run();
    // LA PERSONA NON FALLISCE PER COLPA DELLA PORTA: il nome in rubrica e' il
    // dato vero, la porta e' una comodita'. Se Cloudflare non risponde, la
    // persona resta scritta e la schermata dice che la porta va aperta a mano.
    return jsonRisposta({ ok: true, porta: await provaAdAprire(env, email, [chi]) });
  }

  if (p === '/api/rubrica' && metodo === 'DELETE') {
    const chi = url.searchParams.get('email');
    // SOLO DALLA RUBRICA. I posti ai tavoli restano (si tolgono da «chi gioca»)
    // e la porta resta aperta: si apre da sola, si chiude a mano — un tocco
    // sbagliato non deve chiudere fuori qualcuno a meta' campagna.
    await env.DB.prepare('DELETE FROM persone WHERE proprietario = ? AND email = ?')
      .bind(email, chi).run();
    return jsonRisposta({ ok: true });
  }

  // IL RIMEDIO, per chi era gia' in rubrica quando la porta non c'era. Non
  // accetta un indirizzo qualunque: accetta uno dei TUOI, ed e' il vincolo che
  // tiene — dall'app si puo' aprire la porta solo a chi hai gia' in rubrica.
  if (p === '/api/porta' && metodo === 'POST') {
    if (!portiere(env, email)) return jsonRisposta({ errore: 'non sei tu a tenere le chiavi' }, 403);
    const { email: chi } = await request.json();
    const suo = await env.DB.prepare(
      'SELECT 1 FROM persone WHERE proprietario = ? AND email = ?').bind(email, chi).first();
    if (!suo) return jsonRisposta({ errore: 'quella persona non è nella tua rubrica' }, 404);
    const esito = await provaAdAprire(env, email, [chi]);
    return jsonRisposta({ ok: esito !== 'errore', porta: esito }, esito === 'errore' ? 502 : 200);
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
      const scritture = [env.DB.prepare(
        `INSERT INTO membri (tavolo, email, nome, eroe, ruolo, invitato) VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(tavolo, email) DO UPDATE
           SET nome = excluded.nome, eroe = excluded.eroe, ruolo = excluded.ruolo`)
        .bind(tavolo, invitato, (nome || '').trim() || null, eroe || null,
              ruolo || 'giocatore', Date.now())];
      // l'eroe assegnato all'invito e' il PRIMO del posto: gli altri se li
      // prende il dispositivo dalla sua schermata
      if (eroe) {
        scritture.push(env.DB.prepare(
          'INSERT OR IGNORE INTO eroi_posto (tavolo, email, eroe) VALUES (?, ?, ?)')
          .bind(tavolo, invitato, eroe));
      }
      await env.DB.batch(scritture);
    } catch (e) {
      // l'indice unico su (tavolo, eroe) morde qui: due giocatori non possono
      // prendere lo stesso eroe, ed e' il database a dirlo, non un controllo
      // che qualcuno un giorno dimentichera' di fare
      return jsonRisposta({ errore: 'quell’eroe è già di qualcun altro a questo tavolo' }, 409);
    }
    // dare un posto vuol dire anche aprire la porta: chi arriva da qui di
    // solito e' gia' passato dalla rubrica e la porta e' gia' aperta («gia»),
    // ma un invito scritto a mano — o una pagina rimasta aperta da ieri — non
    // deve tornare a lasciare qualcuno fuori senza dirlo
    return jsonRisposta({ ok: true, porta: await provaAdAprire(env, email, [invitato]) });
  }

  if (p === '/api/membri' && metodo === 'DELETE') {
    const tavolo = url.searchParams.get('tavolo');
    const chi = url.searchParams.get('email');
    // l'arbitro caccia chiunque; un giocatore puo' togliere solo se stesso
    const suo = chi === email;
    if (!suo && !(await arbitroDi(env, email, tavolo))) return jsonRisposta({ errore: 'non trovato' }, 404);
    if (suo && !(await mioTavolo(env, email, tavolo))) return jsonRisposta({ errore: 'non trovato' }, 404);
    // e con lui se ne vanno i suoi eroi: la chiave esterna e' sul TAVOLO, non
    // sul membro, quindi qui si toglie a mano — un eroe che restasse legato a
    // un posto che non c'e' piu' non lo potrebbe prendere piu' nessuno
    await env.DB.batch([
      env.DB.prepare('DELETE FROM eroi_posto WHERE tavolo = ? AND email = ?').bind(tavolo, chi),
      env.DB.prepare('DELETE FROM membri WHERE tavolo = ? AND email = ?').bind(tavolo, chi),
    ]);
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

  // LA CRESCITA DEGLI EROI. Come i Bivi: appartiene alla campagna, la legge
  // chiunque sieda al tavolo — la scheda di un compagno non e' un segreto, e
  // anzi al tavolo si guarda — e la scrive chi arbitra, che e' chi tiene il
  // Taccuino di Campagna.
  if (p === '/api/migliorie' && metodo === 'GET') {
    const tavolo = url.searchParams.get('tavolo');
    if (!(await mioTavolo(env, email, tavolo))) return jsonRisposta({ errore: 'non trovato' }, 404);
    const r = await env.DB.prepare(
      'SELECT eroe, voci, cicatrici FROM migliorie_campagna WHERE tavolo = ?')
      .bind(tavolo).all();
    return jsonRisposta({ migliorie: r.results });
  }

  if (p === '/api/migliorie' && metodo === 'PUT') {
    const { tavolo, eroe, voci, cicatrici } = await request.json();
    if (!eroe) return jsonRisposta({ errore: 'serve l’eroe' }, 400);
    // chi arbitra segna per chiunque; chi gioca solo il proprio eroe
    if (!(await puoSegnare(env, email, tavolo, eroe))) {
      return jsonRisposta({ errore: 'non trovato' }, 404);
    }
    if (!Array.isArray(voci) || !Array.isArray(cicatrici || [])) {
      return jsonRisposta({ errore: 'voci e cicatrici sono liste' }, 400);
    }
    // Si scrive la LISTA INTERA dell'eroe, non una casella: cosi' togliere una
    // spunta sbagliata e' la stessa operazione che aggiungerla, e non serve una
    // DELETE per riga. Il tetto e' un guardrail contro un client rotto, non una
    // regola di gioco — quella e' il prezzo, e sta nel motore.
    const pulisci = (a) => (a || []).slice(0, 40).map((x) => String(x).slice(0, 40)).join(',');
    await env.DB.prepare(
      `INSERT INTO migliorie_campagna (tavolo, eroe, voci, cicatrici, quando) VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(tavolo, eroe) DO UPDATE SET voci = excluded.voci,
         cicatrici = excluded.cicatrici, quando = excluded.quando`)
      .bind(tavolo, eroe, pulisci(voci), pulisci(cicatrici), Date.now()).run();
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
    await env.DB.batch([
      env.DB.prepare(
        `DELETE FROM eroi_posto
          WHERE tavolo = ? AND eroe NOT IN (SELECT value FROM json_each(?))`)
        .bind(tavolo, JSON.stringify(party)),
      env.DB.prepare(
        `UPDATE membri SET eroe = NULL
          WHERE tavolo = ? AND eroe IS NOT NULL AND eroe NOT IN (SELECT value FROM json_each(?))`)
        .bind(tavolo, JSON.stringify(party)),
    ]);
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
