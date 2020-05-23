import Telegraf, { Context, Extra } from 'telegraf';
import { users, WalletStatus } from '../db';

export default function setupMainMenu(bot: Telegraf<Context>) {
  bot.hears('Main Menu', async (ctx) => {
    const user = await users.findById(ctx.from?.id!);
    const message = user.is_2fa_active
      ? `@${user.username} your 2FA is activated!\n Now when you're ready, you can create your wallet`
      : `@${user.username} you haven't a wallet yet, why not create one?\nThis is a simple 2 step process.\nFirst Please set up a 2FA.`;
    const cta = user.is_2fa_active ? 'Create Wallet' : 'Set Up 2FA';

    if (user.wallet_status === WalletStatus.None) {
      return ctx.reply(
        message,
        Extra.HTML().markup((m) => m.inlineKeyboard([m.callbackButton(cta, 'create_wallet')])),
      );
    } else {
      const walletStatus =
        user.wallet_status === WalletStatus.Active ? 'ready to go 🚀' : 'being created..';

      return ctx.reply(
        `@${user.username} you wallet is ${walletStatus}`,
        Extra.HTML().markup((m) =>
          m.inlineKeyboard([
            m.callbackButton('Receive', 'receive'),
            m.callbackButton('Balance', 'balance'),
            m.callbackButton('Transactions', 'transactions'),
          ]),
        ),
      );
    }
  });
}
