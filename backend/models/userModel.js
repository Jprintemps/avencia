const db = require('./db');

const UserModel = {
    create: (user) => {
        const stmt = db.prepare(`
            INSERT INTO users (id, email, password_hash, name, created_at)
            VALUES (?, ?, ?, ?, ?)
        `);
        return stmt.run(user.id, user.email, user.password_hash, user.name, user.created_at);
    },

    findByEmail: (email) => {
        const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
        return stmt.get(email);
    },

    findById: (id) => {
        const stmt = db.prepare('SELECT id, email, name, created_at FROM users WHERE id = ?');
        return stmt.get(id);
    },

    updateRefreshToken: (userId, token) => {
        const stmt = db.prepare('UPDATE users SET refresh_token = ? WHERE id = ?');
        return stmt.run(token, userId);
    },

    findByRefreshToken: (token) => {
        const stmt = db.prepare('SELECT * FROM users WHERE refresh_token = ?');
        return stmt.get(token);
    },

    updateProfile: (userId, data) => {
        const stmt = db.prepare('UPDATE users SET name = ? WHERE id = ?');
        return stmt.run(data.name, userId);
    }
};

module.exports = UserModel;
