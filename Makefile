.PHONY: setup dev lint format format-check typecheck test build hooks agent-%

# setup: install project dependencies (replace with stack-specific command).
setup:
	@echo "Running setup..."
	@<install-deps-command>

# dev: start local services (replace with stack-specific command).
dev:
	@echo "Starting development services..."
	@<start-dev-services>

# lint: run static analysis (replace with stack-specific command).
lint:
	@echo "Running lint checks..."
	@<lint-command>

# format: apply code formatting (replace with stack-specific command).
format:
	@echo "Formatting code..."
	@<format-command>

# format-check: verify code formatting (replace with stack-specific command).
format-check:
	@echo "Checking formatting..."
	@<format-command>

# typecheck: run static type checks (replace with stack-specific command).
typecheck:
	@echo "Running type checks..."
	@<typecheck-command>

# test: run tests with coverage (replace with stack-specific command).
test:
	@echo "Running tests..."
	@<run-tests>

# build: build production artifacts (replace with stack-specific command).
build:
	@echo "Building artifacts..."
	@<build-command>

# hooks: install git hooks using Lefthook/Husky or equivalent.
hooks:
	@echo "Installing git hooks..."
	@<install-hooks-command>

# agent-%: run agent scripts (replace with stack-specific agent runner).
agent-%:
	@echo "Running agent $*..."
	@<agent-runner-command> $*
