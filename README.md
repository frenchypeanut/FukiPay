# TelegramDeFi

![bot](https://github.com/FrenchyPeanut/TelegramDeFi/workflows/bot/badge.svg)
![contract](https://github.com/FrenchyPeanut/TelegramDeFi/workflows/contract/badge.svg)
![web](https://github.com/FrenchyPeanut/TelegramDeFi/workflows/web/badge.svg)

## Requirements

You need to have the following tools installed:

- nvm (or please see `.nvmrc` for node version)
- firebase-tools (`npm install -g firebase-tools`)
- a bot see [official doc](https://core.telegram.org/bots#creating-a-new-bot)
- curl and jq (optional for some make targets)

## How it works?

A **Makefile** provides some shortcuts to help you. Just run

```bash
$ make
```

to see a help menu.

## Functions Dev

You need to login to firebase to be able to run functions locally.  
Only a few steps are necessary to install the project:

1. Use the firebase project  
   Verify that **telegramdefi** is in your projects: `firebase projects:list`  
   Then use it: `firebase use telegramdefi`

2. Install dependencies with `make install`.

3. Adjust firebase functions for your local needs by editing `.runtimeconfig.json` file

4. Fill-in your dev bot token in the `.env` file

That's it! Let's go:

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
make tg-webhook URL=https://xxx-yyy.localhost.run/telegramdefi/us-central1/webhook
```

## Contract Dev

See makefile for available targets.

## Useful links

https://firebase.google.com/docs/functions/config-env  
https://firebase.google.com/docs/functions/local-emulator  
https://core.telegram.org/bots/webhooks  
https://core.telegram.org/bots/api  
https://medium.com/firelayer/structuring-a-firebase-web-project-with-lerna-ab6b5ea8e1f8  
https://firebase.google.com/docs/reference/admin/node/admin.firestore  
https://medium.com/swlh/testing-guide-for-cloud-firestore-functions-and-security-rules-39d9f3c92d99  
https://medium.com/@moki298/test-your-firebase-cloud-functions-locally-using-cloud-functions-shell-32c821f8a5ce  
https://ethereumdev.io
