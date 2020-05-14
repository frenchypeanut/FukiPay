import Telegraf, { Context } from 'telegraf';
import { users } from '../db';
import smartWallet from '../ethereum/smart-wallet';

export default function setupBalance(bot: Telegraf<Context>) {
  bot.action('balance', async (ctx) => {
    const id: number = ctx.from?.id!;
    const user = await users.findById(id);

    const balance = await smartWallet.getWalletBalance(user.uid);

    return ctx.reply(`${balance} Ξ`);
  });
}
