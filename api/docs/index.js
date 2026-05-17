const docController = require('../../backend/controllers/docController');
const authMiddleware = require('../../backend/middleware/auth');

module.exports = async (req, res) => {
    const expressRes = {
        status: (code) => ({
            json: (data) => res.status(code).json(data)
        }),
        json: (data) => res.json(data)
    };

    return new Promise((resolve) => {
        authMiddleware(req, expressRes, async () => {
            if (req.method === 'GET') {
                await docController.getAll(req, expressRes);
            } else if (req.method === 'POST') {
                await docController.create(req, expressRes);
            } else {
                res.status(405).json({ error: 'Method not allowed' });
            }
            resolve();
        });
    });
};
