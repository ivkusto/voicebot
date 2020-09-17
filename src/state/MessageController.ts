import { DB, TUserStore } from "../DB";
import TelegramBot from "node-telegram-bot-api";
import { STATES } from "./Dict";


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

   async _processState(user: TUserStore, state: string, message: TelegramBot.Message) {
      const stateObj = STATES[state];
      const chatId = message.chat.id;
      // некоректный тип
      if (!message[stateObj.type]) {
         return this._printMessages(stateObj.typeErrMessages, chatId);
      }
      const writeData = { state: stateObj.next };
      if (stateObj.field) {
         const value = _getValueByType(message, stateObj.type);
         writeData[stateObj.field] = stateObj.processValue
            ? stateObj.processValue(value)
            : value;
      }

      await this._db.saveUserData(chatId.toString(), writeData);

      // сообщения после
      await this._printMessages(stateObj.postMessages, chatId);
      // приветствие следующего статуса
      await this._printMessages(STATES[stateObj.next].messages, chatId);
   }

   private async _printMessages(msgs: string[], chatId: number) {
      if (!msgs) {
         return;
      }
      for (const msg of msgs) {
         this._bot.sendMessage(chatId, msg);
         await delay(MESSAGE_DELAY);
      }
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
   }
   return null;
}
// bot.sendVoice(132107110, 'AwACAgIAAxkBAANAX1alS999O-vOErvyvUWaghK-KuEAAroHAAIUbbBKffFFCiVXS1kbBA');
