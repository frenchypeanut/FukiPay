import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import { Context, Telegraf } from 'telegraf';
import { users } from '../db';

export default function setup2fa(bot: Telegraf<Context>) {
  bot.command('2fa', async (ctx) => {
    const service: string = 'FukiPay';
    const tgUserId: number = ctx.from?.id as any;
    const secret: string = authenticator.generateSecret();
    const otpauth: string = authenticator.keyuri((tgUserId as any) as string, service, secret);
    const qrcode: string = await QRCode.toDataURL(otpauth);
    const user = await users.findById(tgUserId);

    user.secret_2fa = secret;
    users.update(user);

    return ctx.replyWithPhoto(
      { source: Buffer.from(qrcode.substring(22), 'base64') },
      {
        caption: `Your secret is : 
${secret}
When your 2fa is set in your side tape /verif2fa in next`,
      },
    );
  });

  bot.command('verif2fa', (ctx) => {
    ctx.reply('Type your code below');
  });

  bot.hears(/\d{6}/, async (ctx) => {
    const user = await users.findById(ctx.from?.id as number);
    const isValid: boolean = authenticator.check(ctx.message?.text as string, user.secret_2fa);

    if (isValid) {
      user.is_2fa_active = true;
      users.update(user);

      return ctx.reply('Noice, your 2fa is now activate');
    } else {
      return ctx.reply('Wut, your token not corresponding with secret, retry !');
    }
  });
}
