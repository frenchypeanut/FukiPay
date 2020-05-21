import Telegraf, { Context } from 'telegraf';
import { utils, constants } from 'ethers';
import provider from './provider';
import { txs, users, TxStatus, TxType, WalletStatus } from '../db';
import events, { TOPIC_CREATED_ACCOUNT, TOPIC_FUNDED_ACCOUNT } from './events';
import { BOT_TOKEN } from '../config';

const bot: Telegraf<Context> = new Telegraf(BOT_TOKEN);

const handle = async notification => {
  const { status, hash } = notification;
  let txUpdates, userUpdates;

  let tx = await txs.findByHash(hash);
  if (!tx) {
    tx = await txs.create(hash, status);
  } else {
    txUpdates = { status };
  }

  if (tx && status === TxStatus.Pending && tx.type === TxType.WalletCreation) {
    userUpdates = {
      uid: tx.uid,
      wallet_status: WalletStatus.Pending,
    };
  }

  if (status === TxStatus.Confirmed) {
    const receipt = await provider.getTransactionReceipt(hash);
    const { logs } = receipt;

    logs!.forEach(log => {
      // there's always only one topic
      const [topic] = log.topics;
      const { data } = log;

      switch (topic) {
        case TOPIC_CREATED_ACCOUNT: {
          const [uid, address] = events.decodeCreatedAccount(data);
          userUpdates = {
            wallet_status: WalletStatus.Active,
            wallet_address: address,
            uid: uid,
          };
          break;
        }
        case TOPIC_FUNDED_ACCOUNT: {
          const [uid, from, rawAmount] = events.decodeFundedAccount(data);
          const type = TxType.Deposit;
          const amount = rawAmount.toString();
          txUpdates = {
            ...txUpdates,
            // @ts-ignore
            amount,
            from,
            hash,
            type,
            uid,
          };
          break;
        }
      }
    });
  }

  if (userUpdates) {
    let user = await users.findByUid(userUpdates.uid);
    user = { ...user, ...userUpdates };
    const message =
      status === TxStatus.Confirmed
        ? `🎉 Your wallet was just created! its address is ${user.wallet_address}`
        : '😋 Wallet creation in progress...';
    const promises = [users.update(user), sendNotification(user.id, message)];
    await Promise.all(promises);
  }

  if (txUpdates) {
    tx = { ...tx, ...txUpdates };
    if (!tx.uid || tx.type === TxType.WalletCreation) {
      await txs.update(tx);
    } else {
      const user = await users.findByUid(tx.uid);
      const operation = tx.type === TxType.Deposit ? 'RECEIVED' : 'SENT';
      const amount = utils.formatEther(utils.bigNumberify(tx.amount)) + constants.EtherSymbol;
      const address = tx.type === TxType.Deposit ? `from ${tx.from}` : `to ${tx.to}`;
      const message = `${operation} ${amount} ${address}`;
      const promises = [txs.update(tx), sendNotification(user.id, message)];
      await Promise.all(promises);
    }
  }
};

async function sendNotification(chatId, message) {
  await bot.telegram.sendMessage(chatId, message);
}

export default handle;
