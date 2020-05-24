import Telegraf, { Context, Extra } from 'telegraf';

export default function setupCatchAll(bot: Telegraf<Context>) {
  bot.hears(/^0x[a-fA-F0-9]{40}$/, async (ctx) => {
    const action = ctx['session'].action;

    if (!action || action !== 'sending') {
      return ctx.reply('Wut.');
    }

    const amount = ctx['session'].amount;
    const token = ctx['session'].token;
    const to = ctx?.message?.text;
    ctx['session'].to = to;

    return ctx.reply(
      `Send ${amount} ${token} to ${to}?`,
      Extra.HTML().markup((m) =>
        m.inlineKeyboard([
          m.callbackButton('Yes!', 'do_send'),
          m.callbackButton('Oh no!', 'send_abort'),
        ]),
      ),
    );
  });
}
