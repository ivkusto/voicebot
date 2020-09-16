import * as admin from 'firebase-admin';

interface IUser extends FirebaseFirestore.DocumentData {
   state?: string;
   audio?: string;
   sex?: 'm' | 'f';
}
export type TUserStore = FirebaseFirestore.DocumentSnapshot<IUser>;
export class DB {
   private _users: FirebaseFirestore.CollectionReference<IUser>;

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
   saveUserData(chatId: string, data: IUser) {
      return this._users.doc(chatId.toString()).set(data);
   }

   /**
    * @param fileId
    */
   getUser(chatId: string): Promise<TUserStore> {
      return this._users.doc(chatId.toString()).get();
   }

}
