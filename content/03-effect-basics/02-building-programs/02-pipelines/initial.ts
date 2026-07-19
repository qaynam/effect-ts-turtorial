import { Effect } from "effect"

const getPrice = Effect.succeed(1200)

// ネストした書き方。読む順序が内側から外側になってつらい。
// TODO ①: .pipe() を使って上から下へ流れる形に書き換えよう
// TODO ②: 先頭に tap を足して、税抜価格をログに出そう
// TODO ③: flatMap + Effect.succeed を andThen 1 つにまとめよう
const program = Effect.flatMap(
  Effect.map(getPrice, (price) => price * 1.1),
  (price) => Effect.succeed(`合計: ${Math.round(price)} 円`),
)

console.log(Effect.runSync(program))
