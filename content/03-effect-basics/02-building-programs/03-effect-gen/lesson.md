---
title: "Effect.gen"
summary: "ジェネレータで同期コードのように書く"
docs:
  - label: "Using Generators"
    url: "https://effect.website/docs/getting-started/using-generators/"
expectedOutput: |
  2 点で合計 3300 円
---

パイプラインは強力ですが、弱点があります。右のコードを見てください。合計金額のメッセージには `items`(点数)と `total`(合計)の**両方**が必要なので、`flatMap` の中に `map` を入れ子にして `items` をスコープに残すしかありません。手続きが長くなるほど、このネストは深くなります。

そこで `Effect.gen` です。**ジェネレータ関数**を使うと、`async/await` とほぼ同じ感覚で上から下へ書けます。

| async/await | Effect.gen |
| --- | --- |
| `async function` | `Effect.gen(function* () { ... })` |
| `await promise` | `yield* effect` |
| `return x` | `return x` |

## 書き直す

ネストした `program` を `Effect.gen` に置き換えましょう。

```ts
~~~const program = fetchCart.pipe(
  Effect.flatMap((items) =>
    calcTotal(items).pipe(
      Effect.map((total) => `${items.length} 点で合計 ${total} 円`),
    ),
  ),
)~~~
+++const program = Effect.gen(function* () {
  const items = yield* fetchCart
  const total = yield* calcTotal(items)
  return `${items.length} 点で合計 ${total} 円`
})+++
```

`yield*` が `await` に相当し、Effect を「実行予約」して成功値を取り出します。`items` と `total` が同じスコープに並ぶので、入れ子が消えました。`return` した値がプログラム全体の成功値になります。

`await` との大事な違いが 1 つあります。`yield*` は**エラーの型も伝播する**ことです。途中の Effect が `Effect<A, SomeError>` なら、できあがった `program` の `E` に `SomeError` が自動的に集まります。try/catch を書かなくても、失敗の可能性が型から消えません(前レッスンの `flatMap` の短絡がここでも働いています)。

Run して出力が `2 点で合計 3300 円` のままなら書き換え成功です。カートに `{ name: "マウス", price: 4500 }` を足して、点数と合計の両方が変わることも確かめてみましょう。
