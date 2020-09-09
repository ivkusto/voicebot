import TelegramBot from 'node-telegram-bot-api';
import { DB } from './src/DB';

const token = process.env.TLGM_API_KEY;
const bot = new TelegramBot(token, {
   polling: true
});

const MESSAGE_DELAY = 1000;

(async () => {
   const db = await new DB().init();

   // голос
   bot.on('voice', (msg) => {
      const chatId = msg.chat.id;
      bot.sendMessage(chatId, 'Четко');
      db.saveUserVoice(chatId.toString(), msg.voice.file_id);
   });

   // текст
   bot.on('text', async (msg) => {
      const chatId = msg.chat.id;
      bot.sendMessage(chatId, 'Привет!');
      await delay(MESSAGE_DELAY);
      bot.sendMessage(chatId, 'Я бот Войсер!');
      await delay(MESSAGE_DELAY);
      bot.sendMessage(chatId, `Тут вы можете знакомиться с другими людьми прослушивая их голосовые сообщения!
      Отправьте мне голосовое сообщение, которое позволит другим войсерам с вами познакомиться!`);
   });

})();

function delay(time: number) {
   return new Promise((res) => {
      setTimeout(res, time);
   });
}

// bot.sendVoice(132107110, 'AwACAgIAAxkBAANAX1alS999O-vOErvyvUWaghK-KuEAAroHAAIUbbBKffFFCiVXS1kbBA');
