import * as functions from "firebase-functions";
import Telegraf, { Context } from "telegraf";
import setupHelp from "./commands/help";

const bot: Telegraf<Context> = new Telegraf(functions.config().bot.token);

setupHelp(bot);

export const webhook = functions.https.onRequest((req, res) => {
  void bot.handleUpdate(req.body, res);
});
