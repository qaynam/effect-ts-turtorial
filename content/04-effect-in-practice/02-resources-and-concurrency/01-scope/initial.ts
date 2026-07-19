import { Effect } from "effect"

// ファイルを開いて処理をするが、閉じ忘れている
// TODO: 1. Effect.addFinalizer で「ファイルを閉じた」を登録しよう
// TODO: 2. runSync の前に Effect.scoped で包もう(R から Scope が消える)
// TODO: 3. 冒頭に「一時フォルダを削除した」の finalizer も足して、実行順を観察しよう
const program = Effect.gen(function* () {
  console.log("ファイルを開いた")
  console.log("内容を処理中...")
})

Effect.runSync(program)
