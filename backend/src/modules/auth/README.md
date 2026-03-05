# Module Auth - Documentation

## 📋 Vue d'ensemble

Le module Auth gère l'authentification et l'autorisation des utilisateurs avec JWT (JSON Web Tokens) et RBAC (Role-Based Access Control).

## 🎯 Fonctionnalités

- ✅ **Registration** : Création de nouveaux comptes utilisateurs
- ✅ **Login** : Authentification avec email/password
- ✅ **JWT Tokens** : Access token (7 jours) et Refresh token (30 jours)
- ✅ **RBAC** : Gestion des rôles (ADMIN, RESEARCHER, VALIDATOR)
- ✅ **Password Security** : Hash bcrypt avec validation stricte
- ✅ **Audit Logs** : Enregistrement des actions d'authentification
- ✅ **Guards** : Protection des routes avec JwtAuthGuard et RolesGuard
- ✅ **Decorators** : @CurrentUser, @Roles, @Auth pour simplifier le code

## 🏗️ Architecture

```
auth/
├── dto/                    # Data Transfer Objects
│   ├── register.dto.ts     # Données pour l'inscription
│   ├── login.dto.ts        # Données pour la connexion
│   └── refresh-token.dto.ts # Données pour le refresh token
├── decorators/             # Decorators personnalisés
│   ├── current-user.decorator.ts  # Récupère l'utilisateur courant
│   ├── roles.decorator.ts         # Définit les rôles requis
│   └── auth.decorator.ts          # Combine JWT + Roles
├── guards/                 # Guards de protection
│   ├── jwt-auth.guard.ts   # Vérifie le JWT token
│   └── roles.guard.ts      # Vérifie les rôles
├── strategies/             # Stratégies Passport
│   └── jwt.strategy.ts     # Stratégie JWT
├── auth.controller.ts      # Endpoints REST
├── auth.service.ts         # Logique métier
└── auth.module.ts          # Configuration du module
```

## 🔌 Endpoints API

### 1. Register (POST /auth/register)

Crée un nouveau compte utilisateur.

**Request:**
```json
{
  "email": "john.doe@example.com",
  "password": "Password123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "RESEARCHER",
    "isActive": true,
    "createdAt": "2026-03-05T16:38:23.678Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Règles de validation:**
- Email valide et unique
- Password min 8 caractères avec majuscule, minuscule, chiffre et caractère spécial
- First name et last name entre 2 et 50 caractères

### 2. Login (POST /auth/login)

Authentifie un utilisateur existant.

**Request:**
```json
{
  "email": "john.doe@example.com",
  "password": "Password123!"
}
```

**Response:** Identique à Register

### 3. Refresh Token (POST /auth/refresh)

Génère un nouveau access token à partir d'un refresh token.

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### 4. Get Profile (GET /auth/profile)

Récupère le profil de l'utilisateur connecté.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "id": "uuid",
  "email": "john.doe@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "RESEARCHER",
  "isActive": true,
  "createdAt": "2026-03-05T16:38:23.678Z",
  "updatedAt": "2026-03-05T16:38:23.678Z",
  "lastLogin": "2026-03-05T16:38:31.123Z"
}
```

## 🛡️ Utilisation des Guards et Decorators

### Protection d'une route avec JWT

```typescript
@Get('protected')
@UseGuards(JwtAuthGuard)
async protectedRoute(@CurrentUser() user: User) {
  return { message: 'Protected route', user };
}
```

### Protection avec rôles spécifiques

```typescript
@Get('admin-only')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
async adminRoute() {
  return { message: 'Admin only' };
}
```

### Utilisation du decorator @Auth (recommandé)

```typescript
@Get('admin-only')
@Auth(Role.ADMIN)
async adminRoute() {
  return { message: 'Admin only' };
}

@Get('researchers-and-admins')
@Auth(Role.RESEARCHER, Role.ADMIN)
async researchersRoute() {
  return { message: 'For researchers and admins' };
}

@Get('authenticated')
@Auth()  // Juste authentification, pas de rôle requis
async authenticatedRoute(@CurrentUser() user: User) {
  return { message: 'Authenticated user', userId: user.id };
}
```

### Récupérer l'utilisateur courant

```typescript
// Récupérer l'objet utilisateur complet
@Get('me')
@Auth()
async getMe(@CurrentUser() user: User) {
  return user;
}

// Récupérer juste l'ID
@Get('my-id')
@Auth()
async getMyId(@CurrentUser('id') userId: string) {
  return { userId };
}

// Récupérer juste l'email
@Get('my-email')
@Auth()
async getMyEmail(@CurrentUser('email') email: string) {
  return { email };
}
```

## 🔐 Rôles disponibles

```typescript
enum Role {
  ADMIN       // Administrateur système
  RESEARCHER  // Chercheur (rôle par défaut)
  VALIDATOR   // Validateur de détections
}
```

## 🧪 Tests

### Test avec curl

```bash
# 1. Register
curl -X POST http://localhost:4000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!",
    "firstName": "Test",
    "lastName": "User"
  }'

# 2. Login
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!"
  }'

# 3. Get Profile (remplacer TOKEN par l'accessToken)
curl -X GET http://localhost:4000/api/v1/auth/profile \
  -H "Authorization: Bearer TOKEN"

# 4. Refresh Token
curl -X POST http://localhost:4000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "REFRESH_TOKEN"
  }'
```

## 📊 Swagger Documentation

La documentation Swagger est disponible à :
```
http://localhost:4000/api/v1/docs
```

## 🔧 Configuration

Variables d'environnement dans `.env` :

```env
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production-12345"
JWT_EXPIRATION="7d"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-this-in-production-67890"
JWT_REFRESH_EXPIRATION="30d"
BCRYPT_ROUNDS=10
```

## 🗃️ Audit Logs

Toutes les actions d'authentification sont enregistrées dans la table `audit_logs` :

- **USER_REGISTERED** : Lors de la création d'un compte
- **USER_LOGIN** : Lors d'une connexion réussie

## 🚀 Prochaines étapes

- [ ] Endpoint de logout (blacklist des tokens)
- [ ] Endpoint de changement de mot de passe
- [ ] Endpoint de réinitialisation de mot de passe (forgot password)
- [ ] Vérification d'email
- [ ] Two-Factor Authentication (2FA)
- [ ] Rate limiting par utilisateur
- [ ] Session management

## 📝 Notes importantes

1. **Sécurité des mots de passe** : Les mots de passe sont hashés avec bcrypt (10 rounds)
2. **Durée de vie des tokens** : 
   - Access token : 7 jours
   - Refresh token : 30 jours
3. **Rôle par défaut** : Les nouveaux utilisateurs ont le rôle RESEARCHER
4. **Compte actif** : Les nouveaux comptes sont actifs par défaut (isActive=true)
