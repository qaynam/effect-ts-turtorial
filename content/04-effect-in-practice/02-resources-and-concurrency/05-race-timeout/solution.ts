import { Effect } from "effect"

const mirror1 = Effect.sleep("250 millis").pipe(Effect.as("ミラー1の応答"))
const mirror2 = Effect.sleep("100 millis").pipe(Effect.as("ミラー2の応答"))

const slowApi = Effect.sleep("300 millis").pipe(Effect.as("本来の応答"))

const program = Effect.gen(function* () {
  // 先に成功した方が勝ち。負けた Fiber は自動的に中断される
  const winner = yield* Effect.race(mirror1, mirror2)
  console.log("勝者:", winner)

  // 時間切れは TimeoutException という普通の失敗値になる
  const result = yield* slowApi.pipe(
    Effect.timeout("150 millis"),
    Effect.catchTag("TimeoutException", () =>
      Effect.succeed("時間切れ: キャッシュを返す"),
    ),
  )
  console.log(result)
})

Effect.runPromise(program)
