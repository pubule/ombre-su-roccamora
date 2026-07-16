// Ombre su Roccamora - server locale della webapp (zero dipendenze).
//
// Uso:  node webapp/server.js  [porta]
// Poi da iPad/telefono sulla stessa rete: apri l'URL stampato e
// "Aggiungi alla schermata Home". Serve solo file statici:
//   /            -> webapp/public/
//   /data/...    -> webapp/data/   (JSON esportati)
//   /assets/...  -> webapp/assets/ (immagini web)
//   /fonts/...   -> fonts/         (Old Standard, IM Fell del repo)
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const ROOT = path.join(__dirname, '..');
const PORT = Number(process.argv[2]) || 8017;

const MOUNTS = [
  ['/data/', path.join(__dirname, 'data')],
  ['/assets/', path.join(__dirname, 'assets')],
  ['/fonts/', path.join(ROOT, 'fonts')],
  ['/', path.join(__dirname, 'public')],
];

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
  '.svg': 'image/svg+xml', '.ttf': 'font/ttf', '.webmanifest': 'application/manifest+json',
  '.ico': 'image/x-icon',
};

http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  for (const [prefix, base] of MOUNTS) {
    if (!url.startsWith(prefix)) continue;
    let rel = url.slice(prefix.length) || 'index.html';
    if (rel.endsWith('/')) rel += 'index.html';
    const file = path.normalize(path.join(base, rel));
    if (!file.startsWith(path.normalize(base))) break;      // niente path traversal
    if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      if (prefix === '/') break;                            // fallthrough -> 404
      continue;
    }
    res.writeHead(200, {
      'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': url.startsWith('/assets/') ? 'max-age=86400' : 'no-cache',
    });
    fs.createReadStream(file).pipe(res);
    return;
  }
  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('non trovato');
}).listen(PORT, () => {
  const nets = os.networkInterfaces();
  const ips = Object.values(nets).flat().filter((n) => n && n.family === 'IPv4' && !n.internal)
    .map((n) => n.address);
  console.log('Ombre su Roccamora - webapp\n');
  console.log(`  sul PC:        http://localhost:${PORT}`);
  for (const ip of ips) console.log(`  da iPad/telefono: http://${ip}:${PORT}`);
  console.log('\n(stessa rete Wi-Fi; Ctrl+C per fermare)');
});
