---
title: "Effect型とは"
summary: "Effect<A, E, R> = 遅延された計算の設計図"
docs:
  - label: "The Effect Type"
    url: "https://effect.website/docs/getting-started/the-effect-type/"
---

Part 2 では、失敗を値にする `Either` を自作しました。ここからは、その考え方を実務レベルまで引き上げた本命、`Effect` 型に入ります。中心にあるのはたった 1 つの型です。

```ts
Effect<A, E, R>
```

読み方は「**実行すると、成功なら `A` 型の値を返し、失敗なら `E` 型のエラーで落ちる可能性があり、実行には `R` 型の依存が必要な計算の設計図**」。

| 型パラメータ | 意味 | 例 |
| --- | --- | --- |
| `A` (Success) | 成功したときの値の型 | `number`, `User` |
| `E` (Error) | 失敗したときのエラーの型 | `Error`, `never`(失敗しない) |
| `R` (Requirements) | 実行に必要な依存の型 | `Database`, `never`(依存なし) |

自作した `Either` との違いは 1 点だけです。`Either` は計算を**実行し終えた結果**の記録でしたが、Effect は**まだ実行されていない計算そのもの**、つまり設計図です。作っただけでは何も起こらないので、実行する前に加工したり、リトライやタイムアウトを重ねたり、値として自由に合成できます。失敗が型に現れる仕組みは `Either` から、実行を遅らせる発想は Part 1 で学んだ「副作用の隔離」から受け継いでいます。

## 型を観察する

右のコードには 2 つの Effect があります。まず `program1` と `program2` に**マウスカーソルを乗せて**、型の表示を確かめてください。

- `program1` は `Effect<number, never, never>`。「必ず `number` を返し、失敗せず、依存も不要」
- `program2` は `Effect<never, Error, never>`。「成功することがなく、`Error` で失敗する」

次に、3 つめの設計図を追加しましょう。`A` に何が入るか予想してから、ホバーで答え合わせしてください。

```ts
+++const program3 = Effect.succeed("hello")+++
```

確認できたら Run してみましょう。出力されるのは `program1` を実行した結果の `42` だけです。`program2` と `program3` は作っただけなので、何も起こりません。これが「設計図」の意味です。実行の仕方は、この章の残りでじっくり扱います。
