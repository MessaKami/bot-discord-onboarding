# 🤖 Bot Discord d'Onboarding

Bot Discord développé en TypeScript pour gérer l'onboarding des nouveaux membres sur le serveur Discord de Simplon HdF.

## 📋 Description

Ce bot facilite l'intégration des nouveaux membres en automatisant plusieurs processus d'accueil et de configuration. Il interagit avec une API dédiée pour gérer les données des utilisateurs et leur progression dans le processus d'onboarding.

## 🛠️ Technologies Utilisées

- **[TypeScript](https://www.typescriptlang.org/)** - Langage de programmation
- **[Discord.js](https://discord.js.org/)** - Framework Discord
- **[Node.js](https://nodejs.org/)** - Environnement d'exécution
- **[Pino](https://getpino.io/)** - Gestion des logs
- **[dotenv](https://www.npmjs.com/package/dotenv)** - Gestion des variables d'environnement

## ✨ Fonctionnalités Principales

- 👋 **Accueil Automatisé**
  - Message de bienvenue personnalisé
  - Attribution automatique des rôles de base
  - Guide des premières étapes

- 📝 **Gestion des Étapes d'Onboarding**
  - Suivi de la progression
  - Validation des étapes
  - Rappels automatiques

- 🔐 **Gestion des Permissions**
  - Attribution dynamique des accès
  - Vérification des rôles
  - Sécurisation des commandes

- 🔄 **Intégration API**
  - Synchronisation avec l'API d'onboarding
  - Gestion des données utilisateurs
  - Suivi des statistiques

## 🚀 Démarrage du Projet

### Prérequis

- Node.js (version 16.x ou supérieure)
- npm ou yarn
- Un token de bot Discord
- Les identifiants de l'API

### Installation

1. **Cloner le repository**
   ```bash
   git clone https://github.com/Simplon-hdf/bot-discord-onboarding.git
   cd bot-discord-onboarding
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configurer les variables d'environnement**
   ```bash
   cp .env.example .env
   # Éditer .env avec vos informations
   ```

4. **Compiler le TypeScript**
   ```bash
   npm run build
   ```

5. **Démarrer le bot**
   - En développement :
     ```bash
     npm run dev
     ```
   - En production :
     ```bash
     npm start
     ```

## 📝 Logs

Le bot utilise Pino pour la gestion des logs avec différents niveaux :
- `ERROR` : Erreurs critiques
- `WARN` : Avertissements
- `INFO` : Informations générales
- `DEBUG` : Informations de débogage (uniquement en développement)

## 🤝 Contribution

Consultez [CONTRIBUTING.md](CONTRIBUTING.md) pour les règles de contribution.

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.