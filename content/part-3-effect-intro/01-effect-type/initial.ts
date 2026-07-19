import { Effect } from "effect"

// 「必ず 42 を返す計算」の設計図。まだ実行されていない
const program1 = Effect.succeed(42)

// 「エラーで失敗する計算」の設計図。これもまだ実行されていない
const program2 = Effect.fail(new Error("何かがうまくいかなかった"))

// ↑ program1 と program2 にカーソルを乗せて、Effect<A, E, R> の
//   それぞれの型パラメータに何が入っているか確認してみよう

// 設計図を実行する(詳しくは次のレッスンで)
console.log(Effect.runSync(program1))
