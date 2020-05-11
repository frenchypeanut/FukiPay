import * as functions from 'firebase-functions';
import Telegraf, { Context } from 'telegraf';
import setupCatchAll from './commands/catchAll';
import setupMainMenu from './commands/mainMenu';
import setupCreateWallet from './commands/createWallet';
import setupStart from './commands/start';
import notificationHandler from './ethereum/notificationHandler';
import { BOT_TOKEN } from './config';

const bot: Telegraf<Context> = new Telegraf(BOT_TOKEN);

setupStart(bot);
setupMainMenu(bot);
setupCreateWallet(bot);
setupCatchAll(bot);

/**
 * Telegram webhook entry point
 */
export const tgWebhook = functions.https.onRequest(async (req, res) => {
  try {
    await bot.handleUpdate(req.body, res);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

/**
 * Blocknative webhook entry point
 *
 * see https://docs.blocknative.com/webhook-api#ethereum-notifications
 */
export const bnWebhook = functions.https.onRequest(async (req, res) => {
  try {
    await notificationHandler(req.body);
    res.sendStatus(200);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});
