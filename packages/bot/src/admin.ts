import * as admin from 'firebase-admin';

const adm = (app) => {
  return {
    getAdmin() {
      return app;
    },

    getFirestore() {
      return app.firestore();
    },
  };
};

export default adm(admin.initializeApp());
