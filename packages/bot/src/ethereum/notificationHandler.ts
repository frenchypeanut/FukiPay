import { txs, users, TxStatus, TxType, WalletStatus } from '../db';

const handle = async (notification) => {
  const { status, hash } = notification;
  const tx = await txs.findByHash(hash);
  tx.status = status;
  await txs.update(tx);

  if (status === TxStatus.Confirmed && tx.type === TxType.WalletCreation) {
    const user = await users.findByUid(tx.uid);
    user.wallet_status = WalletStatus.Active;
    await users.update(user);
  }
};

export default handle;
