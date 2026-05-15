const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3001;
const ROOT = path.join(__dirname, '..');

const MIME = {
    '.html': 'text/html',
    '.js':   'application/javascript',
    '.css':  'text/css',
    '.png':  'image/png',
    '.jpg':  'image/jpeg',
    '.svg':  'image/svg+xml',
    '.ico':  'image/x-icon',
};

const server = http.createServer((req, res) => {
    let filePath = path.join(ROOT, req.url === '/' ? '/index.html' : req.url.split('?')[0]);
    const ext = path.extname(filePath);

    if (!fs.existsSync(filePath) || !MIME[ext]) {
        res.writeHead(404);
        return res.end('Not found');
    }

    res.writeHead(200, { 'Content-Type': MIME[ext] });
    fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, () => {
    console.log(`Avencia démarré sur http://localhost:${PORT}`);
});
