import { Effect, Schedule } from "effect"

let checks = 0
const healthCheck = Effect.sync(() => {
  checks++
  console.log(`死活監視(${checks}回目)`)
})

let backups = 0
const backup = Effect.sync(() => {
  backups++
  console.log(`バックアップ実行(${backups}回目)`)
})

const program = Effect.gen(function* () {
  // 1 回実行 + 2 回繰り返し = 計 3 回。戻り値は繰り返した回数
  const count = yield* Effect.repeat(healthCheck, Schedule.recurs(2))
  console.log("繰り返し回数:", count)

  // 「50 ミリ秒ごとに」かつ「繰り返しは 2 回まで」
  yield* Effect.repeat(
    backup,
    Schedule.intersect(Schedule.spaced("50 millis"), Schedule.recurs(2)),
  )
})

Effect.runPromise(program)
