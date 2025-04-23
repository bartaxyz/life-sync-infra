.PHONY: build package

# Variables
FUNCTIONS_DIR = functions

# Get all function directories
FUNCTION_DIRS := $(shell ls -d $(FUNCTIONS_DIR)/*/)

# Build all functions
build:
	@echo "Building all functions..."
	@for dir in $(FUNCTION_DIRS); do \
		echo "Building $$dir"; \
		cd $$dir && npm ci && npm run build && cd -; \
	done
