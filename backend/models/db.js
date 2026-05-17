const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

const query = (text, params) => pool.query(text, params);

const initDB = async () => {
    try {
        await pool.query('SELECT 1');
        console.log('Connexion à PostgreSQL réussie');
    } catch (err) {
        console.error('Erreur de connexion à PostgreSQL:', err);
        process.exit(1);
    }
};

module.exports = {
    query,
    pool,
    initDB
};
