import Telegraf, { Context, Extra } from 'telegraf';
import { constants } from 'ethers';

export default function setupCatchNumber(bot: Telegraf<Context>) {
  bot.hears(/^([0-9]*[.])?[0-9]+$/, async (ctx) => {
    const action = ctx['session'].action;
    const amount = ctx?.message?.text;
    ctx['session'].amount = amount;

    switch (action) {
      case 'receive_ETH': {
        return ctx.reply(
          `Asking ${amount + constants.EtherSymbol}`,
          Extra.HTML().markup((m) =>
            m.inlineKeyboard([
              m.callbackButton('Yes!', 'receive_ETH_QRCode'),
              m.callbackButton('Abort', 'receive_ETH'),
            ]),
          ),
        );
      }

      case 'receive_BTC': {
        return ctx.reply(
          `Asking ${amount}₿`,
          Extra.HTML().markup((m) =>
            m.inlineKeyboard([
              m.callbackButton('Yes!', 'receive_BTC_QRCode'),
              m.callbackButton('Abort', 'receive_BTC'),
            ]),
          ),
        );
      }

      case 'lending': {
        return ctx.reply(
          `Lending ${amount} DAI`,
          Extra.HTML().markup((m) =>
            m.inlineKeyboard([
              m.callbackButton('Yes!', 'do_lend'),
              m.callbackButton('Abort', 'lend_abort'),
            ]),
          ),
        );
      }

      case 'sending': {
        const token = ctx['session'].token;

        return ctx.reply(
          `Please enter the address to which to send ${amount} ${token}:`,
          Extra.HTML().markup((m) => m.inlineKeyboard([m.callbackButton('Abort', 'send_abort')])),
        );
      }
    }

    return ctx.reply('Sorry I lost it');
  });
}
