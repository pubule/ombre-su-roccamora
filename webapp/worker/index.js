// Punto d'ingresso del Worker: separa gli endpoint dei salvataggi dal resto,
// che sono file statici (la webapp vera e propria).
import { emailDaJwt } from './access.js';
import { api } from './api.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(request);

    // OSR_DEV_EMAIL esiste SOLO come --var di `wrangler dev`. Non va MAI in
    // wrangler.jsonc: sarebbe una porta aperta in produzione. C'e' un test che
    // lo verifica (test-api.mjs, ultimo controllo).
    const email = env.OSR_DEV_EMAIL || await emailDaJwt(
      request.headers.get('Cf-Access-Jwt-Assertion'),
      { team: env.ACCESS_TEAM, aud: env.ACCESS_AUD });
    if (!email) return new Response('non autorizzato', { status: 403 });

    try {
      return await api(request, env, email);
    } catch (e) {
      // il client tiene la sua coda: un 500 non fa perdere niente, si riprova
      return Response.json({ errore: String(e.message) }, { status: 500 });
    }
  },
};
