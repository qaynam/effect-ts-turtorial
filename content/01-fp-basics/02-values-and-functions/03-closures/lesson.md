---
title: "クロージャ"
summary: "関数が外側の変数を覚える仕組み"
expectedOutput: |
  1
  2
  3
  1
---

前のレッスンでは関数を「受け取る」高階関数を書きました。今度は関数を「返す」側です。返された関数には不思議な性質があります。**自分が作られたときの外側の変数を、ずっと覚えている**のです。この仕組みを**クロージャ**(closure)と呼びます。

```ts
function makeGreeter(greeting: string) {
  return (name: string) => `${greeting}, ${name}!`
}

const hello = makeGreeter("Hello")
hello("Ichiro") // "Hello, Ichiro!"
```

`makeGreeter` の実行はとっくに終わっているのに、返された関数は `greeting` を参照し続けています。関数は「処理」だけでなく、生まれた場所の環境ごと持ち歩く値なのです。

## 課題: カウンタを作る

クロージャが覚えるのは引数だけではありません。関数の中で宣言した変数も覚えます。右の `makeCounter` を、「呼ぶたびに 1 ずつ増えた値を返す関数」を返すように完成させましょう。

まず、`makeCounter` の中に `count` 変数を置きます。ここは返される関数だけが触れる場所です。

```ts
function makeCounter() {
+++  let count = 0+++
  return () => {
```

次に、返す関数が `count` を増やして返すようにします。

```ts
  return () => {
    ~~~return 0~~~
+++    count = count + 1
    return count+++
  }
```

Run すると `counterA` は呼ぶたびに 1、2、3 と進み、`counterB` は 1 から始まります。`makeCounter` を呼ぶたびに**新しい `count` の入った環境**が作られるので、2 つのカウンタは互いに独立です。

返されたカウンタは、呼ぶたびに結果が変わるので純粋関数ではありません。ただし状態 `count` は外から一切触れず、閉じ込められています。副作用の章で学んだ「なくすのではなく、管理する」の一例です。この「環境を覚えた関数を返す」形は、次の章の主役になります。
