import { Effect } from "effect"

// この divide は throw で失敗を表している。
// Effect.succeed / Effect.fail を使って「失敗を値として返す」形に
// 書き換えてみよう(戻り値の型: Effect.Effect<number, Error>)
function divide(a: number, b: number): number {
  if (b === 0) throw new Error("ゼロで割れません")
  return a / b
}

// ここから下は書き換え後に動くようになる確認用コード。
// divide が Effect を返すようになったら、コメントを外そう
// const result = Effect.runSync(divide(10, 2))
// console.log("割り算成功:", result)
//
// const failed = Effect.runSyncExit(divide(1, 0))
// if (failed._tag === "Failure") {
//   console.log("ゼロ除算はエラーになる")
// }

console.log("割り算成功:", divide(10, 2))
