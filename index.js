const TelegramBot = require('node-telegram-bot-api');
var admin = require("firebase-admin");


const token = process.env.TLGM_API_KEY;
const bot = new TelegramBot(token, {
   polling: true
});
var serviceAccount = require(process.env.PATH_TO_KEY);

admin.initializeApp({
   credential: admin.credential.cert(serviceAccount),
   databaseURL: process.env.DB_URL
});
const db = admin.firestore();
const users = db.collection('users');

bot.on('voice', (msg) => {
   const chatId=msg.chat.id;
   bot.sendMessage(chatId, 'Четко');
   users.doc(chatId.toString()).set({
      audio: msg.voice.file_id
   })
})

bot.sendVoice(132107110,'AwACAgIAAxkBAANAX1alS999O-vOErvyvUWaghK-KuEAAroHAAIUbbBKffFFCiVXS1kbBA');
