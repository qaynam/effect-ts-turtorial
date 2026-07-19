---
title: "Effect型とは"
summary: "Effect<A, E, R> = 遅延された計算の設計図"
docs:
  - label: "The Effect Type"
    url: "https://effect.website/docs/getting-started/the-effect-type/"
---

# Effect 型とは

ここからいよいよ Effect 本体に入ります。

Effect の中心にあるのはたった 1 つの型です。

```ts
Effect<A, E, R>
```

これは「**実行すると、成功なら `A` 型の値を返し、失敗なら `E` 型のエラーで落ちる可能性があり、実行には `R` 型の依存(環境)が必要な計算の設計図**」を表します。

| 型パラメータ | 意味 | 例 |
| --- | --- | --- |
| `A` (Success) | 成功したときの値の型 | `number`, `User` |
| `E` (Error) | 失敗したときのエラーの型 | `HttpError`, `never`(失敗しない) |
| `R` (Requirements) | 実行に必要な依存の型 | `Database`, `never`(依存なし) |

## 「設計図」であることが重要

Part 1 で学んだとおり、副作用を含む処理は**実行した瞬間**に世界を変えてしまいます。Effect はそこで、処理を**すぐ実行せず、「あとで実行できる値」として持ち運ぶ**という発想を取ります。

```ts
const program = Effect.succeed(42)
```

この `program` の型は `Effect<number, never, never>`。「実行すれば必ず 42 を返し、失敗せず、依存も不要」という**説明書き付きの設計図**です。作った時点では、まだ何も起こっていません。

設計図なので、実行する前に `map` で加工したり、リトライを付けたり、タイムアウトを重ねたりと、**値として自由に合成**できます。これが Effect のすべての出発点です。

## 課題

右のコードでは 2 つの Effect を作っています。エディタ上で `program1` と `program2` に**マウスカーソルを乗せて**、型がどう表示されるか確認してください。

- `program1` の `E` はなぜ `never` なのか
- `program2` の `E` には何が入っているか

を確かめたら、そのまま Run してみましょう(実行の仕方は次のレッスンから詳しく学びます)。
