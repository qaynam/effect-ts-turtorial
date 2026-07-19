import { Effect } from "effect"

// 「実行すれば必ず 42 を返す計算」の設計図。まだ実行されていない
const program1 = Effect.succeed(42)

// 「エラーで失敗する計算」の設計図。これもまだ実行されていない
const program2 = Effect.fail(new Error("何かがうまくいかなかった"))

// ↑ program1 と program2 にカーソルを乗せて、
//   Effect<A, E, R> の各パラメータに何が入っているか確認しよう

// TODO: Effect.succeed("hello") で program3 を作り、型を予想してからホバーで確認

// 設計図を 1 つだけ実行してみる(実行の仕方は次のレッスンから)
console.log(Effect.runSync(program1))
