---
title: "Effect.gen"
summary: "ジェネレータで同期コードのように書く"
docs:
  - label: "Using Generators"
    url: "https://effect.website/docs/getting-started/using-generators/"
expectedOutput: |
  合計金額: 3300
---

# Effect.gen

`flatMap` の連鎖でも Effect はつなげられますが、手続きが長くなるとネストや変数の受け渡しがつらくなってきます。

そこで `Effect.gen` です。**ジェネレータ関数**を使って、`async/await` とほぼ同じ感覚で Effect を書けます。

```ts
const program = Effect.gen(function* () {
  const user = yield* fetchUser(1)
  const posts = yield* fetchPosts(user.id)
  return posts.length
})
```

## 読み方

- `Effect.gen(function* () { ... })` : この中では手続き的に書ける
- `yield* someEffect` : `await` に相当。Effect を実行して**成功値を取り出す**
- `return 値` : プログラム全体の成功値になる

`async/await` との対応で覚えると簡単です。

| async/await | Effect.gen |
| --- | --- |
| `async function` | `Effect.gen(function* () { ... })` |
| `await promise` | `yield* effect` |
| `return x` | `return x` |

大事な違いが 1 つ: `await` と違って、`yield*` は**エラーの型も伝播します**。途中の Effect が `Effect<A, SomeError>` なら、できあがった program の `E` に `SomeError` が自動的に集まります。try/catch を書かなくても、失敗の可能性が型から消えません。

## 課題

右のコードは、商品リストから合計金額を計算する処理を `flatMap` の連鎖で書いたものです。同じ処理を `Effect.gen` で書き直してください。

出力が `合計金額: 3300` のままなら成功です。
