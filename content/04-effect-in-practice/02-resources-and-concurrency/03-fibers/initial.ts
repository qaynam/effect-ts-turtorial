import { Effect } from "effect"

// 完了まで 100 ミリ秒かかるダウンロード処理
const download = Effect.gen(function* () {
  yield* Effect.sleep("100 millis")
  console.log("バックグラウンド: ダウンロード完了")
  return 42
})

// 今は download が終わるまでメインが止まってしまう。
// TODO: 1. Effect.fork(download) で別 Fiber に切り離そう
// TODO: 2. 最後に Fiber.join(fiber) で結果を受け取って出力しよう
//         (import に Fiber を足すのを忘れずに)
const program = Effect.gen(function* () {
  const result = yield* download
  console.log("メイン: fork した。待たずに先へ進む")
  console.log("メイン: 別の仕事をしている...")
  console.log("メイン: 受け取った結果 =", result)
})

Effect.runPromise(program)
