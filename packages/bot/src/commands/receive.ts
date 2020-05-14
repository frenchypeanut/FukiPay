import Telegraf, { Context, Extra } from 'telegraf';
import { pBTC } from 'ptokens-pbtc';
import provider from '../ethereum/provider';
import { users } from '../db';
import { OWNER_PK, NETWORK_BTC } from '../config';

const configs = {
  ethPrivateKey: OWNER_PK,
  ethProvider: provider.connection.url,
  btcNetwork: NETWORK_BTC,
};

const pbtc = new pBTC(configs);

export default function setupReceive(bot: Telegraf<Context>) {
  bot.action('receive', async (ctx) => {
    const id: number = ctx.from?.id!;
    const user = await users.findById(id);

    if (!user.wallet_address) {
      return ctx.reply(
        'Sorry, you don"t have a wallet address yet, maybe just wait a few moment...',
      );
    }

    return ctx.reply(
      'Choose token:',
      Extra.HTML().markup((m) =>
        m.inlineKeyboard([
          m.callbackButton('ETH', 'receive_ETH'),
          m.callbackButton('BTC', 'receive_pBTC'),
        ]),
      ),
    );
  });

  bot.action('receive_ETH', async (ctx) => {
    const id: number = ctx.from?.id!;
    const user = await users.findById(id);

    return ctx.reply(`Ỳour ETH address is ${user.wallet_address}`);
  });

  bot.action('receive_pBTC', async (ctx) => {
    const id: number = ctx.from?.id!;
    const user = await users.findById(id);

    if (!user.pbtc_address) {
      const depositAddress = await pbtc.getDepositAddress(user.wallet_address);
      user.pBTC_address = depositAddress.toString();
      await users.update(user);
    }

    return ctx.reply(`Ỳour BTC address is ${user.pBTC_address}`);
  });
}
