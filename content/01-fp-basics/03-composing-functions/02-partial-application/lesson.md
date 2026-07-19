---
title: "部分適用"
summary: "引数を先に渡して設定済み関数を作る"
expectedOutput: |
  Hello, Ichiro!
  Hello, Hanako!
  Good morning, Ichiro!
---

前のレッスンの最後に、`addCurried(10)` と途中で止めて `add10` を作りました。カリー化した関数に一部の引数だけを先に渡し、残りを待つ関数を得る。この操作を**部分適用**(partial application)と呼びます。

部分適用のうまみは、汎用の関数から**設定済み関数**を量産できることです。たとえば税込み価格の計算なら、汎用の `taxed` に税率だけ先に渡しておけば、用途別の関数が 1 行ずつ作れます。

```ts
const taxed = (rate: number) => (price: number) => Math.round(price * rate)

const withSalesTax = taxed(1.1)    // 消費税 10% 用
const withReducedTax = taxed(1.08) // 軽減税率 8% 用

withSalesTax(100) // 110
```

税率はもう引数に現れません。使う側は「価格を渡すだけ」の関数として扱えます。

## 課題: 設定済みの挨拶関数を作る

右の `greet` は、挨拶の言葉と名前を 1 つずつ受け取るカリー化済みの関数です。仮実装になっている `sayHello` と `sayGoodMorning` を、`greet` の部分適用で作り直しましょう。

まず `sayHello` です。`greet` に `"Hello"` だけを渡します。

```ts
const sayHello = ~~~(name: string): string => name~~~+++greet("Hello")+++
```

同じように `sayGoodMorning` も作ります。

```ts
const sayGoodMorning = ~~~(name: string): string => name~~~+++greet("Good morning")+++
```

Run すると、挨拶付きの 3 行が表示されます。`sayHello` の実体は「`greeting` が `"Hello"` だと覚えているクロージャ」です。そして `sayHello` も `sayGoodMorning` も、**残りの引数が 1 つの関数**になったことに注目してください。1 引数の関数どうしは数珠つなぎにできます。それが次のレッスン、いよいよ Part 1 の仕上げです。
