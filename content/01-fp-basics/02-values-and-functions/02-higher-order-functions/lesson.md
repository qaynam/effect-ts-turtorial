---
title: "高階関数"
expectedOutput: |
  2,4,6
  11,12,13
---

前のレッスンではデータを値として丁寧に扱いました。次は、**関数そのものを値として扱う**番です。TypeScript では関数を変数に入れ、引数として渡し、戻り値として返せます。関数を受け取ったり返したりする関数を**高階関数**(higher-order function)と呼びます。

高階関数のうまみは、ループのような「骨組み」と、各要素に「何をするか」を分離できることです。たとえば「全要素を 2 倍する」関数と「全要素に 10 を足す」関数を別々に書くと、配列を走査してコピーを作る骨組みが丸ごと重複します。違うのは 1 行だけです。

```ts
function doubleAll(numbers: number[]): number[] {
  const result: number[] = []
  for (const n of numbers) {
    result.push(n * 2) // ← ここしか違わない
  }
  return result
}
```

## 課題: myMap を完成させる

「何をするか」を関数 `f` として受け取れば、骨組みは 1 つで済みます。右の `myMap` は骨組みだけできていて、まだ `f` を使っていません。各要素に `f` を適用した結果を `result` に入れるように直しましょう。

```ts
function myMap(numbers: number[], f: (n: number) => number): number[] {
  const result: number[] = []
  for (const n of numbers) {
    result.push(~~~n~~~+++f(n)+++)
  }
  return result
}
```

Run すると、**同じ `myMap`** が、渡した関数しだいで「2 倍」にも「10 を足す」にもなることが確認できます。これは標準の `Array.prototype.map` の再発明です。ふだん何気なく使っている `map` や `filter` も、こうして作られた高階関数です。余力があれば `(n) => n * n` など、別の関数も渡してみましょう(試したら元に戻せばクリア判定に戻ります)。
