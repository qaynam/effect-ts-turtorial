---
title: "Fiber"
summary: "fork で並行に走らせ、join で合流する"
timeoutMs: 10000
docs:
  - label: "Fibers"
    url: "https://effect.website/docs/concurrency/fibers/"
expectedOutput: |
  メイン: fork した。待たずに先へ進む
  メイン: 別の仕事をしている...
  バックグラウンド: ダウンロード完了
  メイン: 受け取った結果 = 42
---

ここからは並行処理です。Effect のプログラムはすべて **Fiber(ファイバー)** という軽量スレッドの上で動いています。OS のスレッドと違って何万本でも作れるほど軽く、`Effect.runPromise` を呼んだ瞬間にも 1 本の Fiber が起動しています。

今までは 1 本の Fiber で上から順に実行してきました。`Effect.fork` を使うと、ある Effect を**別の Fiber に切り離して**走らせ、自分は待たずに先へ進めます。

## fork する

右のコードの `download` は、完了まで 100 ミリ秒かかる処理です。これを fork してみましょう。

```ts
const program = Effect.gen(function* () {
  const ~~~result = yield* download~~~+++fiber = yield* Effect.fork(download)+++
  console.log("メイン: fork した。待たずに先へ進む")
  console.log("メイン: 別の仕事をしている...")
})
```

`Effect.fork` は即座に `Fiber` を返します。`download` の完了を待ちません。

## join で合流する

切り離しっぱなしでは結果を受け取れません。結果が必要になった時点で `Fiber.join` します。

```ts
  console.log("メイン: 別の仕事をしている...")
+++  const result = yield* Fiber.join(fiber)
  console.log("メイン: 受け取った結果 =", result)+++
})
```

Run して出力の順序を見てください。メインの 2 行が先に出て、その後にバックグラウンドの完了ログ、最後に join で受け取った結果が出ます。fork してから join するまでの間、**2 本の Fiber が同時に生きていた**ことが読み取れます。

`async/await` で言えば、fork は「await せずに Promise を持っておく」、join は「あとで await する」に似ています。違いは、Fiber は `Fiber.interrupt` で外から安全に中断できることです。この性質は、次の次のレッスン(race と timeout)で Effect 自身が活用します。
