.PHONY: bot-check bot-config bot-db-reset bot-install bot-run \
bot-run-watch bot-test contract-build contract-deploy contract-install \
contract-test-coverage contract-test help link-artifacts tg-cleanup \
tg-updates tg-webhook-delete tg-webhook-info tg-webhook web-build \
web-install web-start web-test

SHELL := /bin/bash

TG = scripts/tg.sh
NPM = npm --prefix
PACKAGE_BOT = packages/bot
PACKAGE_CONTRACT = packages/smart-contract
PACKAGE_WEB = packages/web
NETWORK ?= buidlerevm

default: help

#
# set json key with value in file
#
# $(1) the file
# $(2) the key
# $(3) the value
#
define set_json_key
	jq '$(2) |= $$v' $(1) --arg v $(3) | sponge $(1)
endef

define read_env
	set -o allexport && source .env && set +o allexport
endef

#######################################
#            COMMON                   #
#######################################
install: # to install all dependencies
	@if [ ! -f .env -a -f .env.dist ]; then cp .env.dist .env; fi
	@$(MAKE) bot-install
	@$(MAKE) contract-install
	@$(MAKE) web-install
	@npm i

link-artifacts: ## to link the artifacts
	@if [ ! -f $(PACKAGE_BOT)/src/artifacts -a -d $(PACKAGE_CONTRACT)/artifacts ]; then ln -s $(PWD)/$(PACKAGE_CONTRACT)/artifacts $(PACKAGE_BOT)/src/artifacts; fi

#######################################
#               BOT                   #
#######################################
bot-config: ## to override firebase config
	@firebase functions:config:get > .runtimeconfig.json
	@$(call read_env) && \
	$(call set_json_key,.runtimeconfig.json,.bot.token,$$BOT_TOKEN) && \
	$(call set_json_key,.runtimeconfig.json,.contract_address.manager,$$CONTRACT_ADDRESS_MANAGER) && \
	$(call set_json_key,.runtimeconfig.json,.contract_address.dai,$$CONTRACT_ADDRESS_DAI) && \
	$(call set_json_key,.runtimeconfig.json,.infura.apikey,$$INFURA_API_KEY) && \
	$(call set_json_key,.runtimeconfig.json,.service.name,$$SERVICE_NAME) && \
	$(call set_json_key,.runtimeconfig.json,.owner.pk,$$OWNER_PK) && \
	$(call set_json_key,.runtimeconfig.json,.network.eth,$$NETWORK_ETH) && \
	$(call set_json_key,.runtimeconfig.json,.network.btc,$$NETWORK_BTC)

bot-check: ## to check bot config
	@$(call read_env) && $(TG) webhook-check

bot-db-reset: ## to reset the db
	@scripts/firestore-reset.sh

bot-deploy: ## to deploy the bot (use it to deploy new config)
	@firebase functions:config:get > .runtimeconfig.json
	@rm -rf $(PACKAGE_BOT)/src/artifacts && cp -r $(PACKAGE_CONTRACT)/artifacts $(PACKAGE_BOT)/src/artifacts
	@firebase deploy --only functions
	@rm -rf $(PACKAGE_BOT)/src/artifacts
	$(MAKE) link-artifacts
	$(MAKE) bot-config

bot-install: ## to install dependencies
	@$(NPM) $(PACKAGE_BOT) i

bot-run: ## to start the local server
	@$(MAKE) bot-check
	@$(NPM) $(PACKAGE_BOT) run build
	@firebase emulators:start --only firestore,functions

bot-run-watch: ## to start local server with watch
	@$(MAKE) bot-check
	@$(MAKE) bot-run & $(NPM) $(PACKAGE_BOT) run watch

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

web-start: ## to start web in watch mode
	@$(NPM) $(PACKAGE_WEB) start

web-test: ## to run web tests
	@$(NPM) $(PACKAGE_WEB) run test


#######################################
#               MISC                  #
#######################################
help:
	@grep -E '^[ a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | \
	awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'
