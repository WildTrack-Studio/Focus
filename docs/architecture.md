# Architecture FOCUS

## Vue d'ensemble

FOCUS suit une architecture microservices modulaire avec trois composants principaux :

```
┌────────────────────────────────────────────────────────────────┐
│                        Client Browser                          │
└───────────────────────────┬────────────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                         │
│  - App Router (React Server Components)                       │
│  - TypeScript                                                  │
│  - Tailwind CSS + shadcn/ui                                   │
│  - Leaflet/Mapbox                                             │
└───────────────────────────┬────────────────────────────────────┘
                            │ HTTP/REST + JWT
                            ▼
┌────────────────────────────────────────────────────────────────┐
│                    Backend API (NestJS)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │     Auth     │  │   Projects   │  │   Images     │        │
│  │   Module     │  │   Module     │  │   Module     │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │    Users     │  │  Detections  │  │    Queue     │        │
│  │   Module     │  │   Module     │  │   Module     │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
└─────────┬─────────────────────┬──────────────────┬────────────┘
          │                     │                  │
          │                     │                  │
          ▼                     ▼                  ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│   PostgreSQL     │  │   Redis Queue    │  │  MinIO (S3)      │
│   (Metadata)     │  │   (Jobs)         │  │  (Images)        │
└──────────────────┘  └──────────────────┘  └──────────────────┘
                            │
                            ▼
                   ┌──────────────────┐
                   │   ML Service     │
                   │   (FastAPI)      │
                   │                  │
                   │  - YOLOv8        │
                   │  - PyTorch       │
                   │  - Classifier    │
                   └──────────────────┘
```

## Composants

### 1. Frontend (Next.js)

**Responsabilités :**
- Interface utilisateur
- Authentification client
- Upload d'images
- Visualisation des résultats
- Dashboard analytique
- Carte interactive

**Technologies :**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- React Query (data fetching)
- Zustand (state management)
- shadcn/ui (components)

### 2. Backend API (NestJS)

**Responsabilités :**
- Authentification & autorisation
- Gestion des projets/campagnes
- Métadonnées des images
- Orchestration du pipeline ML
- Gestion des utilisateurs
- API REST

**Modules :**
- `AuthModule` : JWT, RBAC
- `UsersModule` : Gestion utilisateurs
- `ProjectsModule` : Projets/campagnes
- `ImagesModule` : Upload, métadonnées
- `DetectionsModule` : Résultats ML
- `QueueModule` : Bull/Redis

**Technologies :**
- NestJS
- Prisma ORM
- PostgreSQL
- Bull (queue)
- JWT
- bcrypt

### 3. ML Service (FastAPI)

**Responsabilités :**
- Détection d'animaux (YOLOv8)
- Classification d'espèces
- Identification individuelle
- Calcul de confiance
- Batch processing

**Endpoints :**
- `POST /detect` : Détection sur une image
- `POST /classify` : Classification d'espèce
- `POST /batch` : Traitement par lots
- `GET /health` : Health check

**Technologies :**
- FastAPI
- PyTorch
- YOLOv8
- OpenCV
- NumPy

## Flux de données

### Pipeline de traitement d'images

```
1. Upload
   User → Frontend → Backend → S3 Storage
                  ↓
            Save metadata in DB

2. Detection Queue
   Backend → Redis Queue → ML Service
                          ↓
                    Process with YOLO
                          ↓
                    Return detections

3. Storage
   ML Service → Backend → Save to DB
                       ↓
                 Update image status

4. Validation (if low confidence)
   Expert → Frontend → Backend → Update DB
```

### Authentification

```
1. Login
   User → Frontend → Backend (verify credentials)
                  ↓
            Generate JWT + Refresh Token
                  ↓
            Frontend (store in httpOnly cookie)

2. Protected Request
   Frontend → Backend (JWT in header)
           ↓
      Validate JWT
           ↓
      Check permissions (RBAC)
           ↓
      Execute request
```

## Base de données

### Schéma principal

```prisma
User
├── id: UUID
├── email: String
├── password: String (hashed)
├── role: Enum (ADMIN, RESEARCHER, VALIDATOR)
└── projects: Project[]

Project
├── id: UUID
├── name: String
├── description: String
├── location: GeoJSON
├── users: User[]
└── images: Image[]

Image
├── id: UUID
├── filename: String
├── s3Key: String
├── metadata: JSON
├── status: Enum (PENDING, PROCESSING, COMPLETED)
├── projectId: UUID
└── detections: Detection[]

Detection
├── id: UUID
├── imageId: UUID
├── species: String
├── confidence: Float
├── boundingBox: JSON
├── validated: Boolean
└── validatedBy: UUID
```

## Sécurité

### Couches de sécurité

1. **Authentification** : JWT avec refresh tokens
2. **Autorisation** : RBAC (Role-Based Access Control)
3. **Chiffrement** : HTTPS en production
4. **Validation** : DTOs avec class-validator
5. **Rate limiting** : Protection contre le spam
6. **CORS** : Configuration stricte
7. **Helmet** : Headers de sécurité HTTP

### Rôles

- **ADMIN** : Accès complet
- **RESEARCHER** : Création de projets, upload, analyse
- **VALIDATOR** : Validation des détections uniquement

## Scalabilité

### Stratégies

1. **Horizontal scaling** : Plusieurs instances backend
2. **Queue system** : Redis Bull pour traitement asynchrone
3. **CDN** : Distribution du frontend
4. **Database pooling** : Connexions optimisées
5. **Caching** : Redis pour cache applicatif
6. **S3 storage** : Stockage distribué

### Performance

- **Batch processing** : Traitement par lots (ML)
- **Lazy loading** : Chargement progressif frontend
- **Database indexes** : Optimisation des requêtes
- **Image optimization** : Compression et redimensionnement

## Monitoring

### Outils recommandés

- **Logs** : Winston (Backend), Pino (NestJS)
- **APM** : Sentry pour error tracking
- **Metrics** : Prometheus + Grafana
- **Uptime** : UptimeRobot
- **Database** : pg_stat_statements

## Environnements

### Development
- Docker Compose local
- Hot reload activé
- Debugging tools
- Seed data

### Staging
- Clone de production
- Tests d'intégration
- Performance testing

### Production
- Auto-scaling
- Backups automatisés
- Monitoring 24/7
- HTTPS obligatoire
