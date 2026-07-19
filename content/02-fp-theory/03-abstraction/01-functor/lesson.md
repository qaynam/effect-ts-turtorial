---
title: "Functor: map できる箱"
summary: "Array.map と自作 Option.map が同じ形をしている事実に名前を付ける"
expectedOutput: |
  2,4,6
  20
  14
---

ここまでに書いた 2 つの `map` を並べてみます。

```ts
// Array の map(組み込み)
;[1, 2, 3].map(double) // Array<number> → Array<number>

// Option の map(前チャプターで自作)
map(some(10), double)  // Option<number> → Option<number>
```

中身の扱い方はまるで違います。Array は全要素に適用し、Option は Some のときだけ適用します。それでも型シグネチャは同じ形をしています。「`F<A>` と `(a: A) => B` を受け取って `F<B>` を返す」。箱の種類 `F` が Array か Option かが違うだけです。

この形に本当に一般性があるのか、3 つ目の箱で確かめましょう。

## いちばん単純な箱に map を生やす

エディタのコードに、値を 1 つ包むだけの型 `Box` を用意してあります。`mapBox` を実装してください。Some/None の分岐すらない、いちばん単純な `map` です。

```ts
const mapBox = <A, B>(box: Box<A>, f: (a: A) => B): Box<B> =>
+++  ({ value: f(box.value) })+++
```

末尾のコメントアウトを外して Run すると、3 つの箱がそれぞれの流儀で `double` を適用します。

## この形の名前が Functor

「`map` を持つ箱」のことを、FPでは **Functor(ファンクター)** と呼びます。ここまで自分の手で 3 つ書いたとおり、Functor は難解な理論ではなく、**すでに書いたコードたちの共通パターンに付けた名前**です。

- Array: 「複数あるかもしれない」という文脈の中の値を変換する
- Option: 「無いかもしれない」という文脈の中の値を変換する
- Box: 文脈なし。ただ包んであるだけ

共通するのは「箱を開けずに、中身だけを変換できる」ことです。Part 3 で登場する Effect にも `Effect.map` があり、「まだ実行されていない計算」という箱の中身を、同じ形で変換します。Functor という名前を知ったいま、あなたは Effect.map を学ぶ前から、その使い方をすでに知っていることになります。
