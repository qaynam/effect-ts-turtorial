import { Effect } from "effect"

// TODO: 1. この「開くだけ」の Effect を Effect.acquireRelease で包み、
//          解放時に「接続を閉じた」と出力する connection を作ろう
const connection = Effect.sync(() => {
  console.log("接続を開いた")
  return { name: "db-1" }
})

// TODO: 2. connection を yield* してから、
//          Effect.fail(new Error("クエリに失敗")) で途中失敗させてみよう
const program = Effect.gen(function* () {
  yield* connection
  console.log("クエリを実行中...")
})

// TODO: 3. Effect.scoped で包んで runSyncExit し、exit._tag を出力しよう
const exit = Effect.runSyncExit(program)
console.log("結果:", exit._tag)
