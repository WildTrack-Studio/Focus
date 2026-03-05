.PHONY: help install dev build test clean docker-up docker-down docker-build docker-logs

# Variables
COMPOSE = docker-compose
NPM = npm

# Colors for output
BLUE = \033[0;34m
GREEN = \033[0;32m
YELLOW = \033[0;33m
NC = \033[0m # No Color

help: ## Show this help message
	@echo "$(BLUE)FOCUS - Makefile Commands$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}'

install: ## Install all dependencies
	@echo "$(BLUE)Installing dependencies...$(NC)"
	$(NPM) install
	@echo "$(GREEN)✓ Dependencies installed$(NC)"

dev: ## Start development environment
	@echo "$(BLUE)Starting development servers...$(NC)"
	$(NPM) run dev

build: ## Build all services
	@echo "$(BLUE)Building all services...$(NC)"
	$(NPM) run build
	@echo "$(GREEN)✓ Build complete$(NC)"

test: ## Run all tests
	@echo "$(BLUE)Running tests...$(NC)"
	$(NPM) run test
	@echo "$(GREEN)✓ Tests complete$(NC)"

lint: ## Lint all code
	@echo "$(BLUE)Linting code...$(NC)"
	$(NPM) run lint

format: ## Format all code
	@echo "$(BLUE)Formatting code...$(NC)"
	$(NPM) run format
	@echo "$(GREEN)✓ Code formatted$(NC)"

clean: ## Clean all build artifacts and node_modules
	@echo "$(YELLOW)Cleaning build artifacts...$(NC)"
	$(NPM) run clean
	@echo "$(GREEN)✓ Clean complete$(NC)"

# Docker commands
docker-up: ## Start all Docker containers
	@echo "$(BLUE)Starting Docker containers...$(NC)"
	$(COMPOSE) up -d
	@echo "$(GREEN)✓ Docker containers started$(NC)"
	@echo "$(BLUE)Services available at:$(NC)"
	@echo "  Frontend:  http://localhost:3000"
	@echo "  Backend:   http://localhost:4000"
	@echo "  ML Service: http://localhost:8000"
	@echo "  MinIO:     http://localhost:9001"

docker-down: ## Stop all Docker containers
	@echo "$(YELLOW)Stopping Docker containers...$(NC)"
	$(COMPOSE) down
	@echo "$(GREEN)✓ Docker containers stopped$(NC)"

docker-build: ## Build all Docker images
	@echo "$(BLUE)Building Docker images...$(NC)"
	$(COMPOSE) build
	@echo "$(GREEN)✓ Docker images built$(NC)"

docker-logs: ## Show Docker logs
	$(COMPOSE) logs -f

docker-ps: ## Show running Docker containers
	$(COMPOSE) ps

docker-restart: ## Restart all Docker containers
	@echo "$(BLUE)Restarting Docker containers...$(NC)"
	$(COMPOSE) restart
	@echo "$(GREEN)✓ Docker containers restarted$(NC)"

docker-clean: ## Remove all Docker containers, volumes, and images
	@echo "$(YELLOW)Cleaning Docker resources...$(NC)"
	$(COMPOSE) down -v --rmi all
	@echo "$(GREEN)✓ Docker cleaned$(NC)"

# Database commands
db-migrate: ## Run database migrations
	@echo "$(BLUE)Running database migrations...$(NC)"
	cd backend && npx prisma migrate dev
	@echo "$(GREEN)✓ Migrations complete$(NC)"

db-seed: ## Seed database with test data
	@echo "$(BLUE)Seeding database...$(NC)"
	cd backend && npx prisma db seed
	@echo "$(GREEN)✓ Database seeded$(NC)"

db-studio: ## Open Prisma Studio
	@echo "$(BLUE)Opening Prisma Studio...$(NC)"
	cd backend && npx prisma studio

db-reset: ## Reset database (WARNING: deletes all data)
	@echo "$(YELLOW)Resetting database...$(NC)"
	cd backend && npx prisma migrate reset
	@echo "$(GREEN)✓ Database reset$(NC)"

# Git commands
git-status: ## Show git status
	git status

git-commit: ## Commit changes (usage: make git-commit msg="your message")
	git add .
	git commit -m "$(msg)"

git-push: ## Push to remote
	git push origin main

# Setup commands
setup: install docker-build ## Complete project setup
	@echo "$(GREEN)✓ Setup complete!$(NC)"
	@echo "$(BLUE)Next steps:$(NC)"
	@echo "  1. Copy .env.example to .env and configure"
	@echo "  2. Run 'make docker-up' to start services"
	@echo "  3. Read QUICKSTART.md for next steps"

# Quick commands
up: docker-up ## Alias for docker-up
down: docker-down ## Alias for docker-down
restart: docker-restart ## Alias for docker-restart
logs: docker-logs ## Alias for docker-logs
