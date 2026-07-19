// 必要なものをすべて引数で受け取る「純粋な」関数
function greet(name: string): string {
  return `Hello, ${name}!`
}

// 同じ入力なら、いつ呼んでも必ず同じ出力
console.log(greet("World"))
console.log(greet("World"))
