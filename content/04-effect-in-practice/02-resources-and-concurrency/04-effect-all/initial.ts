import { Effect } from "effect"

// name の取得に 200 ミリ秒かかるタスク
const fetchData = (name: string) =>
  Effect.gen(function* () {
    yield* Effect.sleep("200 millis")
    return name
  })

const program = Effect.gen(function* () {
  const start = Date.now()

  // TODO: { concurrency: "unbounded" } を足して並行実行にしてみよう。
  // そのあと concurrency: 2 にすると時間はどうなる?
  const results = yield* Effect.all([
    fetchData("ユーザー"),
    fetchData("投稿"),
    fetchData("コメント"),
  ])

  const elapsed = Date.now() - start
  console.log("結果:", results.join(", "))
  console.log(`所要時間: 約${Math.round(elapsed / 100) * 100}ミリ秒`)
})

Effect.runPromise(program)
