import Telegraf, { Context } from 'telegraf';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import { users, txs, TxStatus, TxType, WalletStatus } from '../db';
import smartWallet from '../ethereum/smart-wallet';
import { SERVICE_NAME } from '../config';

export default function setupCreateWallet(bot: Telegraf<Context>) {
  bot.action('create_wallet', async (ctx) => {
    const user = await users.findById(ctx.from?.id!);

    if (user.wallet_status !== WalletStatus.None) {
      return ctx.reply(
        'You already have a wallet, or maybe it is in the process of being created?',
      );
    }

    if (!user.is_2fa_active) {
      let secret;
      if (ctx['session'].current_action && ctx['session'].current_action === 'wallet_creation') {
        secret = ctx['session'].secret;
      } else {
        secret = authenticator.generateSecret();
        ctx['session'].current_action = 'wallet_creation';
        ctx['session'].secret = secret;
      }

      const { uid } = user;
      const otpauth = authenticator.keyuri(uid, SERVICE_NAME, secret);
      const qrcode = await QRCode.toDataURL(otpauth);

      return ctx.replyWithPhoto(
        { source: Buffer.from(qrcode.substring(22), 'base64') },
        {
          caption: `I'll ask you your secret code anytime you want to move you funds around.\nsecret: ${secret}\nservice: ${SERVICE_NAME}\nType your obtained code when you are ready`,
        },
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
