import { Effect } from "effect"

// 取得と解放をペアで宣言する。
// 取得した値({ name: "db-1" })が解放関数の引数に渡ってくる
const connection = Effect.acquireRelease(
  Effect.sync(() => {
    console.log("接続を開いた")
    return { name: "db-1" }
  }),
  () => Effect.sync(() => console.log("接続を閉じた")),
)

// 途中で失敗する処理
const program = Effect.gen(function* () {
  yield* connection
  console.log("クエリを実行中...")
  yield* Effect.fail(new Error("クエリに失敗"))
})

// 失敗しても「接続を閉じた」が必ず出力される
const exit = Effect.runSyncExit(Effect.scoped(program))
console.log("結果:", exit._tag)
