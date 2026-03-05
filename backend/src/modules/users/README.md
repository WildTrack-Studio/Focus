# Module Users - FOCUS

## 📋 Description

Le module **Users** gère l'ensemble des opérations CRUD sur les utilisateurs du système FOCUS. Ce module est réservé aux administrateurs et permet la gestion complète des comptes utilisateurs, des rôles et des permissions.

## 🏗️ Architecture

```
users/
├── dto/
│   ├── create-user.dto.ts       # DTO pour créer un utilisateur
│   ├── update-user.dto.ts       # DTO pour mettre à jour un utilisateur
│   ├── update-password.dto.ts   # DTO pour changer le mot de passe
│   └── query-users.dto.ts       # DTO pour filtrer et paginer
├── entities/
│   └── user.entity.ts           # Entité User pour Swagger
├── users.controller.ts          # Routes API REST
├── users.service.ts             # Logique métier
└── users.module.ts              # Configuration du module
```

## 🔐 Permissions et Rôles

### ADMIN
- ✅ Créer des utilisateurs
- ✅ Lister tous les utilisateurs
- ✅ Voir les détails d'un utilisateur
- ✅ Modifier les utilisateurs
- ✅ Désactiver des utilisateurs
- ✅ Voir les statistiques

### RESEARCHER / VALIDATOR
- ✅ Voir les détails d'un utilisateur
- ✅ Changer son propre mot de passe

## 🔌 Endpoints

### 1. Créer un utilisateur
```http
POST /api/v1/users
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "email": "researcher@example.com",
  "password": "SecurePass123!",
  "firstName": "Jane",
  "lastName": "Smith",
  "role": "RESEARCHER",
  "isActive": true
}
```

**Réponse (201):**
```json
{
  "id": "uuid",
  "email": "researcher@example.com",
  "firstName": "Jane",
  "lastName": "Smith",
  "role": "RESEARCHER",
  "isActive": true,
  "lastLogin": null,
  "createdAt": "2024-03-05T10:30:00.000Z",
  "updatedAt": "2024-03-05T10:30:00.000Z"
}
```

### 2. Lister les utilisateurs (avec pagination et filtres)
```http
GET /api/v1/users?search=jane&role=RESEARCHER&isActive=true&page=1&limit=10&sortBy=createdAt&sortOrder=desc
Authorization: Bearer <admin_token>
```

**Réponse (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "email": "researcher@example.com",
      "firstName": "Jane",
      "lastName": "Smith",
      "role": "RESEARCHER",
      "isActive": true,
      "lastLogin": "2024-03-05T10:30:00.000Z",
      "createdAt": "2024-03-05T10:30:00.000Z",
      "updatedAt": "2024-03-05T10:30:00.000Z"
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

### 3. Récupérer les statistiques
```http
GET /api/v1/users/statistics
Authorization: Bearer <admin_token>
```

**Réponse (200):**
```json
{
  "total": 10,
  "active": 8,
  "inactive": 2,
  "byRole": {
    "ADMIN": 2,
    "RESEARCHER": 6,
    "VALIDATOR": 2
  }
}
```

### 4. Récupérer un utilisateur par ID
```http
GET /api/v1/users/:id
Authorization: Bearer <token>
```

**Réponse (200):** Même format que la création.

### 5. Mettre à jour un utilisateur
```http
PATCH /api/v1/users/:id
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "firstName": "Jane Updated",
  "role": "VALIDATOR",
  "isActive": false
}
```

**Réponse (200):** Utilisateur mis à jour.

### 6. Changer le mot de passe
```http
PATCH /api/v1/users/:id/password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "SecurePass123!",
  "newPassword": "NewSecurePass456!"
}
```

**Réponse (200):**
```json
{
  "message": "Mot de passe mis à jour avec succès"
}
```

**Notes:**
- Un utilisateur ne peut changer que son propre mot de passe
- Le nouveau mot de passe doit être différent de l'ancien

### 7. Désactiver un utilisateur (Soft Delete)
```http
DELETE /api/v1/users/:id
Authorization: Bearer <admin_token>
```

**Réponse (200):**
```json
{
  "message": "Utilisateur désactivé avec succès"
}
```

**Notes:**
- L'utilisateur n'est pas supprimé, juste désactivé (`isActive = false`)
- Un admin ne peut pas supprimer son propre compte

## 📊 Fonctionnalités

### Recherche et Filtres
- **Recherche textuelle** : Par email, prénom ou nom (insensible à la casse)
- **Filtre par rôle** : ADMIN, RESEARCHER, VALIDATOR
- **Filtre par statut** : actif/inactif
- **Pagination** : page et limit configurables
- **Tri** : par createdAt, email, firstName, lastName (asc/desc)

### Validation des Données
- **Email** : Format valide et unique
- **Mot de passe** : 
  - Minimum 8 caractères
  - Au moins 1 majuscule
  - Au moins 1 minuscule
  - Au moins 1 chiffre
  - Au moins 1 caractère spécial (@$!%*?&)
- **Rôle** : Valeur enum valide (ADMIN, RESEARCHER, VALIDATOR)

### Sécurité
- **Hashing bcrypt** : Tous les mots de passe sont hashés (10 rounds)
- **Guards JWT** : Toutes les routes sont protégées
- **RBAC** : Contrôle d'accès basé sur les rôles
- **Audit logs** : Toutes les actions sont loggées
- **Soft delete** : Les utilisateurs sont désactivés, pas supprimés

### Audit Logging
Toutes les actions suivantes sont tracées dans `audit_logs`:
- `USER_CREATED` : Création d'un utilisateur
- `USER_UPDATED` : Modification d'un utilisateur
- `USER_DELETED` : Désactivation d'un utilisateur

## 🧪 Tests avec curl

### 1. Créer un utilisateur (Admin)
```bash
curl -X POST http://localhost:4000/api/v1/users \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test.user@example.com",
    "password": "TestPass123!",
    "firstName": "Test",
    "lastName": "User",
    "role": "RESEARCHER"
  }'
```

### 2. Lister les utilisateurs
```bash
curl -X GET "http://localhost:4000/api/v1/users?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### 3. Rechercher des utilisateurs
```bash
curl -X GET "http://localhost:4000/api/v1/users?search=test&role=RESEARCHER&isActive=true" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### 4. Statistiques
```bash
curl -X GET http://localhost:4000/api/v1/users/statistics \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### 5. Changer son mot de passe
```bash
curl -X PATCH http://localhost:4000/api/v1/users/USER_ID/password \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "TestPass123!",
    "newPassword": "NewTestPass456!"
  }'
```

## 🔧 Configuration

Le module utilise les variables d'environnement suivantes (héritées du module Auth):
- `JWT_SECRET` : Clé secrète pour la validation des tokens
- `JWT_EXPIRES_IN` : Durée de validité des tokens

## 📚 Utilisation dans le Code

### Importer le Module
```typescript
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [UsersModule],
})
export class AppModule {}
```

### Utiliser le Service
```typescript
import { UsersService } from './modules/users/users.service';

@Injectable()
export class SomeService {
  constructor(private usersService: UsersService) {}

  async example() {
    const user = await this.usersService.findOne('user-id');
    const stats = await this.usersService.getStatistics();
  }
}
```

## 🔗 Relations avec d'autres Modules

- **AuthModule** : Fournit les guards et decorators pour la protection des routes
- **DatabaseModule** : Accès à Prisma pour les opérations base de données
- **ProjectsModule** (futur) : Assignation des utilisateurs aux projets

## 📖 Documentation Swagger

La documentation interactive est disponible à : `http://localhost:4000/api/v1/docs`

Tous les endpoints sont documentés avec :
- Descriptions détaillées
- Exemples de requêtes/réponses
- Codes de statut HTTP
- Schémas de validation

## 🛡️ Bonnes Pratiques

1. **Ne jamais exposer les mots de passe** : Utilisez `select` dans Prisma pour exclure le champ `password`
2. **Toujours logger les actions admin** : Chaque création/modification/suppression est tracée
3. **Soft delete uniquement** : Les utilisateurs sont désactivés, jamais supprimés physiquement
4. **Validation stricte** : Tous les DTOs sont validés avec class-validator
5. **Pagination obligatoire** : Pour éviter les surcharges sur de grandes quantités de données

## 🐛 Gestion des Erreurs

| Code | Description | Solution |
|------|-------------|----------|
| 400 | Validation échouée | Vérifier le format des données |
| 401 | Non authentifié | Fournir un token JWT valide |
| 403 | Accès refusé | Vérifier les permissions (rôle ADMIN requis) |
| 404 | Utilisateur non trouvé | Vérifier l'ID fourni |
| 409 | Email déjà utilisé | Utiliser un email unique |

## 🚀 Prochaines Améliorations

- [ ] Export CSV des utilisateurs
- [ ] Import en masse (CSV)
- [ ] Réinitialisation de mot de passe par email
- [ ] Vérification d'email
- [ ] Historique des modifications
- [ ] Avatar utilisateur
- [ ] Préférences utilisateur
