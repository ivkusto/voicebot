import { InlineKeyboardButton } from "node-telegram-bot-api";
export function callbackSerialize(state: string, value: unknown) {
   return JSON.stringify({ state, value });
}

export function genderButtons(state: string) {
   return callbackButtons(
      [
         {
            text: "М",
            callback_data: callbackSerialize(state, 'm'),
         },
         {
            text: "Ж",
            callback_data: callbackSerialize(state, 'f'),
         },
         {
            text: "Другой",
            callback_data: callbackSerialize(state, 'o'),
         },
      ]);
}
export function callbackButtons(buttons: InlineKeyboardButton[]) {
   return {
      "reply_markup": {
         "inline_keyboard": [
            buttons
         ]
      }
   };
}