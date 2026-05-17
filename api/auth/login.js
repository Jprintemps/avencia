const authController = require('../../backend/controllers/authController');

module.exports = async (req, res) => {
    // Simuler l'objet res de Express pour le contrôleur existant
    const expressRes = {
        status: (code) => ({
            json: (data) => res.status(code).json(data)
        }),
        setHeader: (name, value) => res.setHeader(name, value),
        json: (data) => res.json(data)
    };

    if (req.method === 'POST') {
        return authController.login(req, expressRes);
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
};
