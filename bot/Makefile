.PHONY: help install run run-watch test tg-cleanup tg-updates tg-webhook \
tg-webhook-delete tg-webhook-info

SHELL := /bin/bash

TG = scripts/tg.sh
WATCH = scripts/watch.sh
NPM = npm --prefix functions

default: help

define read_env
	@set -o allexport && source .env && set +o allexport
endef

#######################################
#               APP                   #
#######################################
install: ## to install dependencies
	@$(NPM) i
	@if [ ! -f .env -a -f .env.dist ]; then cp .env.dist .env; fi
	@firebase functions:config:get > .runtimeconfig.json

run: ## to start the local server
	@$(call read_env) && $(TG) webhook-check
	@firebase serve

run-watch: ## to start local server with watch
	@$(call read_env) && $(TG) webhook-check
	@$(WATCH) functions/src '$(NPM) run build' 'firebase serve'

test: ## to launch tests
	@$(NPM) run test

#######################################
#             TELEGRAM                #
#######################################
tg-cleanup: ## to cleanup pending updates
	make tg-webhook-delete
	@$(call read_env) && $(TG) cleanup

tg-updates: ## to poll updates
	@$(call read_env) && $(TG) updates | jq

tg-webhook: ## to update the webhook (make webhook URL=https://xxx.yy or empty to delete)
	@$(call read_env) && $(TG) webhook-set $(URL)| jq

tg-webhook-delete: ## to delete webhook
	@$(call read_env) && $(TG) webhook-delete | jq

tg-webhook-info: ## to get info about webhook
	@$(call read_env) && $(TG) webhook-info | jq

#######################################
#               MISC                  #
#######################################
help:
	@grep -E '^[ a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | \
	awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'
