.PHONY: setup dev check lint lint-fix format format-check test build start db-push db-up db-down db-logs

ifeq ($(OS),Windows_NT)
SHELL := powershell.exe
.SHELLFLAGS := -NoProfile -Command
endif

# setup: install dependencies.
setup:
	@npm install

# dev: start the development server.
dev:
	@npm run dev

# check: run TypeScript type checks.
check:
	@npm run check

# lint: run ESLint.
lint:
	@npm run lint

# lint-fix: auto-fix lint issues where possible.
lint-fix:
	@npm run lint:fix

# format: apply Prettier formatting.
format:
	@npm run format

# format-check: verify Prettier formatting.
format-check:
	@npm run format:check

# test: run unit tests with coverage.
test:
	@npm run test

# build: build client + server bundles.
build:
	@npm run build

# start: run the production server from dist/.
start:
	@npm run start

# db-push: push schema to the database (requires DATABASE_URL).
db-push:
	@npm run db:push

# db-up: start local postgres via Docker.
db-up:
	@docker compose up -d

# db-down: stop local postgres.
db-down:
	@docker compose down

# db-logs: tail database logs.
db-logs:
	@docker compose logs -f db
