const crypto = require('crypto');
const UserModel = require('../models/userModel');
const { hashPassword, comparePassword } = require('../utils/hash');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { validateEmail, validatePassword } = require('../utils/validate');

const authController = {
    register: async (req, res) => {
        const { email, password, name } = req.body;

        if (!validateEmail(email) || !validatePassword(password)) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ success: false, error: 'Email ou mot de passe invalide (min 8 caractères)' }));
        }

        const existingUser = UserModel.findByEmail(email);
        if (existingUser) {
            res.writeHead(409, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ success: false, error: 'Cet email est déjà utilisé' }));
        }

        const userId = crypto.randomUUID();
        const passwordHash = await hashPassword(password);
        
        UserModel.create({
            id: userId,
            email,
            password_hash: passwordHash,
            name,
            created_at: Date.now()
        });

        const accessToken = generateAccessToken(userId);
        const refreshToken = generateRefreshToken(userId);
        UserModel.updateRefreshToken(userId, refreshToken);

        res.setHeader('Set-Cookie', `refreshToken=${refreshToken}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Strict`);
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, data: { accessToken, user: { id: userId, email, name } } }));
    },

    login: async (req, res) => {
        const { email, password } = req.body;

        const user = UserModel.findByEmail(email);
        if (!user || !(await comparePassword(password, user.password_hash))) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ success: false, error: 'Identifiants incorrects' }));
        }

        const accessToken = generateAccessToken(user.id);
        const refreshToken = generateRefreshToken(user.id);
        UserModel.updateRefreshToken(user.id, refreshToken);

        res.setHeader('Set-Cookie', `refreshToken=${refreshToken}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Strict`);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, data: { accessToken, user: { id: user.id, email: user.email, name: user.name } } }));
    },

    refresh: async (req, res) => {
        const cookies = req.headers.cookie;
        if (!cookies) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ success: false, error: 'Refresh token manquant' }));
        }

        const refreshToken = cookies.split(';').find(c => c.trim().startsWith('refreshToken='))?.split('=')[1];
        if (!refreshToken) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ success: false, error: 'Refresh token manquant' }));
        }

        const decoded = verifyRefreshToken(refreshToken);
        if (!decoded) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ success: false, error: 'Refresh token invalide' }));
        }

        const user = UserModel.findByRefreshToken(refreshToken);
        if (!user) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ success: false, error: 'Session expirée' }));
        }

        const newAccessToken = generateAccessToken(user.id);
        const newRefreshToken = generateRefreshToken(user.id);
        UserModel.updateRefreshToken(user.id, newRefreshToken);

        res.setHeader('Set-Cookie', `refreshToken=${newRefreshToken}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Strict`);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, data: { accessToken: newAccessToken } }));
    },

    logout: async (req, res) => {
        const cookies = req.headers.cookie;
        if (cookies) {
            const refreshToken = cookies.split(';').find(c => c.trim().startsWith('refreshToken='))?.split('=')[1];
            if (refreshToken) {
                const user = UserModel.findByRefreshToken(refreshToken);
                if (user) {
                    UserModel.updateRefreshToken(user.id, null);
                }
            }
        }

        res.setHeader('Set-Cookie', 'refreshToken=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
    }
};

module.exports = authController;
