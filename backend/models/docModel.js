const db = require('./db');

const DocModel = {
    async create(doc) {
        const sql = `
            INSERT INTO documents (user_id, type, data)
            VALUES ($1, $2, $3)
            RETURNING *
        `;
        const res = await db.query(sql, [doc.user_id, doc.type, JSON.stringify(doc.data)]);
        return res.rows[0];
    },

    async findAllByUserId(userId) {
        const sql = 'SELECT * FROM documents WHERE user_id = $1 ORDER BY created_at DESC';
        const res = await db.query(sql, [userId]);
        return res.rows.map(row => ({
            ...row,
            data: typeof row.data === 'string' ? JSON.parse(row.data) : row.data
        }));
    },

    async delete(id, userId) {
        const sql = 'DELETE FROM documents WHERE id = $1 AND user_id = $2';
        const res = await db.query(sql, [id, userId]);
        return res.rowCount > 0;
    }
};

module.exports = DocModel;
