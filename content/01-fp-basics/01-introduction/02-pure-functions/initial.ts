// greet は外側の変数 name に依存している「不純な」関数
let name = "World"

function greet(): string {
  return `Hello, ${name}!`
}

console.log(greet())
name = "Effect" // 誰かがこっそり書き換えると…
console.log(greet()) // 同じ呼び出しなのに結果が変わる
