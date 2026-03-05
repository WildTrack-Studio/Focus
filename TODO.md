# FOCUS - MVP Development Roadmap

## 📋 Phase 1 : Setup & Infrastructure (EN COURS)

### Repository & Configuration
- [x] Initialisation Git
- [x] Structure des dossiers
- [x] README et documentation
- [x] Docker Compose
- [x] Variables d'environnement
- [x] GitHub Actions CI/CD
- [ ] Installation des dépendances

### Infrastructure
- [ ] Configuration PostgreSQL
- [ ] Configuration Redis
- [ ] Configuration MinIO (S3)
- [ ] Tests de connectivité

---

## 📋 Phase 2 : Backend API (NestJS)

### Setup Backend
- [x] Initialisation NestJS
- [x] Configuration Prisma
- [x] Schéma de base de données
- [x] Migrations initiales
- [x] Configuration JWT (dépendances installées)

### Modules Core
- [x] Module Auth
  - [x] Register avec validation stricte
  - [x] Login avec JWT
  - [x] Refresh token (30 jours)
  - [x] RBAC Guards (JwtAuthGuard + RolesGuard)
  - [x] Decorators (@Auth, @CurrentUser, @Roles)
  - [x] Get Profile endpoint
  - [x] Audit logs
  - [x] Documentation Swagger
  - [x] Documentation README
- [x] Module Users
  - [x] CRUD utilisateurs (Create, Read, Update, Delete)
  - [x] Gestion des rôles (Admin uniquement)
  - [x] Profils et recherche avec pagination
  - [x] Changement de mot de passe
  - [x] Statistiques utilisateurs
  - [x] Soft delete avec isActive
  - [x] Audit logs complet
  - [x] Documentation Swagger
  - [x] Documentation README
- [ ] Module Projects
  - [ ] CRUD projets
  - [ ] Permissions par projet
  - [ ] Statistiques
- [ ] Module Images
  - [ ] Upload vers S3
  - [ ] Métadonnées
  - [ ] Listing & filtres
- [ ] Module Detections
  - [ ] Enregistrement résultats ML
  - [ ] Validation humaine
  - [ ] Statistiques

### Queue & Jobs
- [ ] Configuration Bull/Redis
- [ ] Job : traitement d'image
- [ ] Job : batch processing
- [ ] Monitoring des jobs

### Tests Backend
- [ ] Tests unitaires modules
- [ ] Tests d'intégration API
- [ ] Tests e2e

---

## 📋 Phase 3 : Frontend (Next.js)

### Setup Frontend
- [ ] Initialisation Next.js 14
- [ ] Configuration Tailwind CSS
- [ ] Installation shadcn/ui
- [ ] Configuration TypeScript
- [ ] Axios/React Query

### Pages & Layouts
- [ ] Layout principal
- [ ] Page d'accueil
- [ ] Login / Register
- [ ] Dashboard

### Fonctionnalités Core
- [ ] Authentification
  - [ ] Formulaire login
  - [ ] Formulaire register
  - [ ] Protected routes
  - [ ] Gestion du token
- [ ] Projets
  - [ ] Liste des projets
  - [ ] Création projet
  - [ ] Détails projet
- [ ] Upload d'images
  - [ ] Drag & drop
  - [ ] Upload multiple
  - [ ] Progress bar
  - [ ] Preview
- [ ] Visualisation
  - [ ] Galerie d'images
  - [ ] Détections overlay
  - [ ] Filtres & recherche
- [ ] Validation
  - [ ] Interface de validation
  - [ ] Workflow human-in-the-loop
- [ ] Dashboard
  - [ ] Statistiques générales
  - [ ] Graphiques
  - [ ] Timeline

### Carte Interactive
- [ ] Intégration Leaflet/Mapbox
- [ ] Markers des observations
- [ ] Heatmap
- [ ] Filtres temporels

### Tests Frontend
- [ ] Tests composants (Jest)
- [ ] Tests e2e (Playwright)

---

## 📋 Phase 4 : ML Service (FastAPI)

### Setup ML Service
- [ ] Initialisation FastAPI
- [ ] Configuration PyTorch
- [ ] Download YOLOv8
- [ ] Setup environment Python

### Détection & Classification
- [ ] Endpoint /detect
  - [ ] Chargement du modèle YOLO
  - [ ] Détection d'objets
  - [ ] Bounding boxes
  - [ ] Scores de confiance
- [ ] Endpoint /classify
  - [ ] Classification d'espèces
  - [ ] Fine-tuning CNN
- [ ] Endpoint /batch
  - [ ] Traitement par lots
  - [ ] Optimisation performances

### Intégration
- [ ] Communication avec Backend (webhook/queue)
- [ ] Upload/download depuis S3
- [ ] Gestion des erreurs
- [ ] Logging

### Tests ML
- [ ] Tests unitaires
- [ ] Tests sur dataset de validation
- [ ] Benchmarks de performance

---

## 📋 Phase 5 : Intégration & Pipeline

### Pipeline complet
- [ ] Upload → Queue → ML → Database
- [ ] Gestion des statuts
- [ ] Notifications temps réel (WebSocket?)
- [ ] Retry logic

### Human-in-the-loop
- [ ] Détection des prédictions incertaines
- [ ] Interface de validation
- [ ] Feedback loop vers ML

### Optimisations
- [ ] Batch processing intelligent
- [ ] Cache des résultats
- [ ] Compression d'images
- [ ] Lazy loading

---

## 📋 Phase 6 : Sécurité & Production

### Sécurité
- [ ] Audit de sécurité
- [ ] Rate limiting
- [ ] Validation des inputs
- [ ] Protection CSRF
- [ ] Headers sécurité (Helmet)
- [ ] Chiffrement données sensibles

### Monitoring & Logging
- [ ] Winston/Pino (backend)
- [ ] Error tracking (Sentry?)
- [ ] Monitoring performances
- [ ] Logs centralisés

### Documentation
- [ ] Documentation API (Swagger)
- [ ] Guide utilisateur
- [ ] Guide déploiement
- [ ] Documentation technique

---

## 📋 Phase 7 : Tests & Déploiement

### Tests finaux
- [ ] Tests d'intégration complets
- [ ] Tests de charge
- [ ] Tests de sécurité
- [ ] UAT (User Acceptance Testing)

### Déploiement
- [ ] Configuration production
- [ ] Setup serveur (OVH/AWS)
- [ ] CI/CD pipeline
- [ ] Backups automatiques
- [ ] SSL/HTTPS
- [ ] Monitoring production

---

## 🎯 Features Bonus (Si temps disponible)

- [ ] Export CSV/PDF des données
- [ ] API publique pour chercheurs
- [ ] Webhooks pour événements
- [ ] Notifications email
- [ ] Multi-langue (i18n)
- [ ] Mode sombre
- [ ] Application mobile (PWA)
- [ ] Tests A/B
- [ ] Analytics avancées

---

## 📊 Métriques de succès MVP

- [ ] Upload et traitement de 100+ images
- [ ] Détection avec >80% de précision
- [ ] Temps de traitement <10s par image
- [ ] Interface responsive et intuitive
- [ ] Documentation complète
- [ ] Code coverage >80%
- [ ] Zero vulnerabilités critiques

---

**Dernière mise à jour** : 5 mars 2026
**Status** : 🚧 Phase 1 en cours
