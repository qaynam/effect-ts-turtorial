import { Effect } from "effect"

// この divide は throw で失敗を表している。
// 型 (a: number, b: number) => number には失敗の可能性が現れていない。
// TODO: Effect.succeed / Effect.fail で「失敗を値として返す」形に書き換えよう
//       (戻り値の型: Effect.Effect<number, Error>)
function divide(a: number, b: number): number {
  if (b === 0) throw new Error("ゼロで割れません")
  return a / b
}

// TODO: divide が Effect を返すようになったら、レッスンの手順に沿って
//       この確認コードも実行する形に差し替えよう
console.log("割り算成功:", divide(10, 2))
