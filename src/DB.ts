import * as admin from 'firebase-admin';
export class DB {
   private _users: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>;

   async init(): Promise<DB> {
      const serviceAccount = await import(process.env.PATH_TO_KEY);
      admin.initializeApp({
         credential: admin.credential.cert(serviceAccount),
         databaseURL: process.env.DB_URL
      });
      const db = admin.firestore();
      this._users = db.collection('users');
      return this;
   }

   /**
    * @param chatId
    * @param fileId
    */
   saveUserVoice(chatId: string, fileId: string): void {
      this._users.doc(chatId.toString()).set({
         audio: fileId
      });
   }

}
