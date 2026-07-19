// カリー化済みの挨拶関数
const greet = (greeting: string) => (name: string): string =>
  `${greeting}, ${name}!`

// 部分適用: greeting を設定済みの、1 引数の関数を作る
const sayHello = greet("Hello")
const sayGoodMorning = greet("Good morning")

console.log(sayHello("Ichiro"))
console.log(sayHello("Hanako"))
console.log(sayGoodMorning("Ichiro"))
