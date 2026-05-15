const http = require('http');
const fs = require('fs');
const path = require('path');
const { handleRequest } = require('./router');
const { initDB } = require('./models/db');
require('dotenv').config({ path: __dirname + '/.env' });

const PORT = process.env.PORT || 3001;
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

function serveStatic(req, res) {
    let filePath = path.join(ROOT, req.url === '/' ? '/index.html' : req.url);
    // strip query string
    filePath = filePath.split('?')[0];
    const ext = path.extname(filePath);
    if (!fs.existsSync(filePath) || !MIME[ext]) return false;
    res.writeHead(200, { 'Content-Type': MIME[ext] });
    fs.createReadStream(filePath).pipe(res);
    return true;
}

initDB().then(() => {
    const server = http.createServer(async (req, res) => {
        // Serve static files first
        if (req.method === 'GET' && !req.url.startsWith('/api')) {
            if (serveStatic(req, res)) return;
        }

        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
            try {
                req.body = body ? JSON.parse(body) : {};
            } catch (e) {
                req.body = {};
            }
            await handleRequest(req, res);
        });
    });

    server.listen(PORT, () => {
        console.log(`Serveur Avencia démarré sur http://localhost:${PORT}`);
    });
});
