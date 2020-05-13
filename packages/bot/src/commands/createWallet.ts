import Telegraf, { Context } from 'telegraf';
import { users, txs, TxStatus, TxType, WalletStatus } from '../db';
import smartWallet from '../ethereum/smart-wallet';

export default function setupNewWallet(bot: Telegraf<Context>) {
  bot.action('create_wallet', async (ctx) => {
    const id: number = ctx.from?.id!;
    const user = await users.findById(id);

    const tx = await smartWallet.create(`${user.uid}`);
    user.wallet_status = WalletStatus.PendingCreation;

    const promises = [
      users.update(user),
      txs.create(tx.hash, user.uid, TxType.WalletCreation, TxStatus.Injected),
    ];
    await Promise.all(promises);

    return ctx.reply('🎉 Wallet creation in progress. Wait a few moment and tap "Main Menu".');
  });
}
