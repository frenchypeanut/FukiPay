import Telegraf, { Context, Extra } from 'telegraf';
import { users } from '../db';
import smartWallet from '../ethereum/smart-wallet';

export default function setupSend(bot: Telegraf<Context>) {
  bot.action('send', async (ctx) => {
    const user = await users.findById(ctx.from?.id!);

    if (!user.wallet_address) {
      return ctx.reply(
        "Sorry, you don't have a wallet address yet, maybe just wait a few moment...",
      );
    }

    ctx['session'].action = 'sending';
    ctx['session'].amount = 0;

    return ctx.reply(
      'Please choose token to send:',
      Extra.HTML().markup((m) =>
        m.inlineKeyboard([
          m.callbackButton('ETH', 'send_ETH'),
          m.callbackButton('DAI', 'send_DAI'),
          m.callbackButton('Abort', 'send_abort'),
        ]),
      ),
    );
  });

  bot.action('send_ETH', async (ctx) => {
    ctx['session'].token = 'ETH';

    return ctx.reply(
      'Please enter the amount of ETH you want to send:',
      Extra.HTML().markup((m) => m.inlineKeyboard([m.callbackButton('Abort', 'send_abort')])),
    );
  });

  bot.action('send_DAI', async (ctx) => {
    ctx['session'].token = 'DAI';

    return ctx.reply(
      'Please enter the amount of DAI you want to send:',
      Extra.HTML().markup((m) => m.inlineKeyboard([m.callbackButton('Abort', 'send_abort')])),
    );
  });

  bot.action('do_send', async (ctx) => {
    const user = await users.findById(ctx.from?.id!);
    const { amount, to, token } = ctx['session'];

    delete ctx['session'].action;
    delete ctx['session'].amount;
    delete ctx['session'].to;
    delete ctx['session'].token;

    const tx = await smartWallet.send(user.uid, to, amount, token);
    console.log(tx);

    return ctx.reply('🙏 Transaction successful');
  });

  bot.action('send_abort', async (ctx) => {
    delete ctx['session'].action;
    delete ctx['session'].amount;

    return ctx.reply('OK. Maybe next time!');
  });
}
