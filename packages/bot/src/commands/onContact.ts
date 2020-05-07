import Telegraf, { Context } from 'telegraf';

export default function setupOnContact(bot: Telegraf<Context>) {
  bot.on('contact', (ctx) => {
    console.log(ctx.update?.message?.contact);
    void ctx.reply('ok ty');
  });
}
