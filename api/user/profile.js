const userController = require('../../backend/controllers/userController');
const authMiddleware = require('../../backend/middleware/auth');

module.exports = async (req, res) => {
    const expressRes = {
        status: (code) => ({
            json: (data) => res.status(code).json(data)
        }),
        json: (data) => res.json(data)
    };

    // Appliquer le middleware d'authentification manuellement pour Vercel
    return new Promise((resolve) => {
        authMiddleware(req, expressRes, async () => {
            if (req.method === 'GET') {
                await userController.getProfile(req, expressRes);
            } else {
                res.status(405).json({ error: 'Method not allowed' });
            }
            resolve();
        });
    });
};
