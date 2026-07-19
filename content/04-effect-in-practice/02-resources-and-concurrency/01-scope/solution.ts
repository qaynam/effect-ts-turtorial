import { Effect } from "effect"

// finalizer を登録した時点で R に Scope が現れる:
//   Effect<void, never, Scope>
const program = Effect.gen(function* () {
  yield* Effect.addFinalizer(() =>
    Effect.sync(() => console.log("一時フォルダを削除した")),
  )
  console.log("ファイルを開いた")
  yield* Effect.addFinalizer(() =>
    Effect.sync(() => console.log("ファイルを閉じた")),
  )
  console.log("内容を処理中...")
})

// Effect.scoped = Scope を作る → 実行 → 閉じる(finalizer を逆順に実行)
Effect.runSync(Effect.scoped(program))
