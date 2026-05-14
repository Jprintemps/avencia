const authController = require('./controllers/authController');
const userController = require('./controllers/userController');
const docController = require('./controllers/docController');
const { authMiddleware } = require('./middleware/auth');
const { rateLimitMiddleware } = require('./middleware/rateLimit');
const { corsMiddleware } = require('./middleware/cors');

const handleRequest = async (req, res) => {
    // 1. CORS
    if (corsMiddleware(req, res)) return;

    const { method, url } = req;
    const parsedUrl = new URL(url, `http://${req.headers.host}`);
    const path = parsedUrl.pathname;

    // Helper pour extraire l'ID des routes comme /api/docs/:id
    const pathParts = path.split('/').filter(Boolean);
    let routePath = path;
    req.params = {};

    if (pathParts[0] === 'api' && pathParts[1] === 'docs' && pathParts[2]) {
        routePath = '/api/docs/:id';
        req.params.id = pathParts[2];
    }

    // 2. Routing & Middlewares
    try {
        // Auth Routes
        if (method === 'POST' && path === '/api/auth/register') {
            return await authController.register(req, res);
        }
        if (method === 'POST' && path === '/api/auth/login') {
            return rateLimitMiddleware(req, res, () => authController.login(req, res));
        }
        if (method === 'POST' && path === '/api/auth/refresh') {
            return await authController.refresh(req, res);
        }
        if (method === 'POST' && path === '/api/auth/logout') {
            return await authController.logout(req, res);
        }

        // User Routes (Protected)
        if (method === 'GET' && path === '/api/user/profile') {
            return authMiddleware(req, res, () => userController.getProfile(req, res));
        }
        if (method === 'PUT' && path === '/api/user/profile') {
            return authMiddleware(req, res, () => userController.updateProfile(req, res));
        }

        // Docs Routes (Protected)
        if (method === 'GET' && path === '/api/docs') {
            return authMiddleware(req, res, () => docController.getAll(req, res));
        }
        if (method === 'POST' && path === '/api/docs') {
            return authMiddleware(req, res, () => docController.create(req, res));
        }
        if (method === 'PUT' && routePath === '/api/docs/:id') {
            return authMiddleware(req, res, () => docController.update(req, res));
        }
        if (method === 'DELETE' && routePath === '/api/docs/:id') {
            return authMiddleware(req, res, () => docController.delete(req, res));
        }

        // 404
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Route non trouvée' }));

    } catch (error) {
        console.error('Erreur serveur:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Erreur interne du serveur' }));
    }
};

module.exports = { handleRequest, registerRoute };
