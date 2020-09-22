
import TelegramBot from "node-telegram-bot-api";
import { genderButtons, callbackSerialize, callbackButtons } from "./Utils/KeyBoard";


export const STATES: IStates = {
   start: {
      next: 'setVoice',
      need: [],
      type: 'chat',
      field: 'username',
      postMessages: [
         'Привет!',
         'Я бот Войсер!',
         `Тут вы можете знакомиться с другими людьми, прослушивая их голосовые сообщения!`
      ]
   },

   setVoice: {
      next: 'setSex',
      need: [],
      prev: 'start',
      messages: [
         'Отправьте мне голосовое сообщение, которое позволит другим войсерам с вами познакомиться!'
      ],
      postMessages: ['Отлично!'],
      field: 'audio',
      type: 'voice',
      typeErrMessages: ['Кажется кто-то хотел отправить мне голосовое сообщение!']
   },

   setSex: {
      next: 'setTargetSex',
      need: ['voice'],
      messages: [
         {
            text: 'Укажите свой пол!',
            options: genderButtons('setSex')
         }
      ],
      postMessages: ['Четко!'],
      typeErrMessages: [
         {
            text: 'Кажется кто-то хотел отправить мне пол!',
            options: genderButtons('setSex')
         }
      ],
      type: 'text',
      field: 'sex',
      prev: 'setVoice'
   },
   setTargetSex: {
      next: 'readyforChat',
      need: ['sex'],
      messages: [
         {
            text: 'Укажите какой пол вам интересен!',
            options: genderButtons('setTargetSex')
         }
      ],
      postMessages: ['Кайф!'],
      typeErrMessages: [
         {
            text: 'Кажется кто-то хотел отправить мне пол который ему интересен!',
            options: genderButtons('setTargetSex')
         }
      ],
      type: 'text',
      field: 'targetSex',
      prev: 'setSex'
   },
   readyforChat: {
      next: 'getRandom',
      need: ['targetSex'],
      messages: [
         {
            text: 'Теперь можно получить первую голосовуху!',
            options: callbackButtons([{
               text: 'Получить голосовуху',
               callback_data: callbackSerialize('getRandom', null)
            }])
         }
      ],
      type: 'text',
      prev: 'setVoice'
   },
   getRandom: {
      next: 'getRandom',
      need: ['targetSex'],
      prev: 'getRandom',
      customHandler: true
   },

   answerMode: {
      field: 'userForAnswer',
      prev: 'getRandom',
      need: [],
      postMessages: ['Отправьте голосовое сообщение в ответ'],
      next: 'waitForAnswer'
   },

   waitForAnswer: {
      customHandler: true,
      need: [],
      type: 'voice',
      prev: 'getRandom',
      typeErrMessages: ['Отправьте голосовое сообщение в ответ']
   }
};

interface IState {
   // следующий статус
   next?: string;
   // необходимые поля
   need: string[];
   // предыдущий статус
   prev?: string;
   // сообщения которые нужно вывести перед переходом в статус
   messages?: TMessage[];
   // тип ожидаемого сообщения
   type?: string;
   // сообщения после обработки статуса
   postMessages?: TMessage[];
   // ошибки при несоответствии типа
   typeErrMessages?: TMessage[];
   // поле в бд в которое записываем
   field?: string;
   processValue?: (value: string) => string | number;
   customHandler?: boolean;

}
interface IStates {
   [state: string]: IState;
}

export type TMessage = string | { text: string, options: TelegramBot.SendMessageOptions };