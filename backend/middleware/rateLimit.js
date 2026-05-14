const loginAttempts = new Map();

const rateLimitMiddleware = (req, res, next) => {
    const ip = req.socket.remoteAddress;
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes
    const maxAttempts = 10;

    if (!loginAttempts.has(ip)) {
        loginAttempts.set(ip, { count: 1, resetTime: now + windowMs });
        return next();
    }

    const data = loginAttempts.get(ip);

    if (now > data.resetTime) {
        loginAttempts.set(ip, { count: 1, resetTime: now + windowMs });
        return next();
    }

    if (data.count >= maxAttempts) {
        res.writeHead(429, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, error: 'Trop de tentatives. Réessayez plus tard.' }));
    }

    data.count++;
    return next();
};

module.exports = { rateLimitMiddleware };
