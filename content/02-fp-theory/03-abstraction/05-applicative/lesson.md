---
title: "Applicative: 独立した計算の合流"
summary: "2 つの Option の中身を組み合わせる zip を作る"
expectedOutput: |
  鈴木 一朗
  鈴木 一朗
  None
---

`flatMap` は「前の結果を使って次を決める」逐次の道具でした。ところが実際には、**互いに無関係な** 2 つの Option を組み合わせたい場面もよくあります。エディタのコードでは、姓と名がそれぞれ `Option<string>` で手に入り、両方揃ったときだけ氏名を作りたい。姓の取得と名の取得に依存関係はありません。

手持ちの道具でも書けます。すでに 1 つ目の氏名は flatMap と map の入れ子で作ってあります。

```ts
const fullName1 = flatMap(familyName, (f) => map(givenName, (g) => `${f} ${g}`))
```

動きはしますが、形が嘘をついています。この入れ子は「姓を取ってから、それを使って名を取る」という逐次処理の形なのに、実際の 2 つは独立だからです。組み合わせる値が 3 つ、4 つと増えると、入れ子もそのぶん深くなります。

## zip: 2 つの箱を 1 つにたたむ

「両方 Some なら中身のペア、どちらかが None なら None」という補助関数を作りましょう。実装には、いま見た入れ子がそのまま使えます。入れ子を書くのはこの関数の中の一度きり、というわけです。

```ts
const zip = <A, B>(oa: Option<A>, ob: Option<B>): Option<readonly [A, B]> =>
+++  flatMap(oa, (a) => map(ob, (b) => [a, b] as const))+++
```

## 平らに書き直す

`zip` を使うと、「組み合わせてから、変換する」という実際の構造どおりに書けます。

```ts
+++const fullName2 = map(zip(familyName, givenName), ([f, g]) => `${f} ${g}`)
console.log(fullName2._tag === "Some" ? fullName2.value : "不明")
console.log(map(zip(familyName, none as Option<string>), ([f, g]) => `${f} ${g}`)._tag)+++
```

Run すると、1 つ目と 2 つ目の氏名は同じ結果になり、3 つ目(名が None)は組み合わせ全体が None になります。

このように「独立した箱たちを合流させる」能力を備えた Functor を **Applicative(アプリカティブ)** と呼びます。逐次の Monad、合流の Applicative、と役割で覚えてください。区別しておく価値は Part 3 で実感できます。独立だと分かっている計算は、Effect なら**並行実行**できるからです(`Effect.all`)。flatMap の形で書いてしまうと「前の結果を待つ」形に縛られますが、合流の形で書いてあれば同時に走らせられます。
