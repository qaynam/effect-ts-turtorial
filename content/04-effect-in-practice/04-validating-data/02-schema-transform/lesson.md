---
title: "filterとtransform"
summary: "検証に制約と変換を組み込む"
docs:
  - label: "Filters"
    url: "https://effect.website/docs/schema/filters/"
  - label: "Transformations"
    url: "https://effect.website/docs/schema/transformations/"
expectedOutput: |
  合計: 2000円
  タグ数: 3
  検証エラー:
  { number | filter }
  └─ Predicate refinement failure
     └─ 0以上の整数が必要です
---

前のレッスンの検証は「number であること」まででした。しかし現実の要件はもう一歩踏み込みます。「0 以上の整数であること」「文字列だが、中身は数値として使いたい」。Schema はこの**制約**と**変換**も検証の一部として書けます。

## filter: 制約を足す

`Schema.filter` は既存のスキーマに条件を重ねます。条件を破ったとき用のメッセージも返せます。

```ts
+++const Quantity = Schema.Number.pipe(
  Schema.filter((n) => (Number.isInteger(n) && n >= 0) || "0以上の整数が必要です"),
)+++
```

## 変換つきスキーマ

クエリパラメータや CSV では、数値が `"1980"` のような文字列で届きます。`Schema.NumberFromString` は「入力は文字列、検証後は number」という**変換つきスキーマ**です。

```ts
+++const price = Schema.decodeUnknownSync(Schema.NumberFromString)("1980")
console.log(`合計: ${price + 20}円`)+++
```

`price + 20` が `2000` になっています。文字列連結の `"198020"` ではなく、本物の number に変換されている証拠です。

## transform: 自分で変換を書く

同じ仕組みを自作するのが `Schema.transform` です。「カンマ区切りの文字列 → 文字列の配列」を作ってみましょう。

```ts
+++const Tags = Schema.transform(Schema.String, Schema.Array(Schema.String), {
  strict: true,
  decode: (s) => s.split(","),
  encode: (tags) => tags.join(","),
})

const tags = Schema.decodeUnknownSync(Tags)("effect,typescript,fp")
console.log("タグ数:", tags.length)+++
```

`decode` が入力方向、`encode` が逆方向(送信やシリアライズで使う)です。双方向を一度に定義するので、読み込みと書き出しで変換がずれる事故を防げます。

最後に、`Quantity` に `-5` を食わせて filter のエラーメッセージを確認しましょう(右のコードの末尾にある try/catch を使います)。自分で書いたメッセージがエラーツリーに埋め込まれて表示されます。
