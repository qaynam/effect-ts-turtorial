---
title: "catchTag と catchAll"
summary: "エラーを処理すると E から消えていく"
docs:
  - label: "Expected Errors"
    url: "https://effect.website/docs/error-management/expected-errors/"
expectedOutput: |
  ゲスト (id=999 は未登録)
  オフライン表示 (/users/-1)
---

前のレッスンで `E` に集まった `NetworkError | NotFoundError` を、今度は**回復**します。Effect のエラーハンドリングには気持ちのいい性質があります。処理したエラーは、`E` の型から**消える**のです。「どの失敗が処理済みで、どれが残っているか」を、コンパイラがずっと帳簿につけてくれます。

## catchTag: 1 種類だけ狙い撃つ

`Effect.catchTag` は、前レッスンで仕込んだ `_tag` を照準にして、特定のエラーだけ回復ハンドラに流します。ユーザーが見つからないときはゲスト扱いにしましょう。

```ts
const recovered = fetchUser(999)+++.pipe(
  Effect.catchTag("NotFoundError", (e) =>
    Effect.succeed(`ゲスト (id=${e.id} は未登録)`),
  ),
)+++
```

書けたら `recovered` にカーソルを乗せてください。`E` が `NetworkError | NotFoundError` から `NetworkError` **だけ**になっています。`NotFoundError` は処理済みなので、型から消えました。ハンドラの引数 `e` が最初から `NotFoundError` に絞り込まれている(`e.id` が補完される)ことにも注目です。

## catchAll: 残りをすべて処理する

`safe` のほうは、残った `NetworkError` もまとめて回復します。

```ts
const safe = fetchUser(-1)+++.pipe(
  Effect.catchTag("NotFoundError", (e) => Effect.succeed(`ゲスト (id=${e.id})`)),
  Effect.catchAll((e) => Effect.succeed(`オフライン表示 (${e.url})`)),
)+++
```

`catchAll` に届く時点で `e` は `NetworkError` だけなので、迷わず `e.url` を使えます。`safe` にホバーすると `E` は `never`。もう失敗しようがありません。

## Exit の観察をやめる

回復が済んだので、`_tag` を覗く代わりに結果そのものを出力しましょう。`E` が回復済みなら、`runSync` は安心して使えます。

```ts
~~~console.log(Effect.runSyncExit(recovered)._tag)~~~
+++console.log(Effect.runSync(recovered))+++
```

`safe` の行も同じように差し替えて Run すると、ゲスト表示とオフライン表示の 2 行が出力されます。試しに `catchAll` の行を消してみてください。`safe` の `E` に `NetworkError` が残ることが、ホバーですぐ分かります。エラー処理の進み具合が、そのまま型に写っているのです。
