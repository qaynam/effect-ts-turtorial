---
title: "Data.TaggedError"
summary: "エラーを型で定義し、E をユニオンにする"
docs:
  - label: "Yieldable Errors"
    url: "https://effect.website/docs/error-management/yieldable-errors/"
expectedOutput: |
  user-1
  エラーの種類: NotFoundError
  id=999 は存在しません
---

ここまで `E` はずっと `Error` 1 種類でした。しかし実際の処理は「ネットワーク障害」「対象が見つからない」など、**性質の違う複数の失敗**を持ちます。全部 `Error` に潰してしまうと、呼び出し側はメッセージ文字列を見て分岐するしかありません。

Part 2 で学んだ ADT とパターンマッチを思い出してください。「種類ごとに `_tag` を持つ型を作り、`_tag` で分岐する」。エラーにもそれをやるための道具が `Data.TaggedError` です。

## エラー型を定義する

右のコードに 2 つのエラー型を定義しましょう。

```ts
+++class NetworkError extends Data.TaggedError("NetworkError")<{ url: string }> {}

class NotFoundError extends Data.TaggedError("NotFoundError")<{ id: number }> {}+++
```

`"NetworkError"` が `_tag` になり、`<{ ... }>` の中がエラーに持たせるフィールドです。しかもこのクラスのインスタンスは **yieldable**(そのまま `yield*` できる)で、`Effect.gen` の中で `yield*` するとその場で失敗になります。

## E がユニオンになる

`fetchUser` の TODO を埋めて、2 種類の失敗を投げ分けましょう。

```ts
const fetchUser = (id: number) =>
  Effect.gen(function* () {
+++    if (id < 0) {
      return yield* new NetworkError({ url: `/users/${id}` })
    }
    if (id > 100) {
      return yield* new NotFoundError({ id })
    }+++
    return `user-${id}`
  })
```

書けたら `fetchUser` にカーソルを乗せてください。戻り値が `Effect<string, NetworkError | NotFoundError>` になっています。失敗の種類が増えると、`E` は自動的に**ユニオン**として集計されます。どこにも手で書いていないのに、です。

## 失敗の中身を取り出す

`fetchUser(999)` は失敗するようになったので、末尾の観察コードを、エラーの種類とフィールドを取り出す形に差し替えます。

```ts
const exit = Effect.runSyncExit(fetchUser(999))
~~~console.log(exit._tag)~~~
+++if (exit._tag === "Failure" && exit.cause._tag === "Fail") {
  const error = exit.cause.error
  console.log("エラーの種類:", error._tag)
  if (error._tag === "NotFoundError") {
    console.log(`id=${error.id} は存在しません`)
  }
}+++
```

Run しましょう。`_tag` で種類を判定し、`NotFoundError` のときだけ `id` フィールドに触れています。ADT のパターンマッチそのままです。この `_tag` は次のレッスンで、エラーを狙い撃ちで回復するための照準になります。
