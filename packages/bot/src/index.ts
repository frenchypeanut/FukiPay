import * as functions from 'firebase-functions';
import Telegraf, { Context, session } from 'telegraf';
import setupCatch2FA from './commands/catch2FA';
import setupCatchAll from './commands/catchAll';
import setupCatchNumber from './commands/catchNumber';
import setupCatchAddress from './commands/catchAddress';
import setupMainMenu from './commands/mainMenu';
import setupCreateWallet from './commands/createWallet';
import setupStart from './commands/start';
import setupBalance from './commands/balance';
import setupReceive from './commands/receive';
import setupTransactions from './commands/transactions';
import setupLend from './commands/lend';
import setupSend from './commands/send';
import notificationHandler from './ethereum/notificationHandler';
import { BOT_TOKEN } from './config';

const bot: Telegraf<Context> = new Telegraf(BOT_TOKEN);
bot.use(session());

setupCreateWallet(bot);
setupBalance(bot);
setupReceive(bot);
setupLend(bot);
setupSend(bot);
setupTransactions(bot);
setupStart(bot);
setupMainMenu(bot);

setupCatch2FA(bot);
setupCatchNumber(bot);
setupCatchAddress(bot);

// catch all
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
