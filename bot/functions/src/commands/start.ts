import Telegraf, { Context } from "telegraf";

export default function setupStart(bot: Telegraf<Context>) {
  bot.start((ctx) => {
    void ctx.reply("Send me your number please", {
      reply_markup: {
        keyboard: [[{ text: "📲 Send phone number", request_contact: true }]],
      },
    });
  });
}
