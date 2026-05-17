const db = require('./db');

const UserModel = {
    async create(user) {
        const sql = `
            INSERT INTO users (email, password, name)
            VALUES ($1, $2, $3)
            RETURNING *
        `;
        const res = await db.query(sql, [user.email, user.password_hash, user.name]);
        return res.rows[0];
    },

    async findByEmail(email) {
        const sql = 'SELECT * FROM users WHERE email = $1';
        const res = await db.query(sql, [email]);
        return res.rows[0];
    },

    async findById(id) {
        const sql = 'SELECT id, email, name, created_at FROM users WHERE id = $1';
        const res = await db.query(sql, [id]);
        return res.rows[0];
    }
};

module.exports = UserModel;
