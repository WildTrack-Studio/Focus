# Guide de démarrage rapide - FOCUS

## 🚀 Installation initiale

### Étape 1 : Installer les dépendances

```bash
# Installer les dépendances globales
npm install

# Créer le fichier .env (déjà fait)
# Modifiez .env avec vos propres valeurs si nécessaire
```

### Étape 2 : Initialiser chaque service

#### Frontend (Next.js)
```bash
cd frontend
# Suivre les instructions dans frontend/README.md (à venir)
```

#### Backend (NestJS)
```bash
cd backend
# Suivre les instructions dans backend/README.md (à venir)
```

#### ML Service (FastAPI)
```bash
cd ml-service
# Suivre les instructions dans ml-service/README.md (à venir)
```

### Étape 3 : Démarrer avec Docker (recommandé)

```bash
# Lancer tous les services
docker-compose up -d

# Vérifier les logs
docker-compose logs -f

# Arrêter les services
docker-compose down
```

### Étape 4 : Accéder aux services

- **Frontend** : http://localhost:3000
- **Backend API** : http://localhost:4000
- **ML Service** : http://localhost:8000
- **MinIO Console** : http://localhost:9001
- **Database** : localhost:5432

## 🛠️ Développement

### Commandes utiles

```bash
# Développement avec hot-reload
npm run dev

# Tests
npm run test

# Build production
npm run build

# Linter
npm run lint

# Format code
npm run format

# Database
npm run db:migrate
npm run db:seed
npm run db:studio
```

## 📝 Prochaines étapes

1. **Backend** : Initialiser NestJS et Prisma
2. **Frontend** : Initialiser Next.js
3. **ML Service** : Setup FastAPI et PyTorch
4. **Database** : Créer le schéma Prisma

Consultez `TODO.md` pour le plan complet !

## 🆘 Besoin d'aide ?

- Documentation : `docs/`
- Issues : GitHub Issues
- Contact : voir README.md
