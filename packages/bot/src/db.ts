import admin from './admin';
import { v4 as uuidv4 } from 'uuid';

const db = admin.getFirestore();

export enum TxType {
  WalletCreation = 'wallet_creation',
}

export enum TxStatus {
  Injected = 'injected',
  Pending = 'pending',
  Confirmed = 'confirmed',
}

export enum WalletStatus {
  None = 'none',
  Active = 'active',
  Inactive = 'inactive',
  PendingCreation = 'pending_creation',
}

export const sessions = db.collection('sessions');

export const users = ((_db) => {
  return {
    async findByUid(uid: string) {
      const userRef = _db.collection('users');
      const query = userRef.where('uid', '==', uid);

      const querySnapshot = await query.get();
      if (querySnapshot.empty) {
        return;
      }

      return querySnapshot.docs[0].data();
    },

    async findById(id: number) {
      const userRef = _db.collection('users');
      const query = userRef.where('id', '==', id);

      const querySnapshot = await query.get();
      if (querySnapshot.empty) {
        return;
      }

      return querySnapshot.docs[0].data();
    },

    async findOrCreate({ id, username }) {
      const user = await users.findById(id);

      if (undefined === user) {
        await users.create({
          id,
          username,
        });
      }

      return users.findById(id);
    },

    async create({ id, username }) {
      const uid = uuidv4();
      const wallet_status = WalletStatus.None;

      return _db.collection('users').doc(uid).set({
        username,
        id,
        wallet_status,
        uid,
      });
    },

    async update(updatedUser) {
      return _db.collection('users').doc(updatedUser.uid).set(updatedUser);
    },
  };
})(db);

export const txs = ((_db) => {
  return {
    create(hash, uid, type, status) {
      return _db.collection('transactions').doc(hash).set({
        hash,
        uid,
        type,
        status,
      });
    },

    async findByHash(hash: string) {
      const txsRef = _db.collection('transactions');
      const query = txsRef.where('hash', '==', hash);

      const querySnapshot = await query.get();
      if (querySnapshot.empty) {
        return;
      }

      return querySnapshot.docs[0].data();
    },

    async update(updatedTx) {
      return _db.collection('transactions').doc(updatedTx.hash).set(updatedTx);
    },
  };
})(db);
