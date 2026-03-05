# Module Detections

Ce module gère les détections d'animaux générées par les modèles de Machine Learning et leur validation par des experts.

## 📋 Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Modèle de données](#modèle-de-données)
- [Endpoints](#endpoints)
- [DTOs](#dtos)
- [Services](#services)
- [Contrôle d'accès](#contrôle-daccès)
- [Workflow de validation](#workflow-de-validation)
- [Statistiques](#statistiques)
- [Audit](#audit)
- [Exemples d'utilisation](#exemples-dutilisation)

## 🎯 Vue d'ensemble

Le module Detections fournit une API REST complète pour :
- Enregistrer les résultats de détection ML
- Gérer les boîtes englobantes et scores de confiance
- Valider ou rejeter les détections
- Assigner des espèces aux détections
- Filtrer et rechercher des détections
- Générer des statistiques de détection

### Fonctionnalités principales

- ✅ CRUD complet des détections
- ✅ Validation par des experts (VALIDATOR, ADMIN)
- ✅ Gestion des statuts (PENDING_VALIDATION, VALIDATED, REJECTED)
- ✅ Scores de confiance et boîtes englobantes
- ✅ Association avec espèces
- ✅ Filtrage multi-critères
- ✅ Validation en lot (batch)
- ✅ Statistiques détaillées
- ✅ Audit logging complet
- ✅ Contrôle d'accès RBAC

## 📊 Modèle de données

### Detection

```prisma
model Detection {
  id              String          @id @default(uuid())
  confidence      Float           // Score 0-1
  boundingBox     Json            // {x, y, width, height}
  speciesId       String?
  predictedLabel  String?
  status          DetectionStatus @default(PENDING_VALIDATION)
  validated       Boolean         @default(false)
  validatedById   String?
  validatedAt     DateTime?
  mlModelVersion  String?
  additionalData  Json?
  projectId       String?
  imageId         String
  
  // Relations
  species       Species?
  validatedBy   User?
  project       Project?
  image         Image
  
  // Timestamps
  createdAt     DateTime
  updatedAt     DateTime
}
```

### Enum DetectionStatus

```typescript
enum DetectionStatus {
  PENDING_VALIDATION  // En attente de validation
  VALIDATED           // Validée par un expert
  REJECTED            // Rejetée par un expert
}
```

### BoundingBox Format

```typescript
{
  x: number;      // Coordonnée X (pixels)
  y: number;      // Coordonnée Y (pixels)
  width: number;  // Largeur (pixels)
  height: number; // Hauteur (pixels)
}
```

## 🔌 Endpoints

### POST /api/v1/detections
Créer une nouvelle détection.

**Authentification** : Requise (ADMIN, RESEARCHER)

**Body** :
```typescript
{
  imageId: string;              // UUID de l'image
  projectId?: string;           // UUID du projet (optionnel)
  confidence: number;           // Score 0-1
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  speciesId?: string;           // UUID de l'espèce
  predictedLabel?: string;      // Label prédit
  mlModelVersion?: string;      // Version du modèle
  additionalData?: any;         // Données additionnelles
}
```

**Réponse** : `DetectionEntity`

**Codes de statut** :
- `201` : Détection créée avec succès
- `400` : Données invalides
- `403` : Accès refusé
- `404` : Image ou espèce non trouvée

**Exemple** :
```bash
curl -X POST http://localhost:4000/api/v1/detections \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "imageId": "123e4567-e89b-12d3-a456-426614174000",
    "confidence": 0.95,
    "boundingBox": {"x": 100, "y": 150, "width": 200, "height": 300},
    "predictedLabel": "lion",
    "mlModelVersion": "yolov8-wildlife-v1.2"
  }'
```

---

### GET /api/v1/detections
Récupérer toutes les détections avec filtres.

**Authentification** : Requise

**Query Parameters** :
- `projectId` (string, optional) : Filtrer par projet
- `imageId` (string, optional) : Filtrer par image
- `speciesId` (string, optional) : Filtrer par espèce
- `status` (DetectionStatus, optional) : Filtrer par statut
- `validated` (boolean, optional) : Filtrer par état de validation
- `validatedById` (string, optional) : Filtrer par validateur
- `minConfidence` (number, optional) : Confiance minimale (0-1)
- `page` (number, optional, default: 1) : Numéro de page
- `limit` (number, optional, default: 20) : Éléments par page
- `sortBy` (string, optional, default: 'createdAt') : Champ de tri
- `sortOrder` ('asc' | 'desc', optional, default: 'desc') : Ordre de tri

**Réponse** :
```typescript
{
  data: DetectionEntity[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
```

**Codes de statut** :
- `200` : Liste récupérée avec succès
- `403` : Accès refusé

**Exemple** :
```bash
curl -X GET "http://localhost:4000/api/v1/detections?status=PENDING_VALIDATION&minConfidence=0.8&page=1" \
  -H "Authorization: Bearer <token>"
```

---

### GET /api/v1/detections/statistics
Récupérer les statistiques des détections.

**Authentification** : Requise (ADMIN)

**Query Parameters** :
- `projectId` (string, optional) : Statistiques pour un projet spécifique

**Réponse** :
```typescript
{
  total: number;
  byStatus: {
    PENDING_VALIDATION: number;
    VALIDATED: number;
    REJECTED: number;
  };
  validated: number;
  pending: number;
  rejected: number;
  averageConfidence: number;
  topSpecies: Array<{
    species: {
      id: string;
      name: string;
      scientificName: string | null;
    };
    count: number;
  }>;
}
```

**Codes de statut** :
- `200` : Statistiques récupérées avec succès
- `403` : Accès refusé (admin seulement)

**Exemple** :
```bash
curl -X GET http://localhost:4000/api/v1/detections/statistics?projectId=123 \
  -H "Authorization: Bearer <token>"
```

---

### GET /api/v1/detections/:id
Récupérer une détection par son ID.

**Authentification** : Requise

**Paramètres** :
- `id` (string) : UUID de la détection

**Réponse** : `DetectionEntity`

**Codes de statut** :
- `200` : Détection récupérée avec succès
- `403` : Accès refusé
- `404` : Détection non trouvée

**Exemple** :
```bash
curl -X GET http://localhost:4000/api/v1/detections/123e4567-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer <token>"
```

---

### PATCH /api/v1/detections/:id
Mettre à jour une détection.

**Authentification** : Requise (ADMIN, RESEARCHER)

**Paramètres** :
- `id` (string) : UUID de la détection

**Body** :
```typescript
{
  speciesId?: string;
  predictedLabel?: string;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  additionalData?: any;
}
```

**Réponse** : `DetectionEntity`

**Codes de statut** :
- `200` : Détection mise à jour avec succès
- `400` : Données invalides
- `403` : Accès refusé
- `404` : Détection non trouvée

**Exemple** :
```bash
curl -X PATCH http://localhost:4000/api/v1/detections/123e4567-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"speciesId": "species-uuid", "predictedLabel": "leopard"}'
```

---

### POST /api/v1/detections/:id/validate
Valider ou rejeter une détection.

**Authentification** : Requise (ADMIN, VALIDATOR)

**Paramètres** :
- `id` (string) : UUID de la détection

**Body** :
```typescript
{
  status: DetectionStatus;  // VALIDATED ou REJECTED
  speciesId?: string;       // Espèce corrigée (optionnel)
  notes?: string;           // Notes de validation
}
```

**Réponse** : `DetectionEntity`

**Codes de statut** :
- `200` : Détection validée avec succès
- `400` : Données invalides
- `403` : Accès refusé (validator/admin seulement)
- `404` : Détection non trouvée

**Exemple** :
```bash
curl -X POST http://localhost:4000/api/v1/detections/123e4567-e89b-12d3-a456-426614174000/validate \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "VALIDATED",
    "speciesId": "species-uuid",
    "notes": "Espèce confirmée, bon angle de vue"
  }'
```

---

### POST /api/v1/detections/batch/validate
Validation en lot de plusieurs détections.

**Authentification** : Requise (ADMIN, VALIDATOR)

**Body** :
```typescript
{
  ids: string[];            // Liste d'UUIDs
  status: DetectionStatus;  // VALIDATED ou REJECTED
}
```

**Réponse** :
```typescript
{
  updated: number;    // Nombre de détections mises à jour
  errors: string[];   // Liste des erreurs
}
```

**Codes de statut** :
- `200` : Validation en lot effectuée
- `403` : Accès refusé (validator/admin seulement)

**Exemple** :
```bash
curl -X POST http://localhost:4000/api/v1/detections/batch/validate \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "ids": ["uuid1", "uuid2", "uuid3"],
    "status": "VALIDATED"
  }'
```

---

### DELETE /api/v1/detections/:id
Supprimer une détection.

**Authentification** : Requise (ADMIN)

**Paramètres** :
- `id` (string) : UUID de la détection

**Réponse** :
```typescript
{
  message: "Détection supprimée avec succès"
}
```

**Codes de statut** :
- `200` : Détection supprimée avec succès
- `403` : Accès refusé (admin seulement)
- `404` : Détection non trouvée

**Exemple** :
```bash
curl -X DELETE http://localhost:4000/api/v1/detections/123e4567-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer <token>"
```

## 📝 DTOs

### CreateDetectionDto

```typescript
class CreateDetectionDto {
  @IsUUID()
  @IsNotEmpty()
  imageId: string;

  @IsOptional()
  @IsUUID()
  projectId?: string;

  @IsNumber()
  @Min(0)
  @Max(1)
  confidence: number;

  @IsObject()
  @IsNotEmpty()
  boundingBox: BoundingBoxDto;

  @IsOptional()
  @IsUUID()
  speciesId?: string;

  @IsOptional()
  @IsString()
  predictedLabel?: string;

  @IsOptional()
  @IsString()
  mlModelVersion?: string;

  @IsOptional()
  @IsObject()
  additionalData?: any;
}
```

### BoundingBoxDto

```typescript
class BoundingBoxDto {
  @IsNumber()
  @Min(0)
  x: number;

  @IsNumber()
  @Min(0)
  y: number;

  @IsNumber()
  @Min(0)
  width: number;

  @IsNumber()
  @Min(0)
  height: number;
}
```

### UpdateDetectionDto

```typescript
class UpdateDetectionDto {
  @IsOptional()
  @IsUUID()
  speciesId?: string;

  @IsOptional()
  @IsString()
  predictedLabel?: string;

  @IsOptional()
  @IsObject()
  boundingBox?: BoundingBoxDto;

  @IsOptional()
  @IsObject()
  additionalData?: any;
}
```

### ValidateDetectionDto

```typescript
class ValidateDetectionDto {
  @IsEnum(DetectionStatus)
  status: DetectionStatus;

  @IsOptional()
  @IsUUID()
  speciesId?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
```

### QueryDetectionsDto

```typescript
class QueryDetectionsDto {
  @IsOptional()
  @IsUUID()
  projectId?: string;

  @IsOptional()
  @IsUUID()
  imageId?: string;

  @IsOptional()
  @IsUUID()
  speciesId?: string;

  @IsOptional()
  @IsEnum(DetectionStatus)
  status?: DetectionStatus;

  @IsOptional()
  @IsBoolean()
  validated?: boolean;

  @IsOptional()
  @IsUUID()
  validatedById?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minConfidence?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number = 20;

  @IsOptional()
  sortBy?: 'createdAt' | 'confidence' | 'validatedAt' = 'createdAt';

  @IsOptional()
  sortOrder?: 'asc' | 'desc' = 'desc';
}
```

## 🛠️ Services

### DetectionsService

Le service principal qui gère toute la logique métier :

#### Méthodes principales

##### `create(createDto, userId, userRole)`
Crée une nouvelle détection.

**Fonctionnalités** :
- Vérifie l'existence de l'image
- Vérifie l'accès au projet
- Valide l'espèce si fournie
- Crée la détection avec statut PENDING_VALIDATION
- Enregistre un audit log

**Paramètres** :
- `createDto` : Données de la détection
- `userId` : ID de l'utilisateur
- `userRole` : Rôle de l'utilisateur

**Retourne** : `DetectionEntity`

**Exceptions** :
- `NotFoundException` : Image ou espèce non trouvée
- `ForbiddenException` : Pas d'accès au projet

---

##### `findAll(query, userId, userRole)`
Récupère toutes les détections avec filtres.

**Fonctionnalités** :
- Filtrage multi-critères (projet, image, espèce, statut, confiance)
- Contrôle d'accès basé sur les rôles
- Pagination et tri
- Inclusion des relations (espèce, validateur)

**Logique d'accès** :
- **ADMIN** : Voit toutes les détections
- **Autres** : Uniquement les détections de leurs projets

**Paramètres** :
- `query` : Paramètres de recherche et pagination
- `userId` : ID de l'utilisateur actuel
- `userRole` : Rôle de l'utilisateur

**Retourne** :
```typescript
{
  data: DetectionEntity[];
  meta: PaginationMeta;
}
```

---

##### `findOne(id, userId, userRole)`
Récupère une détection par son ID.

**Paramètres** :
- `id` : UUID de la détection
- `userId` : ID de l'utilisateur
- `userRole` : Rôle de l'utilisateur

**Retourne** : `DetectionEntity`

**Exceptions** :
- `NotFoundException` : Détection non trouvée
- `ForbiddenException` : Pas d'accès

---

##### `update(id, updateDto, userId, userRole)`
Met à jour une détection.

**Paramètres** :
- `id` : UUID de la détection
- `updateDto` : Données à mettre à jour
- `userId` : ID de l'utilisateur
- `userRole` : Rôle de l'utilisateur

**Retourne** : `DetectionEntity`

**Audit** : Enregistre un log `DETECTION_UPDATED`

---

##### `validate(id, validateDto, userId, userRole)`
Valide ou rejette une détection.

**Restrictions** : ADMIN et VALIDATOR uniquement

**Fonctionnalités** :
- Change le statut (VALIDATED ou REJECTED)
- Marque `validated` à true/false
- Enregistre le validateur et la date
- Permet de corriger l'espèce
- Enregistre les notes de validation

**Paramètres** :
- `id` : UUID de la détection
- `validateDto` : Données de validation
- `userId` : ID de l'utilisateur
- `userRole` : Rôle de l'utilisateur

**Retourne** : `DetectionEntity`

**Audit** : Enregistre un log `DETECTION_VALIDATED`

**Exceptions** :
- `ForbiddenException` : Rôle insuffisant
- `NotFoundException` : Détection ou espèce non trouvée

---

##### `remove(id, userId, userRole)`
Supprime une détection.

**Restrictions** : ADMIN uniquement

**Paramètres** :
- `id` : UUID de la détection
- `userId` : ID de l'utilisateur
- `userRole` : Rôle de l'utilisateur

**Retourne** : `{ message: string }`

**Audit** : Enregistre un log `DETECTION_DELETED`

---

##### `getStatistics(projectId?)`
Récupère les statistiques des détections.

**Paramètres** :
- `projectId` (optional) : Filtrer par projet

**Retourne** :
```typescript
{
  total: number;
  byStatus: Record<DetectionStatus, number>;
  validated: number;
  pending: number;
  rejected: number;
  averageConfidence: number;
  topSpecies: Array<{
    species: Species;
    count: number;
  }>;
}
```

---

##### `batchValidate(ids, status, userId, userRole)`
Validation en lot de plusieurs détections.

**Restrictions** : ADMIN et VALIDATOR uniquement

**Paramètres** :
- `ids` : Liste d'UUIDs
- `status` : Statut à appliquer
- `userId` : ID de l'utilisateur
- `userRole` : Rôle de l'utilisateur

**Retourne** :
```typescript
{
  updated: number;
  errors: string[];
}
```

## 🔒 Contrôle d'accès

### Création de détections
- **ADMIN** : Peut créer pour n'importe quel projet
- **RESEARCHER** : Peut créer pour ses projets assignés
- **VALIDATOR** : ❌ Non autorisé

### Lecture de détections
- **ADMIN** : Voit toutes les détections
- **RESEARCHER** : Voit les détections de ses projets
- **VALIDATOR** : Voit les détections de ses projets

### Modification de détections
- **ADMIN** : Peut modifier toutes les détections
- **RESEARCHER** : Peut modifier les détections de ses projets
- **VALIDATOR** : ❌ Non autorisé (sauf validation)

### Validation de détections
- **ADMIN** : ✅ Peut valider toutes les détections
- **VALIDATOR** : ✅ Peut valider les détections de ses projets
- **RESEARCHER** : ❌ Non autorisé

### Suppression de détections
- **ADMIN** : ✅ Peut supprimer toutes les détections
- **RESEARCHER** : ❌ Non autorisé
- **VALIDATOR** : ❌ Non autorisé

### Statistiques
- **ADMIN** : ✅ Accès complet
- **RESEARCHER** : ❌ Non autorisé
- **VALIDATOR** : ❌ Non autorisé

## 🔄 Workflow de validation

### 1. Création initiale
```
ML Model → API → create() → Status: PENDING_VALIDATION
```

### 2. Assignation au validateur
```
ADMIN → assign project → VALIDATOR can access detections
```

### 3. Validation par l'expert
```
VALIDATOR → validate(VALIDATED/REJECTED) → Detection updated
```

### 4. États possibles

#### PENDING_VALIDATION
- Détection créée mais non validée
- Visible par tous les membres du projet
- En attente de review

#### VALIDATED
- Validée par un expert
- `validated = true`
- Espèce confirmée ou corrigée
- Date et validateur enregistrés

#### REJECTED
- Rejetée par un expert
- `validated = false`
- Raison dans `additionalData.validationNotes`
- Ne compte pas dans les statistiques finales

### 5. Batch Validation
Pour accélérer le processus :
```typescript
batchValidate([id1, id2, id3], VALIDATED)
```

## 📊 Statistiques

### Statistiques globales

```typescript
{
  total: 5000,                    // Total des détections
  byStatus: {
    PENDING_VALIDATION: 1200,
    VALIDATED: 3500,
    REJECTED: 300
  },
  validated: 3500,
  pending: 1200,
  rejected: 300,
  averageConfidence: 0.87,        // Confiance moyenne
  topSpecies: [
    {
      species: {
        id: "uuid",
        name: "Lion",
        scientificName: "Panthera leo"
      },
      count: 450
    },
    // ... top 5
  ]
}
```

### Statistiques par projet

Appeler avec `?projectId=xxx` pour filtrer par projet.

### Métriques utiles

- **Taux de validation** : `validated / total`
- **Taux de rejet** : `rejected / total`
- **Précision du modèle** : Basée sur les validations
- **Espèces les plus fréquentes** : Top 5 espèces détectées

## 📝 Audit

### Actions enregistrées

1. **DETECTION_CREATED**
   ```json
   {
     "action": "DETECTION_CREATED",
     "entity": "Detection",
     "entityId": "detection-uuid",
     "changes": {
       "imageId": "image-uuid",
       "projectId": "project-uuid",
       "confidence": 0.95,
       "predictedLabel": "lion"
     }
   }
   ```

2. **DETECTION_UPDATED**
   ```json
   {
     "action": "DETECTION_UPDATED",
     "entity": "Detection",
     "entityId": "detection-uuid",
     "changes": {
       "updates": {
         "speciesId": "species-uuid",
         "predictedLabel": "leopard"
       },
       "updatedBy": "user-uuid"
     }
   }
   ```

3. **DETECTION_VALIDATED**
   ```json
   {
     "action": "DETECTION_VALIDATED",
     "entity": "Detection",
     "entityId": "detection-uuid",
     "changes": {
       "status": "VALIDATED",
       "validated": true,
       "validatedBy": "validator-uuid",
       "speciesId": "species-uuid",
       "notes": "Espèce confirmée"
     }
   }
   ```

4. **DETECTION_DELETED**
   ```json
   {
     "action": "DETECTION_DELETED",
     "entity": "Detection",
     "entityId": "detection-uuid",
     "changes": {
       "imageId": "image-uuid",
       "projectId": "project-uuid",
       "confidence": 0.95,
       "deletedBy": "user-uuid"
     }
   }
   ```

## 💡 Exemples d'utilisation

### Créer une détection depuis le ML

```typescript
// Service ML → API
const createDetection = async (mlResult: MLResult) => {
  const response = await fetch('http://localhost:4000/api/v1/detections', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${mlServiceToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      imageId: mlResult.imageId,
      confidence: mlResult.confidence,
      boundingBox: {
        x: mlResult.bbox.x,
        y: mlResult.bbox.y,
        width: mlResult.bbox.width,
        height: mlResult.bbox.height
      },
      predictedLabel: mlResult.label,
      mlModelVersion: 'yolov8-wildlife-v1.2',
      additionalData: {
        features: mlResult.features,
        processingTime: mlResult.timing
      }
    })
  });

  return await response.json();
};
```

### Récupérer les détections en attente

```typescript
const getPendingDetections = async (projectId: string) => {
  const params = new URLSearchParams({
    projectId,
    status: 'PENDING_VALIDATION',
    sortBy: 'confidence',
    sortOrder: 'desc',
    limit: '50'
  });

  const response = await fetch(
    `http://localhost:4000/api/v1/detections?${params}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );

  return await response.json();
};
```

### Valider une détection

```typescript
const validateDetection = async (
  detectionId: string,
  speciesId: string,
  notes: string
) => {
  const response = await fetch(
    `http://localhost:4000/api/v1/detections/${detectionId}/validate`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${validatorToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status: 'VALIDATED',
        speciesId,
        notes
      })
    }
  );

  return await response.json();
};
```

### Validation en lot

```typescript
const batchValidateDetections = async (
  detectionIds: string[],
  status: 'VALIDATED' | 'REJECTED'
) => {
  const response = await fetch(
    'http://localhost:4000/api/v1/detections/batch/validate',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${validatorToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ids: detectionIds,
        status
      })
    }
  );

  return await response.json();
};
```

### Filtrer par confiance minimale

```typescript
const getHighConfidenceDetections = async (
  projectId: string,
  minConfidence = 0.9
) => {
  const params = new URLSearchParams({
    projectId,
    minConfidence: minConfidence.toString(),
    status: 'PENDING_VALIDATION',
    page: '1',
    limit: '100'
  });

  const response = await fetch(
    `http://localhost:4000/api/v1/detections?${params}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );

  return await response.json();
};
```

### Obtenir les statistiques

```typescript
const getProjectStats = async (projectId: string) => {
  const response = await fetch(
    `http://localhost:4000/api/v1/detections/statistics?projectId=${projectId}`,
    {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    }
  );

  const stats = await response.json();
  
  console.log(`Total détections: ${stats.total}`);
  console.log(`Validées: ${stats.validated}`);
  console.log(`En attente: ${stats.pending}`);
  console.log(`Confiance moyenne: ${stats.averageConfidence}`);
  console.log('Top espèces:', stats.topSpecies);
  
  return stats;
};
```

## 🚀 Améliorations futures

### Court terme
- [ ] Webhooks pour notifications de validation
- [ ] Export des détections validées (CSV, JSON)
- [ ] Filtrage par plage de dates
- [ ] Recherche full-text dans notes

### Moyen terme
- [ ] Système de scoring des validateurs
- [ ] Détection de doublons (IoU)
- [ ] Suggestions d'espèces basées sur ML
- [ ] Timeline de validation par projet

### Long terme
- [ ] Active Learning pipeline
- [ ] Model retraining automatique
- [ ] Consensus multi-validateurs
- [ ] Integration avec annotation tools (CVAT, LabelStudio)

## 📚 Ressources

- [YOLO Documentation](https://docs.ultralytics.com/)
- [Object Detection Metrics](https://github.com/rafaelpadilla/Object-Detection-Metrics)
- [Active Learning Strategies](https://modal-python.readthedocs.io/en/latest/content/overview/active_learning.html)
- [Human-in-the-Loop ML](https://www.manning.com/books/human-in-the-loop-machine-learning)

---

**Module développé pour Focus - WildTrack Studio**
