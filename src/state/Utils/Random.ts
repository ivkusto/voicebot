const INT32_MAX = Math.pow(2, 32);
export function getRandom() {
   return Math.floor(Math.random() * INT32_MAX);
}