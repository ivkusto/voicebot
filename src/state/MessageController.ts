import { DB, TUserStore } from "../DB";
import TelegramBot from "node-telegram-bot-api";
import { STATES, TMessage } from "./Dict";
import { callbackButtons, callbackSerialize } from "./Utils/KeyBoard";


const MESSAGE_DELAY = 1000;

export class MessageController {
   private _db: DB;
   private _bot: TelegramBot;
   constructor(db: DB, bot: TelegramBot) {
      this._db = db;
      this._bot = bot;
   }

   async messageHandler(message: TelegramBot.Message, forcedState?: string): Promise<void> {
      const user = await this._db.getUser(message.chat.id.toString());
      const state = forcedState || user.get('state') || 'start';
      this._processState(user, state, message);
   }

   async callbackHandler(msg: TelegramBot.CallbackQuery) {
      const { state, value } = JSON.parse(msg.data);
      const user = await this._db.getUser(msg.message.chat.id.toString());
      this._processState(user, state, msg.message, value);
   }

   async _processState(user: TUserStore, state: string, message: TelegramBot.Message, preValue?: string) {
      const stateObj = STATES[state];
      const chatId = message.chat.id;
      // некоректный тип
      if (!preValue && stateObj.type && !message[stateObj.type]) {
         return this._printMessages(stateObj.typeErrMessages, chatId);
      }
      if (stateObj.customHandler) {
         return this[state](chatId, message, user);
      }


      const writeData = { state: stateObj.next };
      if (stateObj.field) {
         const value = preValue || _getValueByType(message, stateObj.type);
         writeData[stateObj.field] = stateObj.processValue
            ? stateObj.processValue(value)
            : value;
      }

      await this._db.saveUserData(chatId.toString(), writeData, !user.exists);

      // сообщения после
      await this._printMessages(stateObj.postMessages, chatId);
      // приветствие следующего статуса
      await this._printMessages(STATES[stateObj.next].messages, chatId);
   }

   private async _printMessages(msgs: TMessage[], chatId: number) {
      if (!msgs) {
         return;
      }
      for (const msg of msgs) {
         if (typeof msg === 'string') {
            this._bot.sendMessage(chatId, msg);
         } else {
            this._bot.sendMessage(chatId, msg.text, msg.options);
         }

         await delay(MESSAGE_DELAY);
      }
   }

   private async getRandom(chatId: number, message: TelegramBot.Message) {
      const randomUser = await this._db.getRandom(chatId.toString());
      const audio = randomUser.get('audio');
      this._bot.sendVoice(chatId, audio,
         callbackButtons([
            {
               text: 'Ответить',
               callback_data: callbackSerialize('answerMode', randomUser.id)
            },
            {
               text: 'Дальше',
               callback_data: callbackSerialize('getRandom', null)
            }
         ])
      );
   }

   private waitForAnswer(chatId: number, message: TelegramBot.Message, user: TUserStore) {
      this._printMessages(['Ваш ответ доставлен'], chatId);
      this._db.saveUserData(chatId.toString(), { userForAnswer: null, state: 'getRandom' });
      const targetUserId = user.get('userForAnswer');
      this._printMessages([`Вам ответил пользователь @${user.get('username')}`], targetUserId);
      this._bot.sendVoice(targetUserId, message.voice.file_id);
   }
}



function delay(time: number) {
   return new Promise((res) => {
      setTimeout(res, time);
   });
}

function _getValueByType(msg: TelegramBot.Message, type: string) {
   switch (type) {
      case 'text': return msg.text;
      case 'voice': return msg.voice.file_id;
      case 'chat': return msg.chat.username;
   }
   return null;
}
// bot.sendVoice(132107110, 'AwACAgIAAxkBAANAX1alS999O-vOErvyvUWaghK-KuEAAroHAAIUbbBKffFFCiVXS1kbBA');
