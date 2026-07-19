import { Effect } from "effect"

const ok = Effect.succeed(42)
const ng = Effect.fail(new Error("接続に失敗しました"))
const later = Effect.promise(() => Promise.resolve("非同期の結果"))

// TODO ①: ok を runSync で実行して出力しよう
// TODO ②: ok と ng を runSyncExit で実行し、Exit の _tag を比べよう
//          (ng の失敗からは cause 経由でエラーメッセージも取り出せる)
// TODO ③: later を runPromise で実行して出力しよう
