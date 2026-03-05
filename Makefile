.PHONY: help install dev-backend dev-frontend dev docker-up docker-down docker-build docker-logs clean

# Colors
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m

help: ## Affiche l'aide
	@echo "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)"
	@echo "$(BLUE)  FOCUS - Wildlife Detection Platform$(NC)"
	@echo "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)"
	@echo ""
	@echo "$(GREEN)Commandes disponibles:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-20s$(NC) %s\n", $$1, $$2}'
	@echo ""

# ============================================================================
# DÉVELOPPEMENT LOCAL (avec npm)
# ============================================================================

install: ## Installe toutes les dépendances
	@echo "$(BLUE)📦 Installation des dépendances...$(NC)"
	@cd backend && npm install
	@cd frontend && npm install
	@echo "$(GREEN)✓ Installation terminée$(NC)"

db-up: ## Démarre uniquement PostgreSQL
	@echo "$(BLUE)🐘 Démarrage de PostgreSQL...$(NC)"
	@docker-compose up -d postgres
	@echo "$(GREEN)✓ PostgreSQL démarré sur localhost:5432$(NC)"

db-down: ## Arrête PostgreSQL
	@echo "$(YELLOW)⏸  Arrêt de PostgreSQL...$(NC)"
	@docker-compose down
	@echo "$(GREEN)✓ PostgreSQL arrêté$(NC)"

dev-backend: db-up ## Lance le backend en mode dev
	@echo "$(BLUE)🚀 Démarrage du backend...$(NC)"
	@echo "$(YELLOW)Backend API: http://localhost:4000/api/v1$(NC)"
	@echo "$(YELLOW)Swagger Docs: http://localhost:4000/api/v1/docs$(NC)"
	@cd backend && npm run start:dev

dev-frontend: ## Lance le frontend en mode dev
	@echo "$(BLUE)🌐 Démarrage du frontend...$(NC)"
	@echo "$(YELLOW)Frontend: http://localhost:8080$(NC)"
	@cd frontend && npm run dev

# ============================================================================
# DOCKER (production-like)
# ============================================================================

docker-build: ## Build les images Docker
	@echo "$(BLUE)🔨 Building Docker images...$(NC)"
	@docker-compose build
	@echo "$(GREEN)✓ Build terminé$(NC)"

docker-up: ## Démarre tout avec Docker
	@echo "$(BLUE)🐳 Démarrage de l'application avec Docker...$(NC)"
	@docker-compose up -d
	@echo ""
	@echo "$(GREEN)✓ Application démarrée!$(NC)"
	@echo ""
	@echo "$(YELLOW)Services disponibles:$(NC)"
	@echo "  Frontend:  http://localhost:8080"
	@echo "  Backend:   http://localhost:4000/api/v1"
	@echo "  Swagger:   http://localhost:4000/api/v1/docs"
	@echo "  PostgreSQL: localhost:5432"
	@echo ""
	@echo "$(BLUE)Voir les logs: make docker-logs$(NC)"

docker-down: ## Arrête tous les containers Docker
	@echo "$(YELLOW)⏸  Arrêt des containers...$(NC)"
	@docker-compose down
	@echo "$(GREEN)✓ Containers arrêtés$(NC)"

docker-restart: ## Redémarre tous les containers
	@echo "$(BLUE)🔄 Redémarrage...$(NC)"
	@docker-compose restart
	@echo "$(GREEN)✓ Redémarrage terminé$(NC)"

docker-logs: ## Affiche les logs
	@docker-compose logs -f

docker-logs-backend: ## Affiche les logs du backend
	@docker-compose logs -f backend

docker-logs-frontend: ## Affiche les logs du frontend
	@docker-compose logs -f frontend

docker-ps: ## Liste les containers en cours
	@docker-compose ps

# ============================================================================
# NETTOYAGE
# ============================================================================

clean: ## Nettoie tout (containers, volumes, node_modules)
	@echo "$(RED)🧹 Nettoyage complet...$(NC)"
	@docker-compose down -v
	@rm -rf backend/node_modules frontend/node_modules
	@rm -rf backend/dist frontend/.next
	@echo "$(GREEN)✓ Nettoyage terminé$(NC)"

clean-docker: ## Nettoie uniquement Docker
	@echo "$(RED)🧹 Nettoyage Docker...$(NC)"
	@docker-compose down -v
	@echo "$(GREEN)✓ Nettoyage Docker terminé$(NC)"

# ============================================================================
# UTILITAIRES
# ============================================================================

migrate: ## Lance les migrations Prisma
	@echo "$(BLUE)📊 Migrations Prisma...$(NC)"
	@cd backend && npx prisma migrate dev
	@echo "$(GREEN)✓ Migrations appliquées$(NC)"

seed: ## Seed la base de données
	@echo "$(BLUE)🌱 Seeding database...$(NC)"
	@cd backend && npx prisma db seed
	@echo "$(GREEN)✓ Seed terminé$(NC)"

studio: db-up ## Ouvre Prisma Studio
	@echo "$(BLUE)🎨 Ouverture de Prisma Studio...$(NC)"
	@cd backend && npx prisma studio

test: ## Lance les tests
	@echo "$(BLUE)🧪 Tests backend...$(NC)"
	@cd backend && npm run test

# Aliases
dev: dev-backend ## Alias pour dev-backend
start: docker-up ## Alias pour docker-up
stop: docker-down ## Alias pour docker-down
logs: docker-logs ## Alias pour docker-logs
