import { Effect, Either, ParseResult, Schema } from "effect"

const Form = Schema.Struct({
  name: Schema.String.pipe(Schema.minLength(1)),
  age: Schema.Number,
  email: Schema.String,
})
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
console.log("[errors: all]")
report(Schema.decodeUnknownEither(Form, { errors: "all" })(input))

// 互いに独立した 3 つの検証。先頭 2 つが失敗する
const check = (label: string, ok: boolean) =>
  ok ? Effect.succeed(label) : Effect.fail(`${label}が不正です`)
const checks = [check("名前", false), check("年齢", false), check("メール", true)]

console.log("[Effect.all]")
Effect.runSync(
  Effect.all(checks).pipe(Effect.catchAll((e) => Effect.sync(() => console.log("- " + e)))),
)
console.log("[Effect.validateAll]")
Effect.runSync(
  Effect.validateAll(checks, (c) => c).pipe(
    Effect.catchAll((es) => Effect.sync(() => es.forEach((e) => console.log("- " + e)))),
  ),
)
