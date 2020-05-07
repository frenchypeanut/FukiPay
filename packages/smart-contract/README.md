![contract](https://github.com/FrenchyPeanut/TelegramDeFi/workflows/contract/badge.svg)

# TelegramDeFi

This repo uses the Typescript boilerplate of Buidler for the smart-contract part of the project.

## Using this Project

Clone this repository, then install the dependencies with `npm install`. Build everything with `npm run build`. https://buidler.dev has excellent docs, and can be used as reference for extending this project.

## Available Functionality

### Build Contracts

`npm run compile`

### Generate TypeChain Typings

`npm run build`

### Run Contract Tests

`npm run test`

Note: As is, the tests fail on purpose. This is to show the Solidity stack traces that Buidler enables!

### Run Coverage Report for Tests

`npm run coverage`

Note: The branch coverage is 75 %.

### Deploy to Ethereum

Create/modify network config in `buidler.config.ts` and add API key and private key, then run:

`npx buidler run --network rinkeby scripts/deploy.ts`

### Verify on Etherscan

Add Etherscan API key to `buidler.config.ts`, then run:

`npx buidler verify-contract --contract-name Counter --address <DEPLOYED ADDRESS>`

## Enhancement Wish List

- Better migrations strategy (Buidler working on this)

PRs and feedback welcome!
