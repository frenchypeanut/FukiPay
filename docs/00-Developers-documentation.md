# Developers documentation

## Requirements

You need to have the following tools installed:

- nvm (or please see `.nvmrc` for node version)
- firebase-tools (`npm install -g firebase-tools`)
- a bot see [official doc](https://core.telegram.org/bots#creating-a-new-bot)
- curl, [jq](https://stedolan.github.io/jq/) and [sponge](https://joeyh.name/code/moreutils/) (optional for some make targets)

## How it works?

A **Makefile** provides some shortcuts to help you. Just run

```bash
$ make
```

to see a help menu.

## Guidelines

Folowing guidelines are specific to our current project, but your can experiment
too with your own, you need to create a firebase projet with following services:
hosting, functions and firestore.

On first deploy, some config params must have been set:

```bash
firebase functions:config:set bot.token="..."
firebase functions:config:set contract_address.manager="..."
firebase functions:config:set contract_address.dai="..."
firebase functions:config:set infura.apikey="..."
firebase functions:config:set network.btc="..."
firebase functions:config:set network.eth="..."
firebase functions:config:set owner.pk="..."
firebase functions:config:set service.name="..."
```

Then deploy the config with `firebase deploy --only functions`  
Then set your webhook with `curl -s -F "url=<firebase-url>tgWebhook" https://api.telegram.org/botxxx/setWebHook`  
Eventually, set your blocknative webhook pointing to the `bnWebhook` function.

### Functions Dev

You need to login to firebase to be able to run functions locally.  
Only a few steps are necessary to install the project:

1. Use the firebase project  
   Verify that **telegramdefi** is in your projects: `firebase projects:list`  
   Then use it: `firebase use telegramdefi`

2. Install dependencies with `make install`.

3. Fill-in your custom configuration in the `.env` file

4. Override local firebase configuration with `make bot-config`

That's it! Let's go:

Build the contract with `make contract-build`
Link artifacts with `make link-artifacts`  
To launch the functions, run `make bot-run`.  
A watcher is also available, just run `make bot-run-watch`.

Then to make sure your local webhook is reachable by Telegram, you need to expose your
localhost.  
You can use a free service for this: [localhost.run](http://localhost.run/),
there is no tool to install, just use SSH like this:

```bash
ssh -R 80:localhost:5001 ssh.localhost.run
```

Some Makefile targets have been made to ease interacting with Telegram.

You can set the webhook on your bot like this:

```bash
make tg-webhook URL=https://xxx-yyy.localhost.run/telegramdefi/us-central1/tgWebhook
```

You will also need a [blocknative](https://www.blocknative.com/) api key on which you must set a web hook with the url `https://xxx-yyy.localhost.run/telegramdefi/us-central1/bnWebhook` to watch the contract address.

### Firestore Dev

Go to http://localhost:4000 to see emulators UI

### Contract Dev

See makefile for available targets.

## Useful links

### Best practices

https://yeoman.io/contributing/testing-guidelines.html  
https://blog.pusher.com/promises-async-await/  
https://github.com/ryanmcdermott/clean-code-javascript

### Ethereum

https://ethereumdev.io  
https://buidler.dev/  
https://codeburst.io/deep-dive-into-ethereum-logs-a8d2047c7371  
https://docs.blocknative.com/webhook-api#ethereum-notifications  
https://dapp.tools

### Firebase

https://www.youtube.com/user/Firebase/videos  
https://firebase.google.com/docs/functions/config-env  
https://firebase.google.com/docs/functions/local-emulator  
https://medium.com/firelayer/structuring-a-firebase-web-project-with-lerna-ab6b5ea8e1f8  
https://firebase.google.com/docs/reference/admin/node/admin.firestore  
https://medium.com/swlh/testing-guide-for-cloud-firestore-functions-and-security-rules-39d9f3c92d99  
https://medium.com/@moki298/test-your-firebase-cloud-functions-locally-using-cloud-functions-shell-32c821f8a5ce

### Telegram

https://core.telegram.org/bots/webhooks  
https://core.telegram.org/bots/api  
https://telegraf.js.org/

### Typescript

https://basarat.gitbook.io/typescript/
