const { dbProxy: db } = require('./db');

const DocModel = {
    create: (doc) => {
        const stmt = db.prepare(`
            INSERT INTO documents (id, user_id, type, data, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)
        `);
        return stmt.run(doc.id, doc.user_id, doc.type, JSON.stringify(doc.data), doc.created_at, doc.updated_at);
    },

    findAllByUserId: (userId) => {
        const stmt = db.prepare('SELECT * FROM documents WHERE user_id = ? ORDER BY created_at DESC');
        const docs = stmt.all(userId);
        return docs.map(doc => ({ ...doc, data: JSON.parse(doc.data) }));
    },

    findById: (id, userId) => {
        const stmt = db.prepare('SELECT * FROM documents WHERE id = ? AND user_id = ?');
        const doc = stmt.get(id, userId);
        if (doc) {
            doc.data = JSON.parse(doc.data);
        }
        return doc;
    },

    update: (id, userId, data, updatedAt) => {
        const stmt = db.prepare(`
            UPDATE documents 
            SET data = ?, updated_at = ? 
            WHERE id = ? AND user_id = ?
        `);
        return stmt.run(JSON.stringify(data), updatedAt, id, userId);
    },

    delete: (id, userId) => {
        const stmt = db.prepare('DELETE FROM documents WHERE id = ? AND user_id = ?');
        return stmt.run(id, userId);
    }
};

module.exports = DocModel;
