---
title: "match と orElse"
summary: "成功・失敗を畳み込む/失敗したら仕切り直す"
docs:
  - label: "Matching"
    url: "https://effect.website/docs/error-management/matching/"
  - label: "Fallback"
    url: "https://effect.website/docs/error-management/fallback/"
expectedOutput: |
  20 歳ですね
  入力エラー: 数値ではありません: 二十
  フォールバック: 0
---

`catchTag` / `catchAll` は失敗側だけを処理する道具でした。しかし「成功ならこう表示、失敗ならこう表示」のように、**両方の道をひとつの結果にまとめたい**場面も多くあります。Part 2 で `Either` に書いた match(両側の畳み込み)の Effect 版、`Effect.match` の出番です。

## match: 両側を一度に畳み込む

右の `parseAge` を使って、入力を説明文に変える `describe` を完成させましょう。

```ts
const describe = (input: string) =>
  parseAge(input)+++.pipe(
    Effect.match({
      onFailure: (e) => `入力エラー: ${e.message}`,
      onSuccess: (age) => `${age} 歳ですね`,
    }),
  )+++
```

`onFailure` と `onSuccess` の両方を渡すので、結果はどちらに転んでも `string`。ホバーすると `Effect<string, never>`、つまり失敗の可能性ごと畳み込まれています。ハンドラで Effect(ログ出力など)を返したいときは、兄弟分の `Effect.matchEffect` を使います。

## orElse: 失敗したら別の設計図で仕切り直す

畳み込むのではなく、「失敗したら**代わりの Effect** を試す」と言いたいこともあります。デフォルト値へのフォールバック(代替手段への切り替え)は `Effect.orElse` です。

```ts
+++const withDefault = parseAge("abc").pipe(Effect.orElse(() => Effect.succeed(0)))
console.log("フォールバック:", Effect.runSync(withDefault))+++
```

`parseAge("abc")` は失敗しますが、`orElse` が用意した `Effect.succeed(0)` に乗り換えるので、全体としては `0` で成功します。代替側も Effect なので、「まず本番 API、ダメならキャッシュ」のような失敗しうる代替にもそのままつなげます。

Run して 3 行の出力を確認しましょう。これで Part 3 は完走です。`Effect<A, E, R>` の `A` と `E` を、作る・つなぐ・回復するの全部で操れるようになりました。残る `R`(依存)は、次の Part の主役です。
