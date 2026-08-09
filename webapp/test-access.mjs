// Verifica del JWT di Cloudflare Access. E' il confine di fiducia dell'intera
// faccenda: qui si decide di chi sono le partite. Se passa un'email inventata,
// uno legge e sovrascrive le serate di un altro.
// node webapp/test-access.mjs
import { emailDaJwt } from './worker/access.js';

const b64url = (buf) => Buffer.from(buf).toString('base64')
  .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

const generaCoppia = () => crypto.subtle.generateKey(
  { name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
  true, ['sign', 'verify']);

// una coppia di chiavi vera, come quella che pubblica Cloudflare (RS256)
const coppia = await generaCoppia();
const jwk = { ...(await crypto.subtle.exportKey('jwk', coppia.publicKey)), kid: 'k1', alg: 'RS256' };
const prendiChiavi = async () => [jwk];

const firma = async (corpo, chiave = coppia.privateKey, kid = 'k1') => {
  const testa = b64url(JSON.stringify({ alg: 'RS256', kid }));
  const payload = b64url(JSON.stringify(corpo));
  const s = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', chiave,
    new TextEncoder().encode(`${testa}.${payload}`));
  return `${testa}.${payload}.${b64url(s)}`;
};

const OPZ = { team: 'prova', aud: 'AUD1', adesso: 1_000_000, prendiChiavi };
const buono = { email: 'fabio@esempio.it', aud: ['AUD1'], exp: 2000 };   // exp in secondi

let ko = 0;
const ok = async (atteso, token, msg) => {
  const r = await emailDaJwt(token, OPZ);
  if (r !== atteso) { console.error('FAIL:', msg, '— atteso', atteso, 'ricevuto', r); ko++; }
};

await ok('fabio@esempio.it', await firma(buono), 'token valido');
await ok(null, null, 'token assente');
await ok(null, 'non-un-jwt', 'token malformato');
await ok(null, await firma({ ...buono, exp: 999 }), 'token scaduto');
await ok(null, await firma({ ...buono, aud: ['ALTRO'] }), "aud di un'altra applicazione");
await ok(null, await firma(buono, (await generaCoppia()).privateKey), "firmato con un'altra chiave");
await ok(null, await firma(buono, coppia.privateKey, 'sconosciuto'), 'kid che non esiste');
await ok(null, await firma({ ...buono, email: undefined }), 'token senza email');

// manomissione: corpo sostituito dopo la firma, tenendo testa e firma buone
const t = await firma(buono);
const [h, , s] = t.split('.');
await ok(null, `${h}.${b64url(JSON.stringify({ ...buono, email: 'ladro@esempio.it' }))}.${s}`,
  'corpo sostituito mantenendo la firma');

console.log(ko ? `${ko} FALLITI` : 'test-access: tutto a posto');
process.exit(ko ? 1 : 0);
