---
title: "Monad 則"
summary: "flatMap が満たす 3 つの法則を検証し、その意味を読む"
expectedOutput: |
  左単位元: Some(6) = Some(6)
  右単位元: Some(5) = Some(5)
  結合則: Some(12) = Some(12)
---

Functor に法則があったように、Monad にも 3 つの法則があります。今回も証明ではなく、自作の `flatMap` と `some` を動かして確かめます。エディタのコードには「Option を返す関数」`f`(+1 して包む)と `g`(×2 して包む)、そして 1 つ目の法則の検証を用意してあります。

- **左単位元**: `flatMap(some(a), f)` は `f(a)` と同じ。値を包んですぐつなぐのは、関数を直接呼ぶのと変わらない
- **右単位元**: `flatMap(m, some)` は `m` と同じ。「包むだけの関数」をつないでも何も起きない
- **結合則**: `flatMap(flatMap(m, f), g)` は `flatMap(m, (a) => flatMap(f(a), g))` と同じ。つなぎ方の括弧の位置は結果に影響しない

## 右単位元を検証する

`some` 自身が「Option を返す関数」なので、そのまま `flatMap` に渡せます。

```ts
+++console.log(`右単位元: ${show(flatMap(some(5), some))} = ${show(some(5))}`)+++
```

## 結合則を検証する

「f とつないでから g とつなぐ」と「先に f と g をつないだものと、つなぐ」を比べます。

```ts
+++const grouped1 = flatMap(flatMap(some(5), f), g)
const grouped2 = flatMap(some(5), (n) => flatMap(f(n), g))
console.log(`結合則: ${show(grouped1)} = ${show(grouped2)}`)+++
```

Run して 3 行とも左右が一致すれば検証完了です。

## 法則が保証してくれること

3 つの法則は、いずれも「書き換えても意味が変わらない」ことの保証書です。単位元の 2 つは、「包む」と「つなぐ」の間に余計な作用が挟まらないこと、つまり `some` で包む操作にはコストも副作用もないことを保証します。結合則はもっと実用的で、連鎖の一部を切り出して名前を付けてよいことを意味します。`flatMap(flatMap(m, f), g)` の後半 2 つを `const fg = (a) => flatMap(f(a), g)` と抽出しても、結果は同じ。長いパイプラインを小さな関数に分割するリファクタリングが、常に安全だということです。

Part 3 以降、Effect の長い `flatMap` の連鎖を分割したり並べ替えたりする場面が何度も出てきます。そのたびに動作確認をしなくて済むのは、この 3 つの法則のおかげです。
