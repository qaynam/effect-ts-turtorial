---
title: "raceとtimeout"
summary: "速い方を採用し、遅すぎたら打ち切る"
timeoutMs: 10000
docs:
  - label: "Timing Out"
    url: "https://effect.website/docs/error-management/timing-out/"
  - label: "Basic Concurrency"
    url: "https://effect.website/docs/concurrency/basic-concurrency/"
expectedOutput: |
  勝者: ミラー2の応答
  時間切れ: キャッシュを返す
---

「2 つのサーバーに同時に問い合わせて、速く返ってきた方を使う」「3 秒待って応答がなければ諦める」。時間との勝負を素の Promise で書くと、負けた側の処理が裏で走り続けるという厄介な問題が残ります。Fiber は外から中断できるので、Effect ならこの後始末まで面倒を見てくれます。

## race: 速い方が勝つ

`Effect.race` は 2 つの Effect を並行に走らせ、**先に成功した方**の結果を返します。エディタのコードにある 2 つのミラーサーバーを競争させましょう。

```ts
+++  const winner = yield* Effect.race(mirror1, mirror2)
  console.log("勝者:", winner)+++
```

100 ミリ秒で返るミラー 2 が勝ちます。このとき負けたミラー 1 の Fiber は**自動的に中断**されます。走りっぱなしにはなりません。

## timeout: 遅すぎたら打ち切る

`Effect.timeout` は制限時間を過ぎたら処理を中断し、`TimeoutException` で失敗させます。300 ミリ秒かかる `slowApi` に 150 ミリ秒の制限をかけてみます。

```ts
+++  const result = yield* slowApi.pipe(
    Effect.timeout("150 millis"),
    Effect.catchTag("TimeoutException", () =>
      Effect.succeed("時間切れ: キャッシュを返す"),
    ),
  )
  console.log(result)+++
```

時間切れは Part 3 で学んだ**普通の失敗値**として届くので、`catchTag` でフォールバックに切り替えられます。ここではキャッシュ(のつもりの固定値)を返しました。

Run して 2 行の出力を確認したら、timeout を `"500 millis"` に伸ばしてみましょう。今度は `slowApi` が間に合うので、本来の応答が表示されます。
