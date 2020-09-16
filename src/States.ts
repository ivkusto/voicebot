export const STATES: IStates = {
   start: {
      next: 'setVoice',
      need: [],
      type: 'text',
      postMessages: [
         'Привет!',
         'Я бот Войсер!',
         `Тут вы можете знакомиться с другими людьми прослушивая их голосовые сообщения!`
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
      next: 'setSex',
      need: ['voice'],
      messages: [
         'Укажите свой пол (м/ж/другой)!'
      ],
      postMessages: ['Четко!'],
      typeErrMessages: ['Кажется кто-то хотел отправить мне пол (м/ж/другой)!'],
      type: 'text',
      field: 'sex',
      prev: 'setVoice'
   },
   getRandom: {
      need: ['voice'],
      type: 'text',
      prev: 'setVoice'
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
   messages?: string[];
   // тип ожидаемого сообщения
   type: string;
   // сообщения после обработки статуса
   postMessages?: string[];
   // ошибки при несоответствии типа
   typeErrMessages?: string[];
   field?: string;
}
interface IStates {
   [state: string]: IState;
}