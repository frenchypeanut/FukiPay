import Telegraf, { Context } from 'telegraf';
import { users, txs, TxStatus, TxType, WalletStatus } from '../db';
import smartWallet from '../ethereum/smart-wallet';

export default function setupCreateWallet(bot: Telegraf<Context>) {
  bot.action('create_wallet', async (ctx) => {
    const id: number = ctx.from?.id!;
    const user = await users.findById(id);

    if (user.wallet_status !== WalletStatus.None) {
      return ctx.reply(
        'You already have a wallet, or maybe it is in the process of being created?',
      );
    }

    const tx = await smartWallet.create(`${user.uid}`);
    user.wallet_status = WalletStatus.PendingCreation;

    const promises = [
      users.update(user),
      txs.create(tx.hash, TxStatus.Injected, TxType.WalletCreation, user.uid),
    ];
    await Promise.all(promises);

    return ctx.reply('Thank you, you will be notified when your wallet is ready.');
  });
}
