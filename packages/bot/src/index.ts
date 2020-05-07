import * as functions from 'firebase-functions';
import Telegraf, { Context, session } from 'telegraf';
import setupStart from './commands/start';
import setupOnContact from './commands/onContact';
import { init } from './admin';

init();

const bot: Telegraf<Context> = new Telegraf(functions.config().bot.token);
bot.use(session());

setupStart(bot);
setupOnContact(bot);

export const webhook = functions.https.onRequest((req, res) => {
  void bot.handleUpdate(req.body, res);
});
