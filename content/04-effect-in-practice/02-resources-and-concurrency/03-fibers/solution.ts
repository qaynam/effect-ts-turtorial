import { Effect, Fiber } from "effect"

const download = Effect.gen(function* () {
  yield* Effect.sleep("100 millis")
  console.log("バックグラウンド: ダウンロード完了")
  return 42
})

const program = Effect.gen(function* () {
  // fork は download の完了を待たず、すぐ Fiber を返す
  const fiber = yield* Effect.fork(download)
  console.log("メイン: fork した。待たずに先へ進む")
  console.log("メイン: 別の仕事をしている...")
  // 結果が必要になったところで合流する
  const result = yield* Fiber.join(fiber)
  console.log("メイン: 受け取った結果 =", result)
})

Effect.runPromise(program)
