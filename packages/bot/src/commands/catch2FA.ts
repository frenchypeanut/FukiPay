import { authenticator } from 'otplib';
import { Context, Telegraf } from 'telegraf';
import { users } from '../db';

export default function setupcatch2FA(bot: Telegraf<Context>) {
  bot.hears(/^\d{6}$/, async (ctx) => {
    if (ctx['session'].current_action !== 'wallet_creation' && !ctx['session'].secret) {
      return ctx.reply("Sorry, I can't do it, something got wrong");
    }

    const user = await users.findById(ctx.from?.id!);
    const secret = ctx['session'].secret;
    const isValid = authenticator.check(ctx.message?.text!, secret);

    if (isValid) {
      user.is_2fa_active = true;
      user.secret_2fa = secret;
      await users.update(user);

      delete ctx['session'].current_action;
      delete ctx['session'].secret;

      return ctx.reply('Noice, your 2fa is now activate');
    } else {
      return ctx.reply('Wut, your token not corresponding with secret, retry !');
    }
  });
}
