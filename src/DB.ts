import * as admin from 'firebase-admin';

interface IUser extends FirebaseFirestore.DocumentData {
   state?: string;
   audio?: string;
   sex?: 'm' | 'f';
   userForAnswer?: string;
   username?: string;
}
export type TUserStore = FirebaseFirestore.DocumentSnapshot<IUser>;
export class DB {
   private _users: FirebaseFirestore.CollectionReference<IUser>;
   private _counters: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>;

   async init(): Promise<DB> {
      admin.initializeApp({
         credential: admin.credential.cert(
            {
               "privateKey": process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
               "clientEmail": process.env.FIREBASE_CLIENT_EMAIL,
               "projectId": process.env.FIREBASE_PROJECT_ID
            }),
         databaseURL: process.env.DB_URL
      });
      const db = admin.firestore();
      this._users = db.collection('users');
      this._counters = db.collection('counters');
      return this;
   }

   /**
    * @param chatId
    * @param fileId
    */
   saveUserData(chatId: string, data: IUser, isNew = false) {
      if (isNew) {
         this._counters
            .doc('users')
            .update({ count: admin.firestore.FieldValue.increment(1) });
      }
      return this._users.doc(chatId).set(data, { merge: true });
   }

   removeUser(chatId: string) {
      return this._users.doc(chatId).delete();
   }

   /**
    * @param fileId
    */
   getUser(chatId: string): Promise<TUserStore> {
      return this._users.doc(chatId).get();
   }

   async migrateToFake(chatId: string) {
      const fakeId = 'f' + Number(new Date());
      const userData = await this.getUser(chatId);
      const userDataJson = userData.data();
      await this.saveUserData(fakeId, userDataJson);
      await this.removeUser(chatId);
   }

   async getRandom(chatId: string): Promise<TUserStore> {
      const count = await this.getCount();
      const rand = Math.floor(Math.random() * (count));
      const randUser = await this._users.orderBy('sex').offset(rand).limit(2)
         // .where('sex', '==', chatId)
         // .where(admin.firestore.FieldPath.documentId(), '>', chatId)
         .get();

      return randUser.docs.filter(doc => doc.id !== chatId)[0];
   }

   async getCount() {
      const countObj = await this._counters.doc('users').get();
      return countObj.get('count');
   }

}
