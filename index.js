const TelegramBot = require('node-telegram-bot-api');
var admin = require("firebase-admin");

var serviceAccount = require(process.env.PATH_TO_KEY);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.DB_URL
});
const db = admin.firestore();
const docRef = db.collection('users').doc('alovelace');

(async ()=>{await docRef.set({
  first: 'Ada',
  last: 'Lovelace',
  born: 1815
});
})();

const token=process.env.TLGM_API_KEY;
const bot = new TelegramBot(token, {polling: true});
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const isPidor=msg.text.indexOf('Жаков')===-1;
  bot.sendMessage(chatId, isPidor?'Ты пидор': 'Красавчик');
});