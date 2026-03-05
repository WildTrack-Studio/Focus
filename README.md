# FOCUS 🦁

**Plateforme intelligente de suivi faunique**

> Projet de fin d'études - Automatisation du traitement d'images de pièges photographiques avec Machine Learning

## 🎯 Vue d'ensemble

FOCUS automatise l'analyse de milliers de photos issues de pièges photographiques pour les parcs naturels et organismes de conservation :

- 🔍 Détection automatique d'animaux
- 🦒 Classification des espèces
- 👤 Identification individuelle
- 📊 Visualisation analytique avancée
- ✅ Validation experte (human-in-the-loop)

## 🏗️ Architecture

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Frontend  │─────▶│  Backend    │─────▶│  ML Service │
│   Next.js   │      │   NestJS    │      │   FastAPI   │
└─────────────┘      └─────────────┘      └─────────────┘
                            │                     │
                            ▼                     ▼
                     ┌─────────────┐      ┌─────────────┐
                     │ PostgreSQL  │      │  S3 Storage │
                     └─────────────┘      └─────────────┘
```

### Stack technique

#### Frontend (`/frontend`)
- **Framework** : Next.js 14 (App Router)
- **Language** : TypeScript
- **UI** : Tailwind CSS + shadcn/ui
- **Maps** : Leaflet / Mapbox
- **Auth** : JWT + RBAC

#### Backend API (`/backend`)
- **Framework** : NestJS
- **Database** : PostgreSQL
- **ORM** : Prisma
- **Queue** : Redis/Bull
- **Auth** : JWT + bcrypt

#### ML Service (`/ml-service`)
- **Framework** : FastAPI
- **ML** : PyTorch + YOLOv8
- **Detection** : Object detection
- **Classification** : CNN fine-tuné
- **Processing** : Batch processing

#### Infrastructure (`/infrastructure`)
- **Containerization** : Docker + Docker Compose
- **Storage** : S3 compatible (MinIO)
- **Cache** : Redis
- **CI/CD** : GitHub Actions

## 📦 Installation

### Prérequis

- Node.js 20+
- Python 3.11+
- Docker & Docker Compose
- PostgreSQL 15+

### Démarrage rapide

```bash
# Cloner le repository
git clone https://github.com/WildTrack-Studio/Focus.git
cd Focus

# Lancer l'environnement complet avec Docker
docker-compose up -d

# Frontend disponible sur http://localhost:3000
# Backend API sur http://localhost:4000
# ML Service sur http://localhost:8000
```

### Développement local

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

#### Backend
```bash
cd backend
npm install
npm run start:dev
```

#### ML Service
```bash
cd ml-service
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

## 🗂️ Structure du projet

```
Focus/
├── frontend/           # Application Next.js
│   ├── src/
│   │   ├── app/       # App Router
│   │   ├── components/
│   │   ├── lib/
│   │   └── types/
│   └── public/
├── backend/           # API NestJS
│   ├── src/
│   │   ├── modules/
│   │   ├── common/
│   │   └── prisma/
│   └── prisma/
├── ml-service/        # Service ML FastAPI
│   ├── app/
│   │   ├── models/
│   │   ├── routes/
│   │   └── services/
│   └── weights/
├── infrastructure/    # Configuration Docker
│   ├── docker-compose.yml
│   ├── postgres/
│   └── minio/
├── docs/             # Documentation
└── .github/          # CI/CD workflows
```

## 🎮 Fonctionnalités MVP

- [x] Authentification sécurisée (JWT + RBAC)
- [x] Upload massif d'images (drag & drop)
- [x] Détection automatique d'animaux (YOLOv8)
- [x] Classification des espèces
- [x] Interface de validation humaine
- [x] Dashboard analytique
- [ ] Carte interactive des observations
- [ ] Export de données (CSV/PDF)
- [ ] API publique pour chercheurs

## 🔐 Sécurité

- Authentification JWT
- Chiffrement des données sensibles
- RBAC (Admin / Chercheur / Validateur)
- Protection des coordonnées GPS
- Logs d'audit
- HTTPS obligatoire en production

## 📊 Big Data & ML

- Pipeline de traitement asynchrone
- Active learning (amélioration continue)
- Human-in-the-loop pour validation
- Batch processing optimisé
- Stockage scalable (S3)

## 🚀 Déploiement

### Production
- Docker Swarm / Kubernetes
- Load balancing
- Auto-scaling
- Backups automatisés
- Monitoring (Prometheus + Grafana)

## 🧪 Tests

```bash
# Tests frontend
cd frontend && npm test

# Tests backend
cd backend && npm run test

# Tests ML service
cd ml-service && pytest
```

## 📝 Documentation

- [Architecture détaillée](./docs/architecture.md)
- [API Documentation](./docs/api.md)
- [Guide de contribution](./CONTRIBUTING.md)
- [Sécurité](./docs/security.md)

## 🤝 Contribution

Ce projet est développé dans le cadre d'un projet de fin d'études.

## 📄 Licence

MIT License - voir [LICENSE](./LICENSE)

## 👥 Auteur

**WildTrack Studio**
- GitHub: [@WildTrack-Studio](https://github.com/WildTrack-Studio)

## 🙏 Remerciements

- Parcs naturels partenaires
- Communauté open-source
- Équipe pédagogique

---

**Status** : 🚧 MVP en développement
**Version** : 0.1.0
**Date** : Mars 2026
