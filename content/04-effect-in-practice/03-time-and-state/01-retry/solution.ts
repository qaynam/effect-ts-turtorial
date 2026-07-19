import { Effect, Schedule } from "effect"

let attempts = 0

const flakyConnect = Effect.gen(function* () {
  attempts++
  console.log(`接続を試行(${attempts}回目)`)
  if (attempts < 3) {
    return yield* Effect.fail(new Error("接続失敗"))
  }
  return "接続成功"
})

// 「待ち時間は 10ms から倍々、ただし最大 5 回まで」という方針。
// 両方が続行を許す間だけ再試行される
const policy = Schedule.intersect(
  Schedule.exponential("10 millis"),
  Schedule.recurs(5),
)

const program = Effect.gen(function* () {
  const result = yield* Effect.retry(flakyConnect, policy)
  console.log(result)
})

Effect.runPromiseExit(program)
