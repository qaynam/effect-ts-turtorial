import { Brand, Either, Schema } from "effect"

// 「検証を通った string」だけがこの型になる
type Email = string & Brand.Brand<"Email">
const Email = Brand.refined<Email>(
  (s) => s.includes("@"),
  (s) => Brand.error(`@ がありません: ${s}`),
)

// TODO: 1. 引数の型を string から Email に変えよう。
//          変えたあと下のコメント行を外すと、型エラーになることを確かめよう
const sendMail = (to: string) => console.log(`送信: ${to}`)

sendMail(Email("taro@example.com"))
// sendMail("taro-example.com")

// TODO: 2. Email.either("taro-example.com") で検証し、
//          左なら `拒否: ${result.left[0].message}` を出力しよう
console.log("拒否: (まだ検証していません)")

// TODO: 3. Schema.filter で "@" を含むか検証し、Schema.brand("Email") を付けた
//          EmailFromString を作ろう。decode した値を sendMail に渡し、
//          "hanako" が拒否されることも確認しよう
const EmailFromString = Schema.String

sendMail(Schema.decodeUnknownSync(EmailFromString)("hanako@example.com"))

const bad = Schema.decodeUnknownEither(EmailFromString)("hanako")
console.log(Either.isLeft(bad) ? "Schema も拒否しました" : "通過")
