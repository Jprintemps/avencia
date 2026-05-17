const UserModel = require('../models/userModel');

const sendJSON = (res, status, data) => {
    if (res.status) {
        return res.status(status).json(data);
    }
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
};

const userController = {
    getProfile: async (req, res) => {
        try {
            const user = await UserModel.findById(req.userId);
            if (!user) {
                return sendJSON(res, 404, { success: false, error: 'Utilisateur non trouvé' });
            }
            return sendJSON(res, 200, { success: true, data: user });
        } catch (error) {
            return sendJSON(res, 500, { success: false, error: 'Erreur serveur' });
        }
    }
};

module.exports = userController;
