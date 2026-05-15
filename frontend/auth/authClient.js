/**
 * Auth client 100% local — no server, no DB
 * Users are stored in localStorage as: avencia_accounts = { email: { name, passwordHash, id } }
 * Session is stored as: avencia_user = { id, email, name, ... }
 */
const authClient = {
    user: null,

    // Simple hash using Web Crypto (SHA-256)
    async _hash(password) {
        const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password));
        return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
    },

    _getAccounts() {
        return JSON.parse(localStorage.getItem('avencia_accounts') || '{}');
    },

    _saveAccounts(accounts) {
        localStorage.setItem('avencia_accounts', JSON.stringify(accounts));
    },

    async register(email, password, name) {
        if (!email || !password || password.length < 8) {
            return { success: false, error: 'Email ou mot de passe invalide (min 8 caractères)' };
        }
        const accounts = this._getAccounts();
        if (accounts[email]) {
            return { success: false, error: 'Cet email est déjà utilisé' };
        }
        const passwordHash = await this._hash(password);
        const id = crypto.randomUUID();
        accounts[email] = { id, name, passwordHash };
        this._saveAccounts(accounts);

        this.user = { id, email, name };
        localStorage.setItem('avencia_user', JSON.stringify(this.user));
        // legacy key used by apps.html
        localStorage.setItem('user', JSON.stringify(this.user));
        await localDB.open(id);
        return { success: true, data: { user: this.user } };
    },

    async login(email, password) {
        const accounts = this._getAccounts();
        const account = accounts[email];
        if (!account) {
            return { success: false, error: 'Identifiants incorrects' };
        }
        const passwordHash = await this._hash(password);
        if (passwordHash !== account.passwordHash) {
            return { success: false, error: 'Identifiants incorrects' };
        }
        this.user = { id: account.id, email, name: account.name };
        localStorage.setItem('avencia_user', JSON.stringify(this.user));
        localStorage.setItem('user', JSON.stringify(this.user));
        await localDB.open(account.id);
        return { success: true, data: { user: this.user } };
    },

    logout() {
        this.user = null;
        localStorage.removeItem('avencia_user');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    },

    init() {
        const saved = localStorage.getItem('avencia_user') || localStorage.getItem('user');
        if (saved) {
            this.user = JSON.parse(saved);
            localDB.open(this.user.id);
        }
    }
};

window.authClient = authClient;
authClient.init();
