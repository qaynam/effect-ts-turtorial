import { Brand, Either, Schema } from "effect"

// 「検証を通った string」だけがこの型になる
type Email = string & Brand.Brand<"Email">
const Email = Brand.refined<Email>(
  (s) => s.includes("@"),
  (s) => Brand.error(`@ がありません: ${s}`),
)

// 引数は string ではなく Email。生の文字列は受け取れない
const sendMail = (to: Email) => console.log(`送信: ${to}`)

sendMail(Email("taro@example.com"))
// sendMail("taro-example.com") // コメントを外すと型エラーになる

// 例外を投げずに検証したいときは either
const result = Email.either("taro-example.com")
console.log(Either.isLeft(result) ? `拒否: ${result.left[0].message}` : "通過")

// Schema の検証結果に brand を付ける
const EmailFromString = Schema.String.pipe(
  Schema.filter((s) => s.includes("@") || "@ が必要です"),
  Schema.brand("Email"),
)

// decode を通った値はそのまま Email 型として sendMail に渡せる
sendMail(Schema.decodeUnknownSync(EmailFromString)("hanako@example.com"))

const bad = Schema.decodeUnknownEither(EmailFromString)("hanako")
console.log(Either.isLeft(bad) ? "Schema も拒否しました" : "通過")
