// Punto d'ingresso del Worker: separa gli endpoint dei salvataggi dal resto,
// che sono file statici (la webapp vera e propria).
import { emailDaJwt } from './access.js';
import { api } from './api.js';
import { tavolo } from './tavolo.js';

// Il Durable Object dev'essere esportato da qui: e' l'entrypoint che wrangler
// guarda per trovare la classe dichiarata nella migration.
export { Partita } from './partita-do.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(request);

    // OSR_DEV_EMAIL esiste SOLO come --var di `wrangler dev`. Non va MAI in
    // wrangler.jsonc: sarebbe una porta aperta in produzione. C'e' un test che
    // lo verifica (test-api.mjs, ultimo controllo).
    //
    // In dev si puo' anche impersonare un'altra email con un header. Serve per
    // una ragione precisa: due `wrangler dev` hanno DUE Durable Object
    // separati — condividono il D1 locale, non i DO — quindi la partita viva
    // non si puo' provare con due server. Con un server solo e due email si
    // puo'. L'header vale SOLO se OSR_DEV_EMAIL c'e' gia', cioe' mai in
    // produzione: senza quella var questa riga non fa niente.
    const email = (env.OSR_DEV_EMAIL && request.headers.get('X-Osr-Dev-Email'))
      || env.OSR_DEV_EMAIL || await emailDaJwt(
      request.headers.get('Cf-Access-Jwt-Assertion'),
      { team: env.ACCESS_TEAM, aud: env.ACCESS_AUD });
    if (!email) return new Response('non autorizzato', { status: 403 });

    try {
      // /api/tavolo/<id>/... parla con la PARTITA VIVA (il Durable Object).
      // Il resto sono i salvataggi, che restano com'erano.
      if (url.pathname.startsWith('/api/tavolo/')) return await tavolo(request, env, email);
      return await api(request, env, email);
    } catch (e) {
      // il client tiene la sua coda: un 500 non fa perdere niente, si riprova
      return Response.json({ errore: String(e.message) }, { status: 500 });
    }
  },
};
