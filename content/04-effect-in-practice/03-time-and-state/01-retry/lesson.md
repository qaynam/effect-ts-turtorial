---
title: "retryとSchedule"
summary: "再試行の方針を Schedule という値で表す"
timeoutMs: 10000
docs:
  - label: "Retrying"
    url: "https://effect.website/docs/error-management/retrying/"
expectedOutput: |
  接続を試行(1回目)
  接続を試行(2回目)
  接続を試行(3回目)
  接続成功
---

ネットワークは時々失敗します。多くの場合、少し待ってもう一度試せば成功します。「失敗したら再試行する」を自前の while ループで書くと、回数制限、待ち時間、待ち時間の伸ばし方が全部混ざった読みにくいコードになりがちです。

Effect では**再試行の方針そのもの**を `Schedule`(スケジュール)という値で表し、`Effect.retry(effect, schedule)` に渡します。方針が値なので、名前を付けたり組み合わせたりできます。

- `Schedule.recurs(n)`:最大 n 回まで再試行
- `Schedule.exponential("10 millis")`:待ち時間を 10ms、20ms、40ms... と倍々に伸ばす(exponential backoff)

## 失敗する処理に retry をかける

右のコードの `flakyConnect` は、3 回目の呼び出しで初めて成功します(何回目かは `let` の変数で数えています)。今は 1 回目の失敗で止まってしまうので、retry をかけましょう。

```ts
const program = Effect.gen(function* () {
  const result = yield* ~~~flakyConnect~~~+++Effect.retry(flakyConnect, Schedule.recurs(5))+++
  console.log(result)
})
```

Run すると、2 回失敗して 3 回目で成功する様子がログに出ます。`recurs(5)` は「最大 5 回」の上限であり、成功したらそこで止まります。

## 方針を組み合わせる

実務でよく使うのは「間隔は倍々で伸ばしつつ、回数に上限を設ける」です。2 つの Schedule を `Schedule.intersect` で合成すると、**両方が続行を許す間だけ**再試行が続きます。

```ts
  const result = yield* Effect.retry(
    flakyConnect,
    ~~~Schedule.recurs(5)~~~+++Schedule.intersect(Schedule.exponential("10 millis"), Schedule.recurs(5))+++,
  )
```

出力は同じですが、再試行のたびに少しずつ待つようになりました。`recurs(5)` を `recurs(1)` に減らすと、上限に達して失敗で終わることも確かめられます。
