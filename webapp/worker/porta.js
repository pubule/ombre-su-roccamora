// LA PORTA: il criterio di Cloudflare Access, scritto dall'app.
//
// Access decide chi arriva al sito; `membri` decide a che tavolo si siede. Sono
// due autorizzazioni diverse e vanno tenute distinte — ma la prima viveva sulla
// dashboard, cioe' fuori dall'app, ed era l'unico passaggio che si dimenticava:
// posto pronto al tavolo, porta chiusa, e l'invitato che digita la sua email e
// non riceve nessun codice. Senza segnale, ne' a lui ne' a chi arbitra.
//
// Qui l'app fa UNA cosa sola: aggiunge indirizzi all'elenco `include` del
// criterio. Non lo aggira, non lo sostituisce, e non toglie niente — si apre da
// sola, si chiude a mano (un tocco sbagliato non deve chiudere fuori qualcuno a
// meta' campagna).
//
// SENZA `CF_API_TOKEN` TUTTO RESTA COM'ERA: `configurata` e' falso, non parte
// nessuna chiamata, e chi guarda la schermata legge cosa manca invece di
// trovare un bottone che non puo' riuscire. E' anche lo stato in cui girano i
// banchi che non riguardano la porta.

const base = (env) => String(env.CF_API_BASE || 'https://api.cloudflare.com/client/v4')
  .replace(/\/+$/, '');

const configurata = (env) => !!(env.CF_API_TOKEN && env.CF_ACCOUNT_ID && env.ACCESS_POLICY_ID);

const percorso = (env) =>
  `${base(env)}/accounts/${env.CF_ACCOUNT_ID}/access/policies/${env.ACCESS_POLICY_ID}`;

// I «PORTIERI»: chi puo' toccare il criterio dall'app. Access resta il secondo
// lucchetto — se chiunque avesse un account potesse aprire la porta a chi
// vuole, smetterebbe di essere un lucchetto. L'elenco sta in `vars`, separato
// da virgole; vuoto significa funzione spenta.
export function portiere(env, email) {
  const elenco = String(env.PORTIERI || '').split(',').map((x) => x.trim().toLowerCase());
  return !!email && elenco.includes(String(email).toLowerCase());
}

const chiama = async (env, metodo, corpo) => {
  const r = await fetch(percorso(env), {
    method: metodo,
    headers: {
      Authorization: `Bearer ${env.CF_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    ...(corpo ? { body: JSON.stringify(corpo) } : {}),
  });
  const j = await r.json().catch(() => null);
  if (!r.ok || !j || j.success === false) {
    const detto = ((j && j.errors) || []).map((e) => e.message).join('; ');
    throw new Error(detto || `Access ha risposto ${r.status}`);
  }
  return j.result;
};

// Gli indirizzi ammessi, e il criterio intero per poterlo riscrivere. Le voci
// dell'`include` che non sono email (un «emails ending in», un «everyone») si
// leggono e si conservano: riscrivere l'elenco da zero le cancellerebbe, e chi
// ha aggiunto quella regola dalla dashboard non se ne accorgerebbe fino al
// giorno in cui qualcuno non riesce piu' a entrare.
export async function leggiPorta(env) {
  if (!configurata(env)) return { configurata: false, emails: [], criterio: null };
  try {
    const criterio = await chiama(env, 'GET');
    const emails = (criterio.include || [])
      .map((v) => v && v.email && v.email.email)
      .filter(Boolean)
      .map((x) => String(x).toLowerCase());
    return { configurata: true, emails, criterio };
  } catch (e) {
    return { configurata: true, emails: [], criterio: null, errore: String(e.message || e) };
  }
}

// Aggiunge gli indirizzi che mancano. Idempotente: chi c'e' gia' non si
// riscrive, cosi' invitare due volte la stessa persona non tocca il criterio.
//
// La lettura-scrittura NON E' ATOMICA — l'API non ha un ETag da opporre — e due
// aggiunte in contemporanea potrebbero sovrascriversi. Con un arbitro solo che
// invita e' un caso che non si presenta; per non lasciarlo silenzioso, dopo la
// scrittura si rilegge e, se l'indirizzo non c'e', si riprova una volta.
export async function apriPorta(env, emails) {
  if (!configurata(env)) return { spenta: true, aggiunti: [], gia: [] };
  const voluti = [...new Set((emails || []).filter(Boolean).map((x) => String(x).toLowerCase()))];
  if (!voluti.length) return { aggiunti: [], gia: [] };

  const scrivi = async () => {
    const stato = await leggiPorta(env);
    if (stato.errore || !stato.criterio) throw new Error(stato.errore || 'criterio illeggibile');
    const dentro = new Set(stato.emails);
    const mancano = voluti.filter((x) => !dentro.has(x));
    if (!mancano.length) return { aggiunti: [], gia: voluti };
    const c = stato.criterio;
    await chiama(env, 'PUT', {
      name: c.name,
      decision: c.decision,
      include: [...(c.include || []), ...mancano.map((email) => ({ email: { email } }))],
      exclude: c.exclude || [],
      require: c.require || [],
      ...(c.session_duration ? { session_duration: c.session_duration } : {}),
    });
    return { aggiunti: mancano, gia: voluti.filter((x) => dentro.has(x)) };
  };

  try {
    const esito = await scrivi();
    if (!esito.aggiunti.length) return esito;
    const dopo = await leggiPorta(env);
    if (!dopo.errore && esito.aggiunti.every((x) => dopo.emails.includes(x))) return esito;
    return await scrivi();          // qualcuno ha scritto in mezzo: si rifa', una volta
  } catch (e) {
    return { errore: String(e.message || e), aggiunti: [], gia: [] };
  }
}

// E CHIUDERLA. Toglie gli indirizzi dall'elenco — e solo quelli: le voci che
// non sono email restano dove sono, come nell'aprire.
//
// Chi la chiude a se' stesso non se ne accorge subito: la sessione dura un mese,
// e il muro arriva il giorno in cui ricarica. Per questo `chiudiPorta` non
// tocca ne' chi chiede ne' un altro portiere — la ringhiera sta qui, dove non
// la dimentica nessuno, e non solo nel bottone che si potrebbe cambiare.
export async function chiudiPorta(env, chi, emails) {
  if (!configurata(env)) return { spenta: true, tolti: [], gia: [] };
  const voluti = [...new Set((emails || []).filter(Boolean).map((x) => String(x).toLowerCase()))];
  const intoccabili = new Set([String(chi || '').toLowerCase(),
    ...String(env.PORTIERI || '').split(',').map((x) => x.trim().toLowerCase()).filter(Boolean)]);
  const proibito = voluti.find((x) => intoccabili.has(x));
  if (proibito) return { proibito };
  if (!voluti.length) return { tolti: [], gia: [] };

  try {
    const stato = await leggiPorta(env);
    if (stato.errore || !stato.criterio) throw new Error(stato.errore || 'criterio illeggibile');
    const dentro = new Set(stato.emails);
    const tolti = voluti.filter((x) => dentro.has(x));
    if (!tolti.length) return { tolti: [], gia: voluti };
    const c = stato.criterio;
    await chiama(env, 'PUT', {
      name: c.name,
      decision: c.decision,
      include: (c.include || []).filter((v) =>
        !(v && v.email && voluti.includes(String(v.email.email).toLowerCase()))),
      exclude: c.exclude || [],
      require: c.require || [],
      ...(c.session_duration ? { session_duration: c.session_duration } : {}),
    });
    return { tolti, gia: voluti.filter((x) => !dentro.has(x)) };
  } catch (e) {
    return { errore: String(e.message || e), tolti: [], gia: [] };
  }
}
