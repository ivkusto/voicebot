import TelegramBot from 'node-telegram-bot-api';
import { DB } from './src/DB';
import { MessageController } from './src/state/MessageController';

const token = process.env.TLGM_API_KEY;
const bot = new TelegramBot(token, {
   polling: true
});

(async () => {
   const db = await new DB().init();
   const mc = new MessageController(db, bot);
   // текст
   bot.on('message', (msg) => {
      if (msg.text === 'migrateToFake') {
         return db.migrateToFake(msg.chat.id.toString());
      }
      mc.messageHandler(msg);
   });
   bot.on('callback_query', (msg) => {
      mc.callbackHandler(msg);
   });
})();

