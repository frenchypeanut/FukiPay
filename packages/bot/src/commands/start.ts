import Telegraf, { Context } from 'telegraf';
import { getFirestore } from '../admin';

export default function setupStart(bot: Telegraf<Context>) {
  bot.start(async (ctx: Context) => {
    const db = getFirestore();

    const id = ctx?.from?.id;

    const userRef = db.collection('users').doc(`${id}`);
    userRef
      .get()
      .then((user) => {
        if (!user.exists) {
          const first_name = ctx?.from?.first_name;

          db.collection('users')
            .doc(`${id}`)
            .set({
              first_name,
            })
            .then((u) => console.log('user added', u))
            .catch((error) => console.log('could not add user', error));
        } else {
          const first_name = user.data()?.first_name;
          console.log('user exists:', first_name);
        }
      })
      .catch((error) => console.log('could not get user', error));

    void ctx.reply('Send me your number please', {
      reply_markup: {
        keyboard: [[{ text: '📲 Send phone number', request_contact: true }]],
      },
    });
  });
}
