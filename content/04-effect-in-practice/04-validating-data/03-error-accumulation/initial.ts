import { Effect, Either, ParseResult, Schema } from "effect"

const Form = Schema.Struct({
  name: Schema.String.pipe(Schema.minLength(1)),
  age: Schema.Number,
  email: Schema.String,
})
// 3 つのフィールドすべてが不正な入力
const input: unknown = { name: "", age: "28", email: 123 }

// ParseError を「1 行 1 件」に平らな配列へ整形して表示する
const report = (e: Either.Either<unknown, ParseResult.ParseError>) => {
  if (Either.isRight(e)) return
  for (const i of ParseResult.ArrayFormatter.formatIssueSync(e.left.issue)) {
    console.log(`- ${i.path.join(".")}: ${i.message}`)
  }
}

console.log("[fail-fast]")
report(Schema.decodeUnknownEither(Form)(input))
// TODO: 1. errors: "all" を渡した decodeUnknownEither でも report しよう
//          ラベルは console.log('[errors: all]')

// 互いに独立した 3 つの検証。先頭 2 つが失敗する
const check = (label: string, ok: boolean) =>
  ok ? Effect.succeed(label) : Effect.fail(`${label}が不正です`)
const checks = [check("名前", false), check("年齢", false), check("メール", true)]

console.log("[Effect.all]")
Effect.runSync(
  Effect.all(checks).pipe(Effect.catchAll((e) => Effect.sync(() => console.log("- " + e)))),
)
// TODO: 2. Effect.validateAll(checks, (c) => c) でも同じ checks を走らせ、
//          集まったエラーを 1 件ずつ出力しよう
//          ラベルは console.log("[Effect.validateAll]")
