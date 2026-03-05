# Guide de contribution

Merci de votre intérêt pour FOCUS ! 🦁

## Code de conduite

Ce projet suit un code de conduite. En participant, vous acceptez de respecter ses termes.

## Comment contribuer

### Signaler un bug

1. Vérifiez que le bug n'a pas déjà été signalé dans les Issues
2. Créez une nouvelle Issue avec le label `bug`
3. Incluez :
   - Description claire du problème
   - Étapes pour reproduire
   - Comportement attendu vs observé
   - Environnement (OS, versions, etc.)
   - Screenshots si pertinent

### Proposer une fonctionnalité

1. Créez une Issue avec le label `enhancement`
2. Décrivez la fonctionnalité et son intérêt
3. Discutez de l'approche avant d'implémenter

### Soumettre une Pull Request

1. Fork le projet
2. Créez une branche depuis `main` :
   ```bash
   git checkout -b feature/ma-fonctionnalite
   ```
3. Committez vos changements :
   ```bash
   git commit -m "feat: ajout de ma fonctionnalité"
   ```
4. Pushez vers votre fork :
   ```bash
   git push origin feature/ma-fonctionnalite
   ```
5. Ouvrez une Pull Request

## Standards de code

### Commits

Nous utilisons [Conventional Commits](https://www.conventionalcommits.org/) :

```
type(scope): description

[body optionnel]
[footer optionnel]
```

**Types :**
- `feat`: Nouvelle fonctionnalité
- `fix`: Correction de bug
- `docs`: Documentation
- `style`: Formatage (pas de changement de code)
- `refactor`: Refactoring
- `test`: Ajout de tests
- `chore`: Tâches de maintenance

**Exemples :**
```
feat(api): ajout endpoint de classification
fix(frontend): correction upload d'images
docs(readme): mise à jour installation
```

### Code Style

**TypeScript/JavaScript :**
- ESLint + Prettier
- 2 espaces d'indentation
- Single quotes
- Trailing commas

**Python :**
- Black formatter
- PEP 8
- Type hints
- Docstrings

### Tests

- Tests unitaires obligatoires pour toute nouvelle fonctionnalité
- Coverage minimum : 80%
- Tous les tests doivent passer avant merge

**Frontend :**
```bash
cd frontend && npm test
```

**Backend :**
```bash
cd backend && npm test
```

**ML Service :**
```bash
cd ml-service && pytest
```

## Structure des branches

- `main` : Production stable
- `develop` : Développement
- `feature/*` : Nouvelles fonctionnalités
- `fix/*` : Corrections de bugs
- `hotfix/*` : Corrections urgentes production

## Process de review

1. Au moins 1 review requise
2. Tous les tests doivent passer
3. Pas de conflits avec `main`
4. Documentation à jour

## Questions ?

N'hésitez pas à ouvrir une Discussion GitHub !

Merci pour votre contribution ! 🙏
