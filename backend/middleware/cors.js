require('dotenv').config();

const corsMiddleware = (req, res) => {
    const origin = req.headers.origin;
    const allowedOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:3001';

    if (origin === allowedOrigin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return true;
    }
    return false;
};

module.exports = { corsMiddleware };
