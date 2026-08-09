// Verifica il JWT che Cloudflare Access mette nell'intestazione
// `Cf-Access-Jwt-Assertion`.
//
// NON ci si fida di `Cf-Access-Authenticated-User-Email`: e' un'intestazione, e
// le intestazioni si scrivono. Qui si controlla la firma contro le chiavi
// pubbliche del team, la scadenza e il destinatario (aud): sono le tre cose
// che rendono un token non falsificabile.
const cache = { quando: 0, chiavi: null };

const b64url = (s) => Uint8Array.from(
  atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));
const json = (s) => JSON.parse(new TextDecoder().decode(b64url(s)));

async function chiaviDiCloudflare(team) {
  if (cache.chiavi && Date.now() - cache.quando < 3600_000) return cache.chiavi;
  const r = await fetch(`https://${team}.cloudflareaccess.com/cdn-cgi/access/certs`);
  if (!r.ok) throw new Error('chiavi di Access non raggiungibili: ' + r.status);
  cache.chiavi = (await r.json()).keys;
  cache.quando = Date.now();
  return cache.chiavi;
}

// Restituisce l'email verificata, oppure null. Mai un'eccezione per un token
// storto: un token storto e' un 403, non un errore del server.
export async function emailDaJwt(token, opzioni = {}) {
  const { team, aud, adesso = Date.now(), prendiChiavi = chiaviDiCloudflare } = opzioni;
  if (!token || typeof token !== 'string') return null;
  const parti = token.split('.');
  if (parti.length !== 3) return null;
  const [testa, corpo, firma] = parti;

  let h, c;
  try { h = json(testa); c = json(corpo); } catch { return null; }

  const jwk = (await prendiChiavi(team)).find((k) => k.kid === h.kid);
  if (!jwk) return null;

  let valida = false;
  try {
    const chiave = await crypto.subtle.importKey(
      'jwk', { kty: jwk.kty, n: jwk.n, e: jwk.e, alg: 'RS256', ext: true },
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
    valida = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', chiave,
      b64url(firma), new TextEncoder().encode(`${testa}.${corpo}`));
  } catch { return null; }
  if (!valida) return null;

  if (!c.exp || c.exp * 1000 <= adesso) return null;
  const destinatari = Array.isArray(c.aud) ? c.aud : [c.aud];
  if (!destinatari.includes(aud)) return null;
  return c.email || null;
}
