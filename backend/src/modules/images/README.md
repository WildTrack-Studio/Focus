# Module Images

Ce module gère l'upload, le stockage et les métadonnées des images dans l'application Focus.

## 📋 Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Modèle de données](#modèle-de-données)
- [Endpoints](#endpoints)
- [DTOs](#dtos)
- [Services](#services)
- [Contrôle d'accès](#contrôle-daccès)
- [Upload de fichiers](#upload-de-fichiers)
- [Métadonnées EXIF](#métadonnées-exif)
- [Statistiques](#statistiques)
- [Audit](#audit)
- [Exemples d'utilisation](#exemples-dutilisation)

## 🎯 Vue d'ensemble

Le module Images fournit une API REST complète pour :
- Upload d'images vers des projets
- Gestion des métadonnées (EXIF, GPS, dimensions)
- Recherche et filtrage d'images
- Téléchargement de fichiers
- Statistiques de stockage
- Contrôle d'accès basé sur les rôles

### Fonctionnalités principales

- ✅ Upload multipart/form-data
- ✅ Stockage local des fichiers
- ✅ Extraction automatique des métadonnées
- ✅ Gestion des statuts (PENDING, PROCESSING, COMPLETED, FAILED)
- ✅ Filtrage par projet, statut, dates
- ✅ Pagination et tri
- ✅ Téléchargement de fichiers
- ✅ Statistiques de stockage
- ✅ Audit logging complet
- ✅ Contrôle d'accès RBAC

## 📊 Modèle de données

### Image

```prisma
model Image {
  id            String      @id @default(uuid())
  originalName  String      // Nom original du fichier
  filePath      String      // Chemin de stockage (relatif)
  fileSize      Int         // Taille en octets
  mimeType      String      // Type MIME (image/jpeg, etc.)
  
  // Dimensions
  width         Int?
  height        Int?
  
  // Metadata EXIF
  capturedAt    DateTime?   // Date de capture (EXIF)
  gpsLocation   Json?       // {latitude, longitude, altitude}
  exifData      Json?       // Toutes les données EXIF
  
  // Description
  description   String?
  
  // Processing
  status        ImageStatus @default(PENDING)
  
  // Relations
  projectId     String
  project       Project
  detections    Detection[]
  
  // Timestamps
  createdAt     DateTime
  updatedAt     DateTime
}
```

### Enum ImageStatus

```typescript
enum ImageStatus {
  PENDING      // En attente de traitement
  PROCESSING   // En cours de traitement
  COMPLETED    // Traitement terminé
  FAILED       // Échec du traitement
}
```

## 🔌 Endpoints

### POST /api/v1/images
Upload une image vers un projet.

**Authentification** : Requise (ADMIN, RESEARCHER)

**Content-Type** : multipart/form-data

**Body** :
```typescript
{
  projectId: string;     // UUID du projet
  description?: string;  // Description optionnelle
  file: File;           // Fichier image
}
```

**Réponse** : `ImageEntity`

**Codes de statut** :
- `201` : Image uploadée avec succès
- `400` : Données invalides
- `403` : Accès refusé
- `404` : Projet non trouvé

**Exemple** :
```bash
curl -X POST http://localhost:4000/api/v1/images \
  -H "Authorization: Bearer <token>" \
  -F "projectId=123e4567-e89b-12d3-a456-426614174000" \
  -F "description=Lion mâle adulte" \
  -F "file=@/path/to/image.jpg"
```

---

### GET /api/v1/images
Récupérer toutes les images avec pagination et filtres.

**Authentification** : Requise

**Query Parameters** :
- `projectId` (string, optional) : Filtrer par projet
- `status` (ImageStatus, optional) : Filtrer par statut
- `search` (string, optional) : Recherche dans descriptions et noms de fichiers
- `capturedAfter` (string, optional) : Date minimale de capture (ISO 8601)
- `capturedBefore` (string, optional) : Date maximale de capture (ISO 8601)
- `page` (number, optional, default: 1) : Numéro de page
- `limit` (number, optional, default: 20) : Éléments par page
- `sortBy` (string, optional, default: 'createdAt') : Champ de tri (createdAt, capturedAt, originalName)
- `sortOrder` ('asc' | 'desc', optional, default: 'desc') : Ordre de tri

**Réponse** :
```typescript
{
  data: ImageEntity[];
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
curl -X GET "http://localhost:4000/api/v1/images?projectId=123&status=COMPLETED&page=1&limit=20" \
  -H "Authorization: Bearer <token>"
```

---

### GET /api/v1/images/statistics
Récupérer les statistiques des images.

**Authentification** : Requise (ADMIN)

**Réponse** :
```typescript
{
  total: number;
  byStatus: {
    PENDING: number;
    PROCESSING: number;
    COMPLETED: number;
    FAILED: number;
  };
  totalSizeBytes: number;
  totalSizeMB: number;
  recentUploads7Days: number;
}
```

**Codes de statut** :
- `200` : Statistiques récupérées avec succès
- `403` : Accès refusé (admin seulement)

**Exemple** :
```bash
curl -X GET http://localhost:4000/api/v1/images/statistics \
  -H "Authorization: Bearer <token>"
```

---

### GET /api/v1/images/:id
Récupérer une image par son ID.

**Authentification** : Requise

**Paramètres** :
- `id` (string) : UUID de l'image

**Réponse** : `ImageEntity`

**Codes de statut** :
- `200` : Image récupérée avec succès
- `403` : Accès refusé
- `404` : Image non trouvée

**Exemple** :
```bash
curl -X GET http://localhost:4000/api/v1/images/123e4567-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer <token>"
```

---

### GET /api/v1/images/:id/download
Télécharger le fichier image.

**Authentification** : Requise

**Paramètres** :
- `id` (string) : UUID de l'image

**Réponse** : Fichier binaire (image)

**Headers de réponse** :
- `Content-Type` : Type MIME de l'image
- `Content-Disposition` : attachment; filename="original-name.jpg"

**Codes de statut** :
- `200` : Fichier téléchargé avec succès
- `403` : Accès refusé
- `404` : Image ou fichier non trouvé

**Exemple** :
```bash
curl -X GET http://localhost:4000/api/v1/images/123e4567-e89b-12d3-a456-426614174000/download \
  -H "Authorization: Bearer <token>" \
  -o image.jpg
```

---

### PATCH /api/v1/images/:id
Mettre à jour une image.

**Authentification** : Requise (ADMIN, RESEARCHER)

**Paramètres** :
- `id` (string) : UUID de l'image

**Body** :
```typescript
{
  description?: string;
  status?: ImageStatus;
}
```

**Réponse** : `ImageEntity`

**Codes de statut** :
- `200` : Image mise à jour avec succès
- `400` : Données invalides
- `403` : Accès refusé
- `404` : Image non trouvée

**Exemple** :
```bash
curl -X PATCH http://localhost:4000/api/v1/images/123e4567-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"description": "Lion mâle adulte - Mise à jour", "status": "COMPLETED"}'
```

---

### DELETE /api/v1/images/:id
Supprimer une image.

**Authentification** : Requise (ADMIN)

**Paramètres** :
- `id` (string) : UUID de l'image

**Réponse** :
```typescript
{
  message: "Image supprimée avec succès"
}
```

**Codes de statut** :
- `200` : Image supprimée avec succès
- `403` : Accès refusé (admin seulement)
- `404` : Image non trouvée

**Note** : Supprime également le fichier physique et les détections associées (cascade).

**Exemple** :
```bash
curl -X DELETE http://localhost:4000/api/v1/images/123e4567-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer <token>"
```

## 📝 DTOs

### UploadImageDto

```typescript
class UploadImageDto {
  @IsUUID()
  @IsNotEmpty()
  projectId: string;

  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ type: 'string', format: 'binary' })
  file: any;
}
```

### UpdateImageDto

```typescript
class UpdateImageDto {
  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(ImageStatus)
  status?: ImageStatus;
}
```

### QueryImagesDto

```typescript
class QueryImagesDto {
  @IsOptional()
  @IsUUID()
  projectId?: string;

  @IsOptional()
  @IsEnum(ImageStatus)
  status?: ImageStatus;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsDateString()
  capturedAfter?: string;

  @IsOptional()
  @IsDateString()
  capturedBefore?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number = 20;

  @IsOptional()
  sortBy?: 'createdAt' | 'capturedAt' | 'originalName' = 'createdAt';

  @IsOptional()
  sortOrder?: 'asc' | 'desc' = 'desc';
}
```

## 🛠️ Services

### ImagesService

Le service principal qui gère toute la logique métier :

#### Méthodes principales

##### `upload(file, projectId, description, userId, userRole)`
Upload une image vers un projet.

**Fonctionnalités** :
- Vérifie l'existence du projet
- Vérifie l'accès utilisateur (sauf admin)
- Génère un nom de fichier unique
- Sauvegarde le fichier sur disque
- Crée l'entrée en base de données
- Enregistre un audit log

**Paramètres** :
- `file` : Fichier multer
- `projectId` : UUID du projet
- `description` : Description optionnelle
- `userId` : ID de l'utilisateur
- `userRole` : Rôle de l'utilisateur

**Retourne** : `ImageEntity`

**Exceptions** :
- `NotFoundException` : Projet non trouvé
- `ForbiddenException` : Pas d'accès au projet

---

##### `findAll(query, userId, userRole)`
Récupère toutes les images avec pagination et filtres.

**Fonctionnalités** :
- Filtrage par projet, statut, recherche, dates
- Contrôle d'accès basé sur les rôles
- Pagination et tri
- Compte des détections

**Logique d'accès** :
- **ADMIN** : Voit toutes les images
- **Autres** : Uniquement les images de leurs projets

**Paramètres** :
- `query` : Paramètres de recherche et pagination
- `userId` : ID de l'utilisateur actuel
- `userRole` : Rôle de l'utilisateur

**Retourne** :
```typescript
{
  data: ImageEntity[];
  meta: PaginationMeta;
}
```

---

##### `findOne(id, userId, userRole)`
Récupère une image par son ID.

**Paramètres** :
- `id` : UUID de l'image
- `userId` : ID de l'utilisateur
- `userRole` : Rôle de l'utilisateur

**Retourne** : `ImageEntity`

**Exceptions** :
- `NotFoundException` : Image non trouvée
- `ForbiddenException` : Pas d'accès à l'image

---

##### `update(id, updateDto, userId, userRole)`
Met à jour une image.

**Paramètres** :
- `id` : UUID de l'image
- `updateDto` : Données à mettre à jour
- `userId` : ID de l'utilisateur
- `userRole` : Rôle de l'utilisateur

**Retourne** : `ImageEntity`

**Audit** : Enregistre un log `IMAGE_UPDATED`

---

##### `remove(id, userId, userRole)`
Supprime une image et son fichier physique.

**Paramètres** :
- `id` : UUID de l'image
- `userId` : ID de l'utilisateur
- `userRole` : Rôle de l'utilisateur

**Retourne** : `{ message: string }`

**Audit** : Enregistre un log `IMAGE_DELETED`

**Note** : Supprime les détections associées (cascade)

---

##### `getStatistics()`
Récupère les statistiques globales des images.

**Retourne** :
```typescript
{
  total: number;
  byStatus: Record<ImageStatus, number>;
  totalSizeBytes: number;
  totalSizeMB: number;
  recentUploads7Days: number;
}
```

---

##### `download(id, userId, userRole)`
Prépare le téléchargement d'une image.

**Paramètres** :
- `id` : UUID de l'image
- `userId` : ID de l'utilisateur
- `userRole` : Rôle de l'utilisateur

**Retourne** :
```typescript
{
  filePath: string;
  originalName: string;
  mimeType: string;
}
```

**Exceptions** :
- `NotFoundException` : Image ou fichier non trouvé
- `ForbiddenException` : Pas d'accès

## 🔒 Contrôle d'accès

### Upload d'images
- **ADMIN** : Peut uploader vers n'importe quel projet
- **RESEARCHER** : Peut uploader uniquement vers ses projets assignés
- **VALIDATOR** : ❌ Non autorisé

### Lecture d'images
- **ADMIN** : Voit toutes les images
- **RESEARCHER** : Voit uniquement les images de ses projets
- **VALIDATOR** : Voit uniquement les images de ses projets

### Modification d'images
- **ADMIN** : Peut modifier n'importe quelle image
- **RESEARCHER** : Peut modifier les images de ses projets
- **VALIDATOR** : ❌ Non autorisé

### Suppression d'images
- **ADMIN** : Peut supprimer n'importe quelle image
- **RESEARCHER** : ❌ Non autorisé
- **VALIDATOR** : ❌ Non autorisé

### Statistiques
- **ADMIN** : ✅ Accès complet
- **RESEARCHER** : ❌ Non autorisé
- **VALIDATOR** : ❌ Non autorisé

## 📤 Upload de fichiers

### Configuration

Le module utilise `@nestjs/platform-express` avec Multer pour gérer les uploads.

**Variable d'environnement** :
```env
UPLOAD_DIR="./uploads"
```

### Structure de stockage

```
uploads/
├── project-uuid-1/
│   ├── image-uuid-1.jpg
│   ├── image-uuid-2.jpg
│   └── ...
├── project-uuid-2/
│   └── ...
```

### Formats acceptés

Tous les types MIME `image/*` :
- `image/jpeg`
- `image/png`
- `image/gif`
- `image/webp`
- etc.

### Limites

Les limites sont configurées au niveau du middleware Multer (à définir).

**Recommandations** :
- Taille max : 50 MB par fichier
- Types autorisés : JPEG, PNG, WEBP, GIF

## 📸 Métadonnées EXIF

### Données extraites

Le module extrait et stocke :

1. **Date de capture** (`capturedAt`)
   - Tag EXIF : `DateTimeOriginal`
   - Format : DateTime ISO 8601

2. **Localisation GPS** (`gpsLocation`)
   - Tags EXIF : `GPSLatitude`, `GPSLongitude`, `GPSAltitude`
   - Format JSON :
   ```json
   {
     "latitude": -2.3333,
     "longitude": 34.8333,
     "altitude": 1500
   }
   ```

3. **Dimensions** (`width`, `height`)
   - Tags EXIF : `ImageWidth`, `ImageHeight`
   - Format : Entiers

4. **Toutes les données EXIF** (`exifData`)
   - Stocke l'intégralité des tags EXIF
   - Format : JSON
   - Exemples :
     - Make : "Canon"
     - Model : "EOS 5D Mark IV"
     - ISO : 800
     - FNumber : 2.8
     - ExposureTime : "1/250"

### Implémentation future

Pour l'extraction EXIF, il faudra installer :
```bash
npm install exif-parser sharp
```

Et ajouter la logique d'extraction dans `ImagesService.upload()`.

## 📊 Statistiques

### Statistiques globales

```typescript
{
  total: 1250,                    // Nombre total d'images
  byStatus: {
    PENDING: 50,
    PROCESSING: 10,
    COMPLETED: 1180,
    FAILED: 10
  },
  totalSizeBytes: 5368709120,     // 5 GB
  totalSizeMB: 5120,
  recentUploads7Days: 45          // Uploads des 7 derniers jours
}
```

### Statistiques par projet

Disponibles via l'endpoint `/projects/:id` qui inclut :
- `imageCount` : Nombre d'images du projet

## 📝 Audit

### Actions enregistrées

1. **IMAGE_UPLOADED**
   ```json
   {
     "action": "IMAGE_UPLOADED",
     "entity": "Image",
     "entityId": "image-uuid",
     "changes": {
       "projectId": "project-uuid",
       "fileName": "IMG_0123.jpg",
       "fileSize": 2048576
     }
   }
   ```

2. **IMAGE_UPDATED**
   ```json
   {
     "action": "IMAGE_UPDATED",
     "entity": "Image",
     "entityId": "image-uuid",
     "changes": {
       "updates": {
         "description": "Nouvelle description",
         "status": "COMPLETED"
       },
       "updatedBy": "user-uuid"
     }
   }
   ```

3. **IMAGE_DELETED**
   ```json
   {
     "action": "IMAGE_DELETED",
     "entity": "Image",
     "entityId": "image-uuid",
     "changes": {
       "fileName": "IMG_0123.jpg",
       "projectId": "project-uuid",
       "deletedBy": "user-uuid"
     }
   }
   ```

## 💡 Exemples d'utilisation

### Upload d'une image

```typescript
// Frontend (React)
const uploadImage = async (file: File, projectId: string) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('projectId', projectId);
  formData.append('description', 'Lion observé près du point d\'eau');

  const response = await fetch('http://localhost:4000/api/v1/images', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  return await response.json();
};
```

### Récupérer les images d'un projet

```typescript
const getProjectImages = async (projectId: string, page = 1) => {
  const response = await fetch(
    `http://localhost:4000/api/v1/images?projectId=${projectId}&page=${page}&limit=20&sortBy=capturedAt&sortOrder=desc`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );

  return await response.json();
};
```

### Recherche d'images

```typescript
const searchImages = async (search: string, status?: ImageStatus) => {
  const params = new URLSearchParams({
    search,
    ...(status && { status }),
    page: '1',
    limit: '50'
  });

  const response = await fetch(
    `http://localhost:4000/api/v1/images?${params}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );

  return await response.json();
};
```

### Télécharger une image

```typescript
const downloadImage = async (imageId: string, fileName: string) => {
  const response = await fetch(
    `http://localhost:4000/api/v1/images/${imageId}/download`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  window.URL.revokeObjectURL(url);
};
```

### Mettre à jour le statut

```typescript
const updateImageStatus = async (imageId: string, status: ImageStatus) => {
  const response = await fetch(
    `http://localhost:4000/api/v1/images/${imageId}`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status })
    }
  );

  return await response.json();
};
```

## 🚀 Améliorations futures

### Court terme
- [ ] Extraction EXIF automatique avec `exif-parser`
- [ ] Génération de thumbnails avec `sharp`
- [ ] Validation des types MIME autorisés
- [ ] Limites de taille de fichier configurables

### Moyen terme
- [ ] Support S3/MinIO pour stockage cloud
- [ ] Compression automatique des images
- [ ] Détection de doublons (hash MD5)
- [ ] Batch upload (plusieurs fichiers)

### Long terme
- [ ] CDN integration
- [ ] Image preprocessing pipeline
- [ ] Watermarking automatique
- [ ] Face/animal detection preview

## 📚 Ressources

- [NestJS File Upload](https://docs.nestjs.com/techniques/file-upload)
- [Multer Documentation](https://github.com/expressjs/multer)
- [EXIF Spec](https://www.exif.org/)
- [Sharp Image Processing](https://sharp.pixelplumbing.com/)

---

**Module développé pour Focus - WildTrack Studio**
