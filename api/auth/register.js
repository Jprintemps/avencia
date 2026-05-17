const authController = require('../../backend/controllers/authController');

module.exports = async (req, res) => {
    const expressRes = {
        status: (code) => ({
            json: (data) => res.status(code).json(data)
        }),
        json: (data) => res.json(data)
    };

    if (req.method === 'POST') {
        return authController.register(req, expressRes);
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
};
