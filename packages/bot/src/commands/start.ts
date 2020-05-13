import Telegraf, { Context, Markup } from 'telegraf';
import { users } from '../db';

export default function setupStart(bot: Telegraf<Context>) {
  bot.start(async (ctx: Context) => {
    const from: any = ctx.from;
    const user: any = await users.findOrCreate(from);

    return ctx.reply(
      `Welcome @${user.username}! I'm your bankless account manager. To interact with me, tap "Main Menu"`,
      Markup.keyboard([['Main Menu']])
        .resize()
        .extra(),
    );
  });
}
