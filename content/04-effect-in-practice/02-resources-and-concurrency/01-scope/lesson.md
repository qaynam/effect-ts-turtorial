---
title: "Scope"
summary: "後片付けを Scope に登録する"
docs:
  - label: "Scope"
    url: "https://effect.website/docs/resource-management/scope/"
expectedOutput: |
  ファイルを開いた
  内容を処理中...
  ファイルを閉じた
  一時フォルダを削除した
---

ファイル、DB 接続、ロック。開いたら閉じる、確保したら解放する。この「後片付け」は、途中でエラーが起きても必ず実行されなければなりません。手書きの try/finally はネストが深くなるとすぐ破綻します。

Effect の答えが `Scope`(スコープ)です。Scope は「後片付けの予約リスト」で、`Effect.addFinalizer` で **finalizer(終了処理)** を登録しておくと、Scope が閉じるときにまとめて実行されます。

## finalizer を登録する

右のコードは、ファイルを開いて処理をしますが、閉じ忘れています。開いた直後に finalizer を登録しましょう。

```ts
const program = Effect.gen(function* () {
  console.log("ファイルを開いた")
+++  yield* Effect.addFinalizer(() =>
    Effect.sync(() => console.log("ファイルを閉じた")),
  )+++
  console.log("内容を処理中...")
})
```

ここで `program` の型を見てください。`Effect<void, never, Scope>` になっています。finalizer を登録するには Scope が必要なので、依存として `R` に現れるのです。前レッスンのサービスと同じ仕組みです。

## Scope を閉じる

`Effect.scoped` で包むと、「Scope を作る → 中を実行する → Scope を閉じて finalizer を全部実行する」という流れになり、`R` から `Scope` が消えます。

```ts
Effect.runSync(+++Effect.scoped(+++program+++)+++)
```

## 実験: 逆順に実行される

もう 1 つリソースを増やしてみましょう。ファイルを開く前に一時フォルダを作るとします。

```ts
const program = Effect.gen(function* () {
+++  yield* Effect.addFinalizer(() =>
    Effect.sync(() => console.log("一時フォルダを削除した")),
  )+++
  console.log("ファイルを開いた")
  ...
```

Run すると、finalizer は**登録と逆の順序**で実行されます。後に確保したものから先に手放す。ファイルより先にフォルダを消してしまう事故が、構造的に起こらなくなっています。
