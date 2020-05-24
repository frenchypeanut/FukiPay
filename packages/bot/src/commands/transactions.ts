import Telegraf, { Context } from 'telegraf';
import { users, txs, TxType } from '../db';
import { utils, constants } from 'ethers';
import formatDistance from 'date-fns/formatDistance';

export default function setupTransactions(bot: Telegraf<Context>) {
  bot.action('transactions', async (ctx) => {
    const id: number = ctx.from?.id!;
    const user = await users.findById(id);
    const transactions = await txs.findByUid(user.uid);

    const history: string[] = [];
    transactions.forEach((tx) => {
      const data = tx.data();
      if (data.type !== TxType.WalletCreation) {
        const operation = data.type === TxType.Deposit ? 'RECEIVED' : 'SENT';
        const amount = utils.formatEther(data.amount) + constants.EtherSymbol;
        const address = data.type === TxType.Deposit ? `from *${data.from}*` : `to *${data.to}*`;
        const date = formatDistance(new Date(tx.createTime.seconds * 1000), new Date(), {
          addSuffix: true,
        });
        history.push(`_${date}_ ${operation} *${amount}* ${address}\n`);
      }
    });

    return ctx.replyWithMarkdown(
      history.length ? history.join('\n') : "You don't have made any transactions yet.",
    );
  });
}
