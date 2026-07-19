import { Schema } from "effect"

// 入力は文字列、検証後は number という「変換つきスキーマ」
const price = Schema.decodeUnknownSync(Schema.NumberFromString)("1980")
console.log(`合計: ${price + 20}円`)

// 自作の変換: カンマ区切り文字列 <-> 文字列配列(decode / encode で双方向)
const Tags = Schema.transform(Schema.String, Schema.Array(Schema.String), {
  strict: true,
  decode: (s) => s.split(","),
  encode: (tags) => tags.join(","),
})

const tags = Schema.decodeUnknownSync(Tags)("effect,typescript,fp")
console.log("タグ数:", tags.length)

// 既存スキーマに制約を重ねる。メッセージも自分で決められる
const Quantity = Schema.Number.pipe(
  Schema.filter((n) => (Number.isInteger(n) && n >= 0) || "0以上の整数が必要です"),
)

try {
  Schema.decodeUnknownSync(Quantity)(-5)
} catch (e) {
  console.log("検証エラー:\n" + (e as Error).message)
}
