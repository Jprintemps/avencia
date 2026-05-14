/**
 * Wrapper pour IndexedDB par utilisateur
 */
const localDB = {
    db: null,
    dbName: null,

    async open(userId) {
        this.dbName = `avencia_${userId}`;
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 1);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('documents')) {
                    db.createObjectStore('documents', { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains('drafts')) {
                    db.createObjectStore('drafts', { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings', { keyPath: 'key' });
                }
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve(this.db);
            };

            request.onerror = (event) => reject(event.target.error);
        });
    },

    async saveDocument(doc) {
        return this._perform('documents', 'readwrite', (store) => store.put(doc));
    },

    async getDocument(id) {
        return this._perform('documents', 'readonly', (store) => store.get(id));
    },

    async getAllDocuments() {
        return this._perform('documents', 'readonly', (store) => store.getAll());
    },

    async deleteDocument(id) {
        return this._perform('documents', 'readwrite', (store) => store.delete(id));
    },

    async markAsSynced(id) {
        const doc = await this.getDocument(id);
        if (doc) {
            doc.synced = true;
            return this.saveDocument(doc);
        }
    },

    async getUnsyncedDocuments() {
        const docs = await this.getAllDocuments();
        return docs.filter(doc => !doc.synced);
    },

    _perform(storeName, mode, action) {
        return new Promise((resolve, reject) => {
            if (!this.db) return reject(new Error("Database not opened"));
            const transaction = this.db.transaction(storeName, mode);
            const store = transaction.objectStore(storeName);
            const request = action(store);

            request.onsuccess = (event) => resolve(event.target.result);
            request.onerror = (event) => reject(event.target.error);
        });
    }
};

// Exporter pour usage global si pas de modules
window.localDB = localDB;
