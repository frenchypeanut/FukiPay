.PHONY: help install run run-watch test tg-cleanup tg-updates tg-webhook \
tg-webhook-delete tg-webhook-info

SHELL := /bin/bash

TG = scripts/tg.sh
WATCH = scripts/watch.sh
NPM = npm --prefix
PACKAGE_BOT = packages/bot
PACKAGE_CONTRACT = packages/smart-contract
PACKAGE_WEB = packages/web
NETWORK ?= buidlerevm

default: help

define read_env
	@set -o allexport && source .env && set +o allexport
endef


#######################################
#            COMMON                   #
#######################################
install: # to install all dependencies
	@if [ ! -f .env -a -f .env.dist ]; then cp .env.dist > .env; fi
	@$(MAKE) bot-install
	@$(MAKE) contract-install


#######################################
#               BOT                   #
#######################################
bot-install: ## to install dependencies
	@$(NPM) $(PACKAGE_BOT) i
	@$(call read_env) && $(TG) webhook-check
	@firebase functions:config:get > .runtimeconfig.json

bot-run: ## to start the local server
	@firebase emulators:start --only firestore,functions

bot-run-watch: ## to start local server with watch
	@$(MAKE) run & $(NPM) $(PACKAGE_BOT) run watch

bot-test: ## to launch tests
	@$(NPM) $(PACKAGE_BOT) run test


#######################################
#             CONTRACT                #
#######################################
contract-build: ## to run the contract tests
	@cd $(PACKAGE_CONTRACT) && npm run build && cd -

contract-install: ## to install contract dependencies
	@$(NPM) $(PACKAGE_CONTRACT) i

contract-test: ## to run the contract tests
	@cd $(PACKAGE_CONTRACT) && npx buidler test && cd -

contract-test-coverage: ## to run the contract tests with coverage
	@cd $(PACKAGE_CONTRACT) && npm run coverage && cd -

contract-deploy: ## to deploy the contract (make contract-deploy NETWORK=<network>)
	@cd $(PACKAGE_CONTRACT) && npx buidler --network $(NETWORK) run scripts/deploy.ts && cd -


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
#               WEB                   #
#######################################
web-build: ## to star web in watch mode
	@$(NPM) $(PACKAGE_WEB) run build

web-install: ## to install web dependencies
	@$(NPM) $(PACKAGE_WEB) i

web-start: ## to star web in watch mode
	@$(NPM) $(PACKAGE_WEB) start

#######################################
#               MISC                  #
#######################################
help:
	@grep -E '^[ a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | \
	awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'
