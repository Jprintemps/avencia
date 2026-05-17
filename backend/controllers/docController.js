const DocModel = require('../models/docModel');

const sendJSON = (res, status, data) => {
    if (res.status) {
        return res.status(status).json(data);
    }
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
};

const docController = {
    getAll: async (req, res) => {
        try {
            const docs = await DocModel.findAllByUserId(req.userId);
            return sendJSON(res, 200, { success: true, data: docs });
        } catch (error) {
            return sendJSON(res, 500, { success: false, error: 'Erreur lors de la récupération' });
        }
    },

    create: async (req, res) => {
        try {
            const { type, data } = req.body;
            const newDoc = await DocModel.create({
                user_id: req.userId,
                type,
                data
            });
            return sendJSON(res, 201, { success: true, data: newDoc });
        } catch (error) {
            return sendJSON(res, 500, { success: false, error: 'Erreur lors de la création' });
        }
    },

    delete: async (req, res) => {
        try {
            const docId = req.query.id;
            const success = await DocModel.delete(docId, req.userId);
            if (!success) {
                return sendJSON(res, 404, { success: false, error: 'Document non trouvé' });
            }
            return sendJSON(res, 200, { success: true });
        } catch (error) {
            return sendJSON(res, 500, { success: false, error: 'Erreur lors de la suppression' });
        }
    }
};

module.exports = docController;
