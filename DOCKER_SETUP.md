# 🐳 Focus - Configuration Docker Complète

## ✅ État de l'installation

Tout est fonctionnel ! 🎉

- ✅ **PostgreSQL** : Base de données opérationnelle (port 5432)
- ✅ **Backend NestJS** : API fonctionnelle (port 4000)
- ✅ **Frontend Next.js** : Interface web accessible (port 8080)
- ✅ **Prisma** : Migrations appliquées et ORM fonctionnel
- ✅ **Swagger** : Documentation API accessible

---

## 🚀 Démarrage rapide

### Lancer l'application complète

```bash
docker-compose up --build
```

### Lancer en arrière-plan

```bash
docker-compose up -d
```

### Arrêter l'application

```bash
docker-compose down
```

### Arrêter et supprimer les volumes (reset complet)

```bash
docker-compose down -v
```

---

## 📍 URLs importantes

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:8080 | Interface utilisateur Next.js |
| **Backend API** | http://localhost:4000/api/v1 | API REST NestJS |
| **Swagger Docs** | http://localhost:4000/api/v1/docs | Documentation API interactive |
| **PostgreSQL** | localhost:5432 | Base de données (user: postgres, password: postgres, db: focus_db) |

---

## 🔐 Premier compte utilisateur

Un compte admin a été créé pour les tests :

```json
{
  "email": "admin@focus.com",
  "password": "Admin123!",
  "firstName": "Admin",
  "lastName": "Focus",
  "role": "RESEARCHER"
}
```

### Tester l'authentification

```bash
# Connexion
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@focus.com",
    "password": "Admin123!"
  }'
```

---

## 🛠️ Commandes utiles

### Voir les logs

```bash
# Tous les services
docker-compose logs -f

# Backend uniquement
docker-compose logs -f backend

# Frontend uniquement
docker-compose logs -f frontend

# PostgreSQL uniquement
docker-compose logs -f postgres
```

### Exécuter des commandes dans les conteneurs

```bash
# Exécuter une migration Prisma
docker-compose exec backend npx prisma migrate deploy

# Générer le client Prisma
docker-compose exec backend npx prisma generate

# Ouvrir Prisma Studio (interface graphique DB)
docker-compose exec backend npx prisma studio

# Shell dans le backend
docker-compose exec backend sh

# Accéder à PostgreSQL
docker-compose exec postgres psql -U postgres -d focus_db
```

### Vérifier l'état des conteneurs

```bash
docker-compose ps
```

### Rebuild un service spécifique

```bash
docker-compose build backend
docker-compose build frontend
```

---

## 📊 Architecture Docker

### Images utilisées

- **Backend** : `node:20` (image complète pour Prisma)
- **Frontend** : `node:20-slim` (image légère)
- **PostgreSQL** : `postgres:15-alpine`

### Volumes persistants

- `postgres-data` : Données PostgreSQL (survit aux redémarrages)
- `./backend/uploads` : Fichiers uploadés (monté en volume)

### Réseau

Tous les services communiquent via le réseau `focus-network` (bridge).

---

## 🔧 Configuration avancée

### Variables d'environnement

Les variables sont définies dans `docker-compose.yml` :

**Backend** :
- `DATABASE_URL` : URL de connexion PostgreSQL
- `JWT_SECRET` : Clé secrète pour JWT
- `JWT_REFRESH_SECRET` : Clé pour refresh tokens
- `CORS_ORIGIN` : Origin autorisée (frontend)
- `NODE_ENV` : production

**Frontend** :
- `NEXT_PUBLIC_API_URL` : URL de l'API backend
- `NODE_ENV` : production

### Healthchecks

- **PostgreSQL** : `pg_isready` toutes les 5 secondes
- Le backend attend que PostgreSQL soit "healthy" avant de démarrer
- Le frontend attend que le backend soit démarré

---

## 🐛 Dépannage

### "Cannot change memory protections" (Prisma)

✅ **Résolu** : Utilisation de `node:20` au lieu de `node:20-slim` dans le Dockerfile backend.

### "Table does not exist"

Exécuter les migrations :
```bash
docker-compose exec backend npx prisma migrate deploy
```

### Port déjà utilisé

Vérifier les ports 4000, 5432, et 8080 :
```bash
# Linux/macOS
lsof -i :4000
lsof -i :5432
lsof -i :8080

# Ou avec netstat
netstat -tuln | grep -E '4000|5432|8080'
```

### Rebuild complet

```bash
# Arrêter tout
docker-compose down -v

# Supprimer les images
docker-compose build --no-cache

# Redémarrer
docker-compose up -d
```

---

## 📝 Prochaines étapes

1. **Sécurité** : Changer les secrets JWT en production
2. **HTTPS** : Ajouter un reverse proxy (Nginx/Traefik)
3. **Monitoring** : Ajouter Prometheus/Grafana
4. **Backups** : Automatiser les sauvegardes PostgreSQL
5. **CI/CD** : GitHub Actions pour build/deploy automatique

---

## 📚 Documentation technique

### Structure des Dockerfiles

**Backend** (`backend/Dockerfile`) :
- Multi-stage build (builder + production)
- Stage builder : compile TypeScript et génère Prisma
- Stage production : copie uniquement les artifacts nécessaires
- Inclut `wait-for-postgres.sh` pour attendre PostgreSQL

**Frontend** (`frontend/Dockerfile`) :
- Multi-stage build (builder + production)
- Build Next.js optimisé
- Dépendances production uniquement

### Scripts

**wait-for-postgres.sh** :
Script qui attend que PostgreSQL soit prêt avant de lancer l'application backend.

---

## 🎉 Success!

Votre application Focus est maintenant entièrement dockerisée et prête pour le développement ou la production !

- 🔐 Authentification : **Fonctionnelle**
- 📊 Base de données : **Migrations appliquées**
- 📖 Documentation : **Swagger accessible**
- 🖼️ Frontend : **Interface accessible**

**Profitez de votre application ! 🚀**
