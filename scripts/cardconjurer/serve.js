// Server statico minimo per la copia locale di Card Conjurer (vendor/cardconjurer/),
// cosi' la generazione carte non dipende piu' dalla disponibilita' di
// cardconjurer.app (il sito originale, cardconjurer.com, e' gia' stato chiuso una
// volta dopo una diffida — vedi commento in vendor/cardconjurer/README.txt).
//
// Uso diretto: node scripts/cardconjurer/serve.js [porta=4242]
// Uso da altri script: const { startServer } = require('./serve');
//                       const close = await startServer();  // poi close() a fine batch

const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..', 'vendor', 'cardconjurer');
const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.ttf': 'font/ttf', '.woff': 'font/woff', '.woff2': 'font/woff2',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.json': 'application/json',
};

function startServer(port = 4242) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      let p = decodeURIComponent(req.url.split('?')[0]);
      if (p === '/') p = '/index.html';
      const full = path.join(ROOT, p);
      if (!full.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
      fs.readFile(full, (err, data) => {
        if (err) { res.writeHead(404); res.end('not found: ' + p); return; }
        res.writeHead(200, { 'Content-Type': MIME[path.extname(full)] || 'application/octet-stream' });
        res.end(data);
      });
    });
    server.on('error', reject);
    server.listen(port, () => resolve({ url: `http://localhost:${port}`, close: () => server.close() }));
  });
}

if (require.main === module) {
  const port = parseInt(process.argv[2], 10) || 4242;
  startServer(port).then(({ url }) => console.log(`Card Conjurer locale su ${url} (Ctrl+C per fermare)`));
}

module.exports = { startServer };
