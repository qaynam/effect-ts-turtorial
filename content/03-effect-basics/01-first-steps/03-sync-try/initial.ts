import { Effect } from "effect"

// succeed の引数は「即座に」評価される。
// そのまま Run すると、console.log が先に走ってしまうことを確認しよう。
// TODO ①: Effect.sync(() => { ... }) に書き換えて、42 を返すようにする
const hello = Effect.succeed(console.log("実行された!"))

console.log("--- まだ何も実行されていない ---")
console.log(Effect.runSync(hello))

// TODO ②: JSON.parse は不正な文字列で throw する。
//          Effect.try で包んだ parseJson を作り、
//          成功(名前の取り出し)と失敗(_tag の表示)を確認しよう
