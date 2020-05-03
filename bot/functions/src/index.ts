import * as functions from "firebase-functions";
import Telegraf, { Context } from "telegraf";
import setupStart from "./commands/start";
import setupOnContact from "./commands/onContact";

const bot: Telegraf<Context> = new Telegraf(functions.config().bot.token);

setupStart(bot);
setupOnContact(bot);

export const webhook = functions.https.onRequest((req, res) => {
  void bot.handleUpdate(req.body, res);
});
