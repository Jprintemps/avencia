const http = require('http');
const { handleRequest } = require('./router');
require('dotenv').config({ path: __dirname + '/.env' });

const PORT = process.env.PORT || 3001;

const server = http.createServer(async (req, res) => {
    // Parser le body JSON si présent
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', async () => {
        try {
            if (body) {
                req.body = JSON.parse(body);
            } else {
                req.body = {};
            }
        } catch (e) {
            req.body = {};
        }
        
        await handleRequest(req, res);
    });
});

server.listen(PORT, () => {
    console.log(`Serveur Avencia démarré sur http://localhost:${PORT}`);
});
