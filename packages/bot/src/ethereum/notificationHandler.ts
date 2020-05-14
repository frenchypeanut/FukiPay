import provider from './provider';
import { txs, users, TxStatus, TxType, WalletStatus } from '../db';
import events from './events';

const handle = async (notification) => {
  const { status, hash } = notification;
  const tx = await txs.findByHash(hash);
  tx.status = status;
  await txs.update(tx);

  if (status === TxStatus.Confirmed && tx.type === TxType.WalletCreation) {
    const receipt = await provider.getTransactionReceipt(tx.hash);
    const { logs } = receipt;

    // we expect only one log
    const { data } = logs![0];
    const [uid, address] = events.decodeCreatedAccount(data);

    const user = await users.findByUid(uid);
    user.wallet_status = WalletStatus.Active;
    user.wallet_address = address;
    await users.update(user);
  }
};

export default handle;
