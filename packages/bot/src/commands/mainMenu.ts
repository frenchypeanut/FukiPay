import Telegraf, { Context, Extra } from 'telegraf';
import { users, WalletStatus } from '../db';

export default function setupMainMenu(bot: Telegraf<Context>) {
  bot.hears('Main Menu', async (ctx) => {
    const from: any = ctx.from;
    const user = await users.findById(from.id);

    if (user.wallet_status === WalletStatus.None) {
      return ctx.reply(
        `@${user.username} you haven't a wallet yet, why not create one?`,
        Extra.HTML().markup((m) =>
          m.inlineKeyboard([m.callbackButton('Create Wallet', 'create_wallet')]),
        ),
      );
    } else {
      return ctx.reply(
        `@${user.username} you wallet is ready to go 🚀 (address: ${user.wallet_address})`,
        Extra.HTML().markup((m) =>
          m.inlineKeyboard([
            m.callbackButton('Receive', 'receive'),
            m.callbackButton('Balance', 'balance'),
          ]),
        ),
      );
    }
  });
}
