import { Effect } from "effect"

let attempts = 0

// 3 回目の呼び出しで初めて成功する、不安定な接続処理
const flakyConnect = Effect.gen(function* () {
  attempts++
  console.log(`接続を試行(${attempts}回目)`)
  if (attempts < 3) {
    return yield* Effect.fail(new Error("接続失敗"))
  }
  return "接続成功"
})

// TODO: Effect.retry(flakyConnect, Schedule.recurs(5)) で再試行しよう
//       (import に Schedule を足すのを忘れずに)
// 発展: Schedule.intersect(Schedule.exponential("10 millis"), Schedule.recurs(5))
//       で「倍々で待ちつつ最大 5 回」にしてみよう
const program = Effect.gen(function* () {
  const result = yield* flakyConnect
  console.log(result)
})

Effect.runPromiseExit(program)
