// I VELI DI NEBBIA si dissolvono ai due capi del percorso invece di sparire di colpo.
// node webapp/test-veli.mjs
import { opacitaVelo } from './public/js/stradario-mappa.js';
let ko = 0;
const ok = (c, m) => { if (!c) { console.error('FAIL:', m); ko++; } else console.log('  ok', m); };
ok(opacitaVelo(0) === 0 && opacitaVelo(1) < 1e-9, 'ai due capi del percorso il velo e invisibile (nessun salto visibile)');
ok(Math.abs(opacitaVelo(0.5) - 1) < 1e-9, 'a meta si vede per intero');
ok(opacitaVelo(0.05) < 0.15 && opacitaVelo(0.95) < 0.15, 'vicino ai capi e ancora quasi spento');
let su = true; for (let f = 0; f < 0.5; f += 0.01) if (opacitaVelo(f + 0.01) < opacitaVelo(f)) su = false;
ok(su, 'sale piano fino a meta, senza scalini');
let giu = true; for (let f = 0.5; f < 1; f += 0.01) if (opacitaVelo(f + 0.01) > opacitaVelo(f)) giu = false;
ok(giu, 'e scende piano dopo');
ok(opacitaVelo(-1) === 0 && opacitaVelo(2) < 1e-9, 'fuori dall intervallo non esce dai limiti');
console.log(ko ? `${ko} KO` : 'Tutto verde');
process.exit(ko ? 1 : 0);
