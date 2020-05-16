import Telegraf, { Context, Extra } from 'telegraf';

export default function setupCatchNumber(bot: Telegraf<Context>) {
  bot.hears(/([0-9]*[.])?[0-9]+/, async (ctx) => {
    const action = ctx['session'].action;
    switch (action) {
      case 'receive_ETH': {
        const amount = ctx?.message?.text;
        ctx['session'].amount = amount;

        return ctx.reply(
          `Asking ${amount} Ξ`,
          Extra.HTML().markup((m) =>
            m.inlineKeyboard([
              m.callbackButton('Yes!', 'receive_ETH_QRCode'),
              m.callbackButton('Abort', 'receive_ETH'),
            ]),
          ),
        );
      }

      case 'receive_BTC': {
        const amount = ctx?.message?.text;
        ctx['session'].amount = amount;

        return ctx.reply(
          `Asking ${amount} ₿`,
          Extra.HTML().markup((m) =>
            m.inlineKeyboard([
              m.callbackButton('Yes!', 'receive_BTC_QRCode'),
              m.callbackButton('Abort', 'receive_BTC'),
            ]),
          ),
        );
      }
    }

    return ctx.reply('Sorry I lost it');
  });
}
