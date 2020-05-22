import Telegraf, { Context } from 'telegraf';
import { utils, constants } from 'ethers';
import { users, WalletStatus } from '../db';
import smartWallet from '../ethereum/smart-wallet';

export default function setupBalance(bot: Telegraf<Context>) {
  bot.action('balance', async (ctx) => {
    const user = await users.findById(ctx.from?.id!);

    if (user.wallet_status !== WalletStatus.Active) {
      return ctx.reply('Wallet not yet created');
    }

    const balance = await smartWallet.getWalletBalance(user.uid);

    return ctx.reply(utils.formatEther(balance) + constants.EtherSymbol);
  });
}
