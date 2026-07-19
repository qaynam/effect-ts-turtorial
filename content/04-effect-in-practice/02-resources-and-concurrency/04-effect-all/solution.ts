import { Effect } from "effect"

const fetchData = (name: string) =>
  Effect.gen(function* () {
    yield* Effect.sleep("200 millis")
    return name
  })

const program = Effect.gen(function* () {
  const start = Date.now()

  // concurrency: "unbounded" なら約 200 ミリ秒、
  // 2 なら約 400 ミリ秒、指定なし(直列)なら約 600 ミリ秒
  const results = yield* Effect.all(
    [fetchData("ユーザー"), fetchData("投稿"), fetchData("コメント")],
    { concurrency: 2 },
  )

  const elapsed = Date.now() - start
  console.log("結果:", results.join(", "))
  console.log(`所要時間: 約${Math.round(elapsed / 100) * 100}ミリ秒`)
})

Effect.runPromise(program)
