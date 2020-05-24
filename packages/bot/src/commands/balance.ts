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

    let eth = await smartWallet.getBalance(user.uid);
    eth = utils.formatEther(eth);
    const dai = await smartWallet.getBalanceDai(user.uid);
    const aDai = await smartWallet.getBalanceADai(user.uid);

    return ctx.reply(`${eth} ${constants.EtherSymbol}\n${dai} DAI\n${aDai} aDai`);
  });
}
