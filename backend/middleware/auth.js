const { verifyAccessToken } = require('../utils/jwt');

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        if (res.status) return res.status(401).json({ success: false, error: 'Accès non autorisé' });
        res.writeHead(401, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, error: 'Accès non autorisé' }));
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    if (!decoded) {
        if (res.status) return res.status(401).json({ success: false, error: 'Token invalide ou expiré' });
        res.writeHead(401, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, error: 'Token invalide ou expiré' }));
    }

    req.userId = decoded.userId;
    next();
};
