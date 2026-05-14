const UserModel = require('../models/userModel');

const userController = {
    getProfile: async (req, res) => {
        const user = UserModel.findById(req.userId);
        if (!user) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ success: false, error: 'Utilisateur non trouvé' }));
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, data: user }));
    },

    updateProfile: async (req, res) => {
        const { name } = req.body;
        if (!name) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ success: false, error: 'Le nom est requis' }));
        }

        UserModel.updateProfile(req.userId, { name });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Profil mis à jour' }));
    }
};

module.exports = userController;
