import Telegraf, { Context } from 'telegraf';

export default function setupCatchAll(bot: Telegraf<Context>) {
  bot.hears(/.*/, async (ctx) => {
    console.log(ctx.update);
    return ctx.reply("I don't understand what you're saying");
  });
}
