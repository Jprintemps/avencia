# Changements apportés au backend pour le faire fonctionner

## Problème de départ

`better-sqlite3` est une librairie native (C++) qui nécessite **Visual Studio Build Tools** pour être compilée sur Windows. Sans ça, `npm install` échoue et le serveur ne démarre pas.

```
gyp ERR! find VS You need to install the latest version of Visual Studio
npm error gyp ERR! not ok
Error: Cannot find module 'better-sqlite3'
```

---

## 1. `package.json` — Remplacement de la dépendance SQLite

**Avant :**
```json
"better-sqlite3": "^11.0.0"
```

**Après :**
```json
"sql.js": "^1.12.0"
```

`sql.js` est une version de SQLite compilée en WebAssembly (pur JavaScript). Elle ne nécessite **aucun compilateur C++**, donc `npm install` fonctionne sur n'importe quelle machine sans configuration supplémentaire.

---

## 2. `backend/models/db.js` — Réécriture complète

**Avant :** utilisait l'API synchrone de `better-sqlite3` directement.

**Après :** utilise `sql.js` avec un `dbProxy` qui reproduit la même API (`prepare`, `run`, `get`, `all`, `exec`, `pragma`) pour que `userModel.js` et `docModel.js` n'aient **pas besoin d'être réécrits**.

Points clés du nouveau `db.js` :

- `initDB()` est **async** — charge le fichier `.db` depuis le disque s'il existe, sinon crée une nouvelle base en mémoire.
- `dbProxy._save()` — après chaque écriture (`run`, `exec`), la base en mémoire est **exportée et sauvegardée sur disque** pour assurer la persistance.
- `initDB()` doit être appelé **avant** de démarrer le serveur HTTP (voir `server.js`).

```js
// Ancienne API (better-sqlite3) — synchrone, directe
const db = new Database(dbPath);
db.prepare('SELECT * FROM users WHERE email = ?').get(email);

// Nouvelle API (sql.js via dbProxy) — même interface, même résultat
const { dbProxy: db } = require('./db');
db.prepare('SELECT * FROM users WHERE email = ?').get(email);
```

---

## 3. `backend/models/userModel.js` et `docModel.js` — Import mis à jour

**Avant :**
```js
const db = require('./db');
```

**Après :**
```js
const { dbProxy: db } = require('./db');
```

Le reste du code de ces deux fichiers est **inchangé** grâce au `dbProxy`.

---

## 4. `backend/server.js` — Deux ajouts majeurs

### a) Attendre l'initialisation de la base avant de démarrer

`sql.js` est asynchrone à l'initialisation (chargement du WASM). Le serveur HTTP est maintenant démarré **à l'intérieur du `.then()` de `initDB()`** pour éviter toute requête avant que la base soit prête.

**Avant :**
```js
const server = http.createServer(...);
server.listen(PORT, ...);
```

**Après :**
```js
initDB().then(() => {
    const server = http.createServer(...);
    server.listen(PORT, ...);
});
```

### b) Service des fichiers statiques (HTML, JS, CSS, images)

Le backend ne servait aucun fichier frontend. Il fallait ouvrir les `.html` directement depuis le disque (`file://`), ce qui bloque les requêtes API à cause du CORS.

Maintenant le serveur sert automatiquement tous les fichiers statiques depuis la racine du projet :

```
GET /             → index.html
GET /login.html   → login.html
GET /apps.html    → apps.html
GET /Logo.png     → Logo.png
GET /frontend/auth/authClient.js → authClient.js
...
```

Types de fichiers supportés : `.html`, `.js`, `.css`, `.png`, `.jpg`, `.svg`, `.ico`

---

## 5. `backend/middleware/cors.js` et `backend/.env` — Correction du port CORS

**Avant :** l'origine autorisée était `http://localhost:3000` alors que le serveur tourne sur le port `3001`.

**Après :**
```
FRONTEND_ORIGIN=http://localhost:3001
```

Sans ça, toutes les requêtes API depuis le navigateur étaient bloquées par le CORS.

---

## Résumé des fichiers modifiés

| Fichier | Type de changement |
|---|---|
| `package.json` | `better-sqlite3` → `sql.js` |
| `backend/models/db.js` | Réécriture complète avec `sql.js` + `dbProxy` |
| `backend/models/userModel.js` | Import `dbProxy` au lieu de `db` |
| `backend/models/docModel.js` | Import `dbProxy` au lieu de `db` |
| `backend/server.js` | Init async DB + service des fichiers statiques |
| `backend/middleware/cors.js` | Port corrigé `3000` → `3001` |
| `backend/.env` | `FRONTEND_ORIGIN` corrigé |

---

## Lancement

```bash
npm install
npm start
```

Ouvrir : **http://localhost:3001**
