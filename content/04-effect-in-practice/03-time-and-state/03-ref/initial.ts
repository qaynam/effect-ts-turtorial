import { Effect, Ref } from "effect"

const program = Effect.gen(function* () {
  // TODO: 1. Ref.make(0) でカウンターを作り、Ref.get で「初期値: 0」を出力
  // TODO: 2. Ref.update(counter, (n) => n + 1) で更新し、「1回更新後: 1」を出力
  // TODO: 3. Effect.all + { concurrency: "unbounded" } で
  //          1000 個の Ref.update を並行実行し、最終値を出力
  console.log("初期値:", 0)
})

Effect.runPromise(program)
