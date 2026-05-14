# Avencia - Backend & Frontend Offline-First

Ce projet utilise une architecture Node.js native (sans framework) pour le backend et une stratégie offline-first avec IndexedDB pour le frontend.

## Structure du Projet

- `backend/` : Serveur Node.js, API REST, SQLite.
- `frontend/` : Logique client, IndexedDB, Authentification.
- `apps.html` : Application principale.

## Installation et Lancement

1. **Prérequis** : Node.js installé.
2. **Installation** :
   ```bash
   npm install
   ```
3. **Lancement du serveur** :
   ```bash
   npm start
   ```
   Le serveur tournera sur `http://localhost:3001`.

## Fonctionnalités Backend

- **Authentification** : JWT (Access + Refresh Tokens) avec stockage sécurisé des mots de passe (bcrypt).
- **Base de données** : SQLite (via `better-sqlite3`) pour la persistance serveur.
- **Sécurité** : Rate limiting, CORS configuré, Headers de sécurité, Cookies HttpOnly.
- **API** :
    - `POST /api/auth/register` : Inscription
    - `POST /api/auth/login` : Connexion
    - `POST /api/auth/refresh` : Rafraîchissement du token
    - `POST /api/auth/logout` : Déconnexion
    - `GET /api/user/profile` : Profil utilisateur
    - `GET /api/docs` : Liste des documents
    - `POST /api/docs` : Création de document

## Fonctionnalités Frontend

- **IndexedDB** : Stockage local par utilisateur (`localDB.js`).
- **Synchronisation** : Stratégie offline-first.
- **Auth Client** : Gestion automatique des tokens et des sessions (`authClient.js`).

## Variables d'environnement

Les secrets sont configurés dans `backend/.env`. Ne partagez jamais ce fichier en production.
