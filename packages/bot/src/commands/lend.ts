import Telegraf, { Context, Extra } from 'telegraf';
import { users } from '../db';
import smartWallet from '../ethereum/smart-wallet';

export default function setupLend(bot: Telegraf<Context>) {
  bot.action('lend', async (ctx) => {
    const user = await users.findById(ctx.from?.id!);

    if (!user.wallet_address) {
      return ctx.reply(
        "Sorry, you don't have a wallet address yet, maybe just wait a few moment...",
      );
    }

    const dai = await smartWallet.getBalanceDai(user.uid);
    if (!dai) {
      return ctx.reply(
        'Sorry, we support only DAI at this moment, get some and come back, please!',
      );
    }

    ctx['session'].action = 'lending';
    ctx['session'].amount = 0;

    return ctx.reply(
      'Please enter the amount of DAI you want to deposit:',
      Extra.HTML().markup((m) => m.inlineKeyboard([m.callbackButton('Abort', 'lend_abort')])),
    );
  });

  bot.action('do_lend', async (ctx) => {
    const user = await users.findById(ctx.from?.id!);
    const amount = ctx['session'].amount;

    delete ctx['session'].action;
    delete ctx['session'].amount;

    smartWallet.depositDaiAave(user.uid, amount);
    return ctx.reply(`🙌 You just lent ${amount} DAI.\n check your balance to see your earnings.`);
  });

  bot.action('lend_abort', async (ctx) => {
    delete ctx['session'].action;
    delete ctx['session'].amount;

    return ctx.reply('OK. Maybe next time!');
  });
}
