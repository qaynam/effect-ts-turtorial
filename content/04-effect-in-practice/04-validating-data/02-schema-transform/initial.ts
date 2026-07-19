import { Schema } from "effect"

// TODO: 1. Schema.NumberFromString で "1980" を number に変換し、
//          「合計: 2000円」(price + 20)を出力しよう
const price = 1980
console.log(`合計: ${price + 20}円`)

// TODO: 2. Schema.transform で「カンマ区切り文字列 → 文字列配列」の
//          Tags スキーマを作り、"effect,typescript,fp" から「タグ数: 3」を出そう

// TODO: 3. Schema.filter で「0以上の整数」の制約を持つ Quantity を作り、
//          下の try/catch で -5 を検証してエラーを観察しよう
try {
  // ここで Schema.decodeUnknownSync(Quantity)(-5) を呼ぶ
  console.log("検証エラー:\n(まだ検証していません)")
} catch (e) {
  console.log("検証エラー:\n" + (e as Error).message)
}
