/**
 * Client d'authentification pour Avencia
 */
const authClient = {
    baseUrl: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:3001/api' // URL de développement local
        : 'https://avencia.onrender.com/api', // URL de production Render
    accessToken: null,
    user: null,

    async register(email, password, name) {
        const res = await fetch(`${this.baseUrl}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, name })
        });
        const data = await res.json();
        if (data.success) {
            this.accessToken = data.data.accessToken;
            this.user = data.data.user;
            localStorage.setItem('user', JSON.stringify(this.user));
            await localDB.open(this.user.id);
        }
        return data;
    },

    async login(email, password) {
        const res = await fetch(`${this.baseUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (data.success) {
            this.accessToken = data.data.accessToken;
            this.user = data.data.user;
            localStorage.setItem('user', JSON.stringify(this.user));
            await localDB.open(this.user.id);
        }
        return data;
    },

    async logout() {
        await fetch(`${this.baseUrl}/auth/logout`, { method: 'POST' });
        this.accessToken = null;
        this.user = null;
        localStorage.removeItem('user');
        window.location.href = '/login.html'; // ou autre page de redirection
    },

    async refreshToken() {
        const res = await fetch(`${this.baseUrl}/auth/refresh`, { method: 'POST' });
        const data = await res.json();
        if (data.success) {
            this.accessToken = data.data.accessToken;
        }
        return data.success;
    },

    // Wrapper pour les requêtes fetch authentifiées
    async fetch(url, options = {}) {
        if (!this.accessToken) {
            const refreshed = await this.refreshToken();
            if (!refreshed) throw new Error('Session expirée');
        }

        options.headers = {
            ...options.headers,
            'Authorization': `Bearer ${this.accessToken}`
        };

        let response = await fetch(`${this.baseUrl}${url}`, options);

        if (response.status === 401) {
            const refreshed = await this.refreshToken();
            if (refreshed) {
                options.headers['Authorization'] = `Bearer ${this.accessToken}`;
                response = await fetch(`${this.baseUrl}${url}`, options);
            } else {
                this.logout();
            }
        }

        return response.json();
    },

    async init() {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            this.user = JSON.parse(savedUser);
            await localDB.open(this.user.id);
            await this.refreshToken();
        }
    }
};

// Initialisation au chargement
window.authClient = authClient;
authClient.init();
