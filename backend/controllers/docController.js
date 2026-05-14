const DocModel = require('../models/docModel');
const crypto = require('crypto');

const docController = {
    getAll: async (req, res) => {
        const docs = DocModel.findAllByUserId(req.userId);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, data: docs }));
    },

    create: async (req, res) => {
        const { type, data } = req.body;
        if (!type || !data) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ success: false, error: 'Type et données requis' }));
        }

        const docId = crypto.randomUUID();
        const now = Date.now();

        DocModel.create({
            id: docId,
            user_id: req.userId,
            type,
            data,
            created_at: now,
            updated_at: now
        });

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, data: { id: docId } }));
    },

    update: async (req, res) => {
        const { id } = req.params;
        const { data } = req.body;

        if (!data) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ success: false, error: 'Données requises' }));
        }

        const result = DocModel.update(id, req.userId, data, Date.now());
        if (result.changes === 0) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ success: false, error: 'Document non trouvé' }));
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
    },

    delete: async (req, res) => {
        const { id } = req.params;
        const result = DocModel.delete(id, req.userId);
        
        if (result.changes === 0) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ success: false, error: 'Document non trouvé' }));
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
    }
};

module.exports = docController;
