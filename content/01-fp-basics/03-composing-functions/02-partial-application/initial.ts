// カリー化済みの挨拶関数
const greet = (greeting: string) => (name: string): string =>
  `${greeting}, ${name}!`

// TODO: greet に "Hello" だけを先に渡して「設定済み関数」を作ろう
const sayHello = (name: string): string => name

// TODO: 同じように "Good morning" 版も作ろう
const sayGoodMorning = (name: string): string => name

console.log(sayHello("Ichiro"))
console.log(sayHello("Hanako"))
console.log(sayGoodMorning("Ichiro"))
