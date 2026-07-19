---
title: "acquireRelease"
summary: "取得と解放をペアで宣言する"
docs:
  - label: "Scope"
    url: "https://effect.website/docs/resource-management/scope/"
expectedOutput: |
  接続を開いた
  クエリを実行中...
  接続を閉じた
  結果: Failure
---

前のレッスンでは finalizer を手で登録しました。しかし「取得」と「解放」は常にペアです。開いたら閉じる、繋いだら切る。ペアであることをコードの形でも保証したい。それが `Effect.acquireRelease` です。

```ts
Effect.acquireRelease(取得のEffect, (リソース) => 解放のEffect)
```

これで「取得すると同時に、解放が Scope に予約されるリソース」ができあがります。

## リソースを定義する

右のコードの DB 接続を `acquireRelease` で包みましょう。

```ts
+++const connection = Effect.acquireRelease(
  Effect.sync(() => {
    console.log("接続を開いた")
    return { name: "db-1" }
  }),
  () => Effect.sync(() => console.log("接続を閉じた")),
)+++
```

取得の Effect が返した値(接続オブジェクト)は、解放関数の引数にも渡ってきます。閉じるべきものを取り違えることがありません。

## 失敗しても解放されるか

このリソースを使う処理が、途中で失敗するとどうなるでしょう。`program` を仕上げて確かめます。

```ts
const program = Effect.gen(function* () {
+++  yield* connection+++
  console.log("クエリを実行中...")
+++  yield* Effect.fail(new Error("クエリに失敗"))+++
})

+++const exit = Effect.runSyncExit(Effect.scoped(program))
console.log("結果:", exit._tag)+++
```

Run してください。`クエリを実行中...` の直後に失敗しているのに、`接続を閉じた` が出力されています。**成功しても失敗しても、Scope を抜ける瞬間に解放は必ず走る**。リソース管理で一番怖い「エラー時の閉じ忘れ」が、宣言した時点で消えています。

`Effect.fail` の行を削除して、成功時も同じように閉じられることを確認してみましょう(結果は `Success` になります)。
