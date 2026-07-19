import { Effect } from "effect"

// 応答速度の違う 2 つのミラーサーバー
const mirror1 = Effect.sleep("250 millis").pipe(Effect.as("ミラー1の応答"))
const mirror2 = Effect.sleep("100 millis").pipe(Effect.as("ミラー2の応答"))

// 300 ミリ秒かかる遅い API
const slowApi = Effect.sleep("300 millis").pipe(Effect.as("本来の応答"))

const program = Effect.gen(function* () {
  // TODO: 1. Effect.race(mirror1, mirror2) で競争させ、
  //          「勝者: ...」と出力しよう
  // TODO: 2. slowApi に Effect.timeout("150 millis") をかけ、
  //          TimeoutException を catchTag して
  //          「時間切れ: キャッシュを返す」に切り替えよう
})

Effect.runPromise(program)
