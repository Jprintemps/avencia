const crypto = require('crypto');
const UserModel = require('../models/userModel');
const { hashPassword, comparePassword } = require('../utils/hash');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { validateEmail, validatePassword } = require('../utils/validate');

const sendJSON = (res, status, data) => {
    if (res.status) { // Express / Vercel style
        return res.status(status).json(data);
    }
    // Native Node style
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
};

const authController = {
    register: async (req, res) => {
        const { email, password, name } = req.body;

        if (!validateEmail(email) || !validatePassword(password)) {
            return sendJSON(res, 400, { success: false, error: 'Email ou mot de passe invalide (min 8 caractères)' });
        }

        const existingUser = await UserModel.findByEmail(email);
        if (existingUser) {
            return sendJSON(res, 409, { success: false, error: 'Cet email est déjà utilisé' });
        }

        const passwordHash = await hashPassword(password);
        const user = await UserModel.create({
            email,
            password_hash: passwordHash,
            name
        });

        const accessToken = generateAccessToken(user.id);
        const refreshToken = generateRefreshToken(user.id);

        res.setHeader('Set-Cookie', `refreshToken=${refreshToken}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Strict`);
        return sendJSON(res, 201, { success: true, data: { accessToken, user: { id: user.id, email: user.email, name: user.name } } });
    },

    login: async (req, res) => {
        const { email, password } = req.body;

        const user = await UserModel.findByEmail(email);
        if (!user || !(await comparePassword(password, user.password))) {
            return sendJSON(res, 401, { success: false, error: 'Identifiants incorrects' });
        }

        const accessToken = generateAccessToken(user.id);
        const refreshToken = generateRefreshToken(user.id);

        res.setHeader('Set-Cookie', `refreshToken=${refreshToken}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Strict`);
        return sendJSON(res, 200, { success: true, data: { accessToken, user: { id: user.id, email: user.email, name: user.name } } });
    },

    logout: async (req, res) => {
        res.setHeader('Set-Cookie', 'refreshToken=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict');
        return sendJSON(res, 200, { success: true });
    }
};

module.exports = authController;
