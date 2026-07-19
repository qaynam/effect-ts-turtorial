---
title: "promise と tryPromise"
summary: "async 処理を Effect にする"
docs:
  - label: "Creating Effects"
    url: "https://effect.website/docs/getting-started/creating-effects/"
expectedOutput: |
  処理完了: コーヒー
  在庫がありません
---

前のレッスンの `sync` / `try` の非同期版が `Effect.promise` / `Effect.tryPromise` です。対応関係はそのままで、包む対象が同期処理から `Promise` に変わるだけです。

ここでも「関数で包む」ことが効いてきます。`Promise` は**作った瞬間に走り出す**ので、それ自体は設計図になれません。`Effect.promise` が受け取るのは `() => Promise<A>`、つまり「まだ走り出していない、Promise の作り方」です。

## promise: reject しない Promise を包む

エディタのコードの `brewPromise`(100ms 後にコーヒーができる async 関数)を、`Effect.promise` で設計図にしましょう。実行には `runPromise` を使います。同期の `runSync` に対する非同期版で、結果を `Promise` として返します。

```ts
~~~const brewPromise = async () => {
  await wait(100)
  return "コーヒー"
}~~~
+++const brew = Effect.promise(async () => {
  await wait(100)
  return "コーヒー"
})+++

~~~console.log("処理完了:", await brewPromise())~~~
+++console.log("処理完了:", await Effect.runPromise(brew))+++
```

`Effect.promise` は「絶対に reject しない」前提の道具なので、`brew` の `E` は `never` のままです。

## tryPromise: reject しうる Promise を包む

通信や在庫確認のように失敗しうる async 処理には `Effect.tryPromise` を使います。`{ try, catch }` の形で書くと、reject された値を `catch` で受け取って、`E` に入れるエラーを自分で決められます。

```ts
+++const checkStock = (item: string) =>
  Effect.tryPromise({
    try: async () => {
      await wait(100)
      if (item !== "コーヒー") throw new Error("在庫なし")
      return item
    },
    catch: () => new Error("在庫がありません"),
  })

const exit = await Effect.runPromiseExit(checkStock("紅茶"))
if (exit._tag === "Failure" && exit.cause._tag === "Fail") {
  console.log(exit.cause.error.message)
}+++
```

Run して 2 行の出力を確認しましょう。`checkStock` にカーソルを乗せると `E` が `Error` になっています。`catch` を省略した `Effect.tryPromise(() => ...)` の形も試してみてください。`E` が前レッスンと同じ `UnknownException` に変わります。
