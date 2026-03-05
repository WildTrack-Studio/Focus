# Module Projects - FOCUS

## 📋 Description

Le module **Projects** gère l'ensemble des projets de recherche sur la faune sauvage. Il permet la création, modification, suppression de projets, ainsi que la gestion des assignations d'utilisateurs aux projets. Les projets servent de conteneurs pour organiser les images, détections et espèces étudiées.

## 🏗️ Architecture

```
projects/
├── dto/
│   ├── create-project.dto.ts       # DTO pour créer un projet
│   ├── update-project.dto.ts       # DTO pour mettre à jour un projet
│   ├── add-user-to-project.dto.ts  # DTO pour ajouter un utilisateur
│   └── query-projects.dto.ts       # DTO pour filtrer et paginer
├── entities/
│   ├── project.entity.ts           # Entité Project pour Swagger
│   └── project-user.entity.ts      # Entité ProjectUser pour Swagger
├── projects.controller.ts          # Routes API REST
├── projects.service.ts             # Logique métier
└── projects.module.ts              # Configuration du module
```

## 🔐 Permissions et Rôles

### ADMIN
- ✅ Créer des projets
- ✅ Modifier des projets
- ✅ Supprimer des projets
- ✅ Voir tous les projets
- ✅ Ajouter/retirer des utilisateurs aux projets
- ✅ Voir les statistiques

### RESEARCHER / VALIDATOR
- ✅ Voir les projets auxquels ils sont assignés
- ✅ Voir les détails d'un projet (si assigné)
- ✅ Voir les utilisateurs d'un projet (si assigné)

## 🔌 Endpoints

### 1. Créer un projet
```http
POST /api/v1/projects
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Étude des lions du Serengeti",
  "description": "Étude comportementale des lions dans le parc national du Serengeti",
  "location": "Parc National du Serengeti, Tanzanie",
  "startDate": "2024-01-01",
  "endDate": "2024-12-31"
}
```

**Réponse (201):**
```json
{
  "id": "uuid",
  "name": "Étude des lions du Serengeti",
  "description": "Étude comportementale des lions dans le parc national du Serengeti",
  "location": "Parc National du Serengeti, Tanzanie",
  "startDate": "2024-01-01T00:00:00.000Z",
  "endDate": "2024-12-31T00:00:00.000Z",
  "createdAt": "2024-03-05T10:30:00.000Z",
  "updatedAt": "2024-03-05T10:30:00.000Z"
}
```

### 2. Lister les projets (avec pagination et filtres)
```http
GET /api/v1/projects?search=lion&location=Tanzanie&page=1&limit=10
Authorization: Bearer <token>
```

**Réponse (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Étude des lions du Serengeti",
      "description": "Étude comportementale...",
      "location": "Parc National du Serengeti, Tanzanie",
      "startDate": "2024-01-01T00:00:00.000Z",
      "endDate": "2024-12-31T00:00:00.000Z",
      "createdAt": "2024-03-05T10:30:00.000Z",
      "updatedAt": "2024-03-05T10:30:00.000Z",
      "userCount": 5,
      "imageCount": 150,
      "detectionCount": 342
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

**Notes:**
- Admin voit **tous** les projets
- Les autres rôles ne voient que **leurs** projets assignés

### 3. Récupérer les statistiques
```http
GET /api/v1/projects/statistics
Authorization: Bearer <admin_token>
```

**Réponse (200):**
```json
{
  "totalProjects": 15,
  "totalImages": 2340,
  "totalDetections": 5678,
  "averageImagesPerProject": 156,
  "topProjects": [
    {
      "id": "uuid",
      "name": "Étude des lions du Serengeti",
      "imageCount": 450,
      "detectionCount": 892
    }
  ]
}
```

### 4. Récupérer un projet par ID
```http
GET /api/v1/projects/:id
Authorization: Bearer <token>
```

**Réponse (200):** Même format que la création avec compteurs.

**Notes:**
- Admin peut voir tous les projets
- Les autres doivent être assignés au projet

### 5. Mettre à jour un projet
```http
PATCH /api/v1/projects/:id
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Étude des lions du Serengeti - Phase 2",
  "endDate": "2025-06-30"
}
```

**Réponse (200):** Projet mis à jour.

### 6. Supprimer un projet
```http
DELETE /api/v1/projects/:id
Authorization: Bearer <admin_token>
```

**Réponse (200):**
```json
{
  "message": "Projet supprimé avec succès"
}
```

**Notes:**
- Impossible de supprimer un projet contenant des images ou détections
- Supprime automatiquement les assignations d'utilisateurs (cascade)

### 7. Ajouter un utilisateur à un projet
```http
POST /api/v1/projects/:id/users
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "userId": "user-uuid"
}
```

**Réponse (201):**
```json
{
  "id": "project-user-uuid",
  "projectId": "project-uuid",
  "userId": "user-uuid",
  "user": {
    "id": "user-uuid",
    "email": "researcher@example.com",
    "firstName": "Jane",
    "lastName": "Doe",
    "role": "RESEARCHER"
  },
  "createdAt": "2024-03-05T10:30:00.000Z"
}
```

### 8. Lister les utilisateurs d'un projet
```http
GET /api/v1/projects/:id/users
Authorization: Bearer <token>
```

**Réponse (200):**
```json
[
  {
    "id": "project-user-uuid",
    "projectId": "project-uuid",
    "userId": "user-uuid",
    "user": {
      "id": "user-uuid",
      "email": "researcher@example.com",
      "firstName": "Jane",
      "lastName": "Doe",
      "role": "RESEARCHER"
    },
    "createdAt": "2024-03-05T10:30:00.000Z"
  }
]
```

### 9. Retirer un utilisateur d'un projet
```http
DELETE /api/v1/projects/:projectId/users/:userId
Authorization: Bearer <admin_token>
```

**Réponse (200):**
```json
{
  "message": "Utilisateur retiré du projet avec succès"
}
```

## 📊 Fonctionnalités

### Recherche et Filtres
- **Recherche textuelle** : Par nom ou description (insensible à la casse)
- **Filtre par localisation** : Recherche partielle
- **Filtre par utilisateur** : Voir les projets d'un utilisateur spécifique
- **Pagination** : page et limit configurables
- **Tri** : par createdAt, name, startDate, endDate (asc/desc)

### Contrôle d'accès
- **Admin** : Accès complet à tous les projets
- **Autres rôles** : Accès uniquement aux projets assignés
- **Audit** : Toutes les actions sont loggées

### Statistiques
- Nombre total de projets
- Nombre total d'images et détections
- Moyenne d'images par projet
- Top 5 projets par nombre d'images

### Validation des Données
- **Nom** : Requis, non vide
- **Description** : Optionnelle
- **Location** : Optionnelle, texte libre
- **Dates** : Optionnelles, format ISO 8601
- **userId** : UUID v4 valide

### Sécurité
- **Guards JWT** : Toutes les routes sont protégées
- **RBAC** : Contrôle d'accès basé sur les rôles
- **Audit logs** : Toutes les actions sont tracées
- **Cascade delete** : Suppression des assignations automatique
- **Protection** : Impossible de supprimer un projet avec des données

### Audit Logging
Actions tracées dans `audit_logs`:
- `PROJECT_CREATED` : Création d'un projet
- `PROJECT_UPDATED` : Modification d'un projet
- `PROJECT_DELETED` : Suppression d'un projet
- `USER_ADDED_TO_PROJECT` : Ajout d'un utilisateur
- `USER_REMOVED_FROM_PROJECT` : Retrait d'un utilisateur

## 🧪 Tests avec curl

### 1. Créer un projet (Admin)
```bash
curl -X POST http://localhost:4000/api/v1/projects \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Étude des éléphants de Kruger",
    "description": "Suivi des troupeaux d'\''éléphants",
    "location": "Parc National Kruger, Afrique du Sud",
    "startDate": "2024-06-01",
    "endDate": "2025-05-31"
  }'
```

### 2. Lister ses projets
```bash
curl -X GET "http://localhost:4000/api/v1/projects?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Ajouter un utilisateur au projet
```bash
curl -X POST http://localhost:4000/api/v1/projects/PROJECT_ID/users \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_UUID"
  }'
```

### 4. Voir les statistiques
```bash
curl -X GET http://localhost:4000/api/v1/projects/statistics \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## 🔧 Configuration

Le module utilise les variables d'environnement suivantes (héritées):
- `JWT_SECRET` : Clé secrète pour la validation des tokens
- `DATABASE_URL` : Connexion à PostgreSQL

## 📚 Utilisation dans le Code

### Importer le Module
```typescript
import { ProjectsModule } from './modules/projects/projects.module';

@Module({
  imports: [ProjectsModule],
})
export class AppModule {}
```

### Utiliser le Service
```typescript
import { ProjectsService } from './modules/projects/projects.service';

@Injectable()
export class SomeService {
  constructor(private projectsService: ProjectsService) {}

  async example() {
    const projects = await this.projectsService.findAll(query, userId, userRole);
    const stats = await this.projectsService.getStatistics();
  }
}
```

## 🔗 Relations avec d'autres Modules

- **AuthModule** : Fournit les guards et decorators pour la protection des routes
- **UsersModule** : Gestion des assignations d'utilisateurs
- **ImagesModule** (futur) : Images attachées aux projets
- **DetectionsModule** (futur) : Détections liées aux projets
- **SpeciesModule** (futur) : Espèces étudiées dans les projets

## 📖 Documentation Swagger

La documentation interactive est disponible à : `http://localhost:4000/api/v1/docs`

Tous les endpoints sont documentés avec :
- Descriptions détaillées
- Exemples de requêtes/réponses
- Codes de statut HTTP
- Schémas de validation

## 🛡️ Bonnes Pratiques

1. **Assignation d'utilisateurs** : Toujours assigner au moins un RESEARCHER ou VALIDATOR
2. **Dates cohérentes** : startDate doit être avant endDate
3. **Suppression** : Toujours vérifier qu'un projet est vide avant suppression
4. **Audit logging** : Toutes les actions sont tracées pour la conformité
5. **Contrôle d'accès** : Les non-admins ne voient que leurs projets

## 🐛 Gestion des Erreurs

| Code | Description | Solution |
|------|-------------|----------|
| 400 | Validation échouée | Vérifier le format des données |
| 401 | Non authentifié | Fournir un token JWT valide |
| 403 | Accès refusé | Vérifier les permissions (rôle ADMIN ou assignation) |
| 404 | Projet non trouvé | Vérifier l'ID fourni |
| 409 | Conflit | Utilisateur déjà assigné ou projet contient des données |

## 🚀 Prochaines Améliorations

- [ ] Support GeoJSON pour localisation précise
- [ ] Gestion des permissions granulaires par utilisateur
- [ ] Timeline des activités du projet
- [ ] Export des données du projet (CSV, JSON)
- [ ] Templates de projets
- [ ] Archivage des projets terminés
- [ ] Notifications sur les changements

## 📊 Modèle de Données

### Project
```typescript
{
  id: string;              // UUID
  name: string;            // Nom du projet
  description?: string;    // Description
  location?: string;       // Localisation textuelle
  startDate?: Date;        // Date de début
  endDate?: Date;          // Date de fin
  isPrivate: boolean;      // Visibilité (default: true)
  createdAt: Date;
  updatedAt: Date;
}
```

### ProjectUser (Association)
```typescript
{
  id: string;              // UUID
  projectId: string;       // Référence au projet
  userId: string;          // Référence à l'utilisateur
  createdAt: Date;
}
```

Contrainte unique : `@@unique([projectId, userId])` - Un utilisateur ne peut être assigné qu'une fois par projet.
