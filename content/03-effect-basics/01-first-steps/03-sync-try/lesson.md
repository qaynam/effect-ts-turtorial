---
title: "sync と try"
summary: "副作用と throw しうる同期処理を設計図に閉じ込める"
docs:
  - label: "Creating Effects"
    url: "https://effect.website/docs/getting-started/creating-effects/"
expectedOutput: |
  --- まだ何も実行されていない ---
  実行された!
  42
  Alice
  Failure
---

`succeed` は「すでに手元にある値」を成功にする道具でした。では `console.log` や `Date.now()` のような**副作用**はどう設計図にすればよいでしょうか。

エディタのコードを、まず書き換えずに Run してみてください。`実行された!` が `--- まだ何も実行されていない ---` より**先に**出力されてしまいます。JavaScript は引数を即座に評価するので、`Effect.succeed(console.log(...))` と書いた時点で `console.log` が走ってしまうのです。これでは設計図になりません。

## sync: 副作用を関数で包む

`Effect.sync` は値ではなく**関数**を受け取ります。関数の中身は、実行されるまで評価されません。

```ts
const hello = ~~~Effect.succeed(console.log("実行された!"))~~~+++Effect.sync(() => {
  console.log("実行された!")
  return 42
})+++
```

書き換えたら Run しましょう。今度は `--- まだ何も実行されていない ---` が先に出て、`runSync` の時点で初めて `実行された!` と戻り値の `42` が出力されます。`Date.now()` や `Math.random()` のような「呼ぶたびに結果が変わる」関数も、同じように `sync` で包みます。

## try: throw しうる処理を包む

`sync` は「throw しない」前提の道具です。`JSON.parse` のように throw しうる処理には `Effect.try` を使います。throw された例外は `E` チャンネルの失敗に変わります。

```ts
+++const parseJson = (text: string) =>
  Effect.try(() => JSON.parse(text) as { name: string })

console.log(Effect.runSync(parseJson('{"name":"Alice"}')).name)
console.log(Effect.runSyncExit(parseJson("{壊れたJSON"))._tag)+++
```

もう一度 Run してください。正しい JSON からは `Alice` が取り出せ、壊れた JSON は throw でプログラムを落とす代わりに `Failure` という値になります。`parseJson` にカーソルを乗せると、`E` に `UnknownException`(throw された例外を包んだ型)が入っているのも確認できます。
