import Telegraf, { Context } from "telegraf";

export default function setupHelp(bot: Telegraf<Context>) {
  bot.command(["/start", "/help"], (ctx) => {
    void ctx.reply("Hello, world!");
  });
}
