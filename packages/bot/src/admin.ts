import * as admin from 'firebase-admin';

const adm = (_admin) => {
  _admin.initializeApp();

  return {
    getFirestore() {
      return _admin.firestore();
    },
  };
};

export default adm(admin);
