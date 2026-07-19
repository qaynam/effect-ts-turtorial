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
  // TODO: 1. Effect.repeat(healthCheck, Schedule.recurs(2)) で繰り返し、
  //          戻り値を「繰り返し回数: N」と出力しよう
  yield* healthCheck

  // TODO: 2. backup を「50 ミリ秒ごと、ただし 2 回まで」で繰り返そう
  //          (Schedule.intersect + Schedule.spaced + Schedule.recurs)
  yield* backup
})

Effect.runPromise(program)
