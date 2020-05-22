import Telegraf, { Context, Extra } from 'telegraf';
import { utils, constants } from 'ethers';
import { pBTC } from 'ptokens-pbtc';
import QRCode from 'qrcode';
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
    const user = await users.findById(ctx.from?.id!);

    if (!user.wallet_address) {
      return ctx.reply(
        "Sorry, you don't have a wallet address yet, maybe just wait a few moment...",
      );
    }

    return ctx.reply(
      'Choose token:',
      Extra.HTML().markup((m) =>
        m.inlineKeyboard([
          m.callbackButton('ETH', 'receive_ETH'),
          m.callbackButton('BTC', 'receive_BTC'),
        ]),
      ),
    );
  });

  bot.action('receive_ETH', async (ctx) => {
    return ctx.reply(
      'You are about to ask some ETH. Do you want to set an amount?',
      Extra.HTML().markup((m) =>
        m.inlineKeyboard([
          m.callbackButton('yep!', 'receive_ETH_ask_amount'),
          m.callbackButton('nop', 'receive_ETH_QRCode'),
        ]),
      ),
    );
  });

  bot.action('receive_ETH_ask_amount', async (ctx) => {
    ctx['session'].action = 'receive_ETH';
    ctx['session'].amount = 0;

    return ctx.reply(
      'Please enter the amount of ETH you want to ask for:',
      Extra.HTML().markup((m) => m.inlineKeyboard([m.callbackButton('Abort', 'receive_ETH')])),
    );
  });

  bot.action('receive_ETH_QRCode', async (ctx) => {
    const user = await users.findById(ctx.from?.id!);
    const amount = ctx['session'].amount;

    delete ctx['session'].action;
    delete ctx['session'].amount;

    let link = `ethereum:${user.wallet_address}`;
    if (amount) {
      link += `?value=${utils.parseEther(amount).toString()}`;
    }

    const qrcode: string = await QRCode.toDataURL(link);

    await ctx.reply(
      `Your ETH address is ${user.wallet_address}\nUse the QR Code below to receive a deposit${
        amount ? ' of ' + amount + constants.EtherSymbol : ''
      }! `,
    );

    return ctx.replyWithPhoto(
      {
        source: Buffer.from(qrcode.substring(22), 'base64'),
      },
      { caption: user.wallet_address },
    );
  });

  bot.action('receive_BTC', async (ctx) => {
    const id: number = ctx.from?.id!;
    const user = await users.findById(id);

    if (!user.pbtc_address) {
      const depositAddress = await pbtc.getDepositAddress(user.wallet_address);
      user.pBTC_address = depositAddress.toString();
      await users.update(user);
    }

    return ctx.reply(
      'You are about to ask some BTC. Do you want to set an amount?',
      Extra.HTML().markup((m) =>
        m.inlineKeyboard([
          m.callbackButton('yep!', 'receive_BTC_ask_amount'),
          m.callbackButton('nop', 'receive_BTC_QRCode'),
        ]),
      ),
    );
  });

  bot.action('receive_BTC_ask_amount', async (ctx) => {
    ctx['session'].action = 'receive_BTC';
    ctx['session'].amount = 0;

    return ctx.reply(
      'Please enter the amount of BTC you want to ask for:',
      Extra.HTML().markup((m) => m.inlineKeyboard([m.callbackButton('Abort', 'receive_BTC')])),
    );
  });

  bot.action('receive_BTC_QRCode', async (ctx) => {
    const id: number = ctx.from?.id!;
    const user = await users.findById(id);
    const amount = ctx['session'].amount;

    delete ctx['session'].action;
    delete ctx['session'].amount;

    let link = `bitcoin:${user.pBTC_address}`;
    if (amount) {
      link += `?amount=${amount}`;
    }

    await ctx.reply(
      `Your BTC address is ${user.pBTC_address}\nUse the QR Code below to receive a deposit${
        amount ? ' of ' + amount + '₿' : ''
      }! `,
    );

    const qrcode: string = await QRCode.toDataURL(link);

    return ctx.replyWithPhoto({
      source: Buffer.from(qrcode.substring(22), 'base64'),
    });
  });
}
