---
title: "Ref"
summary: "可変状態を並行安全な箱に閉じ込める"
timeoutMs: 10000
docs:
  - label: "Ref"
    url: "https://effect.website/docs/state-management/ref/"
expectedOutput: |
  初期値: 0
  1回更新後: 1
  並行1000回更新後: 1001
---

Part 1 でイミュータブル(不変)を学んで以来、状態の変更をずっと避けてきました。しかしカウンター、キャッシュ、進捗表示など、変わっていく値が本当に必要な場面はあります。前のレッスンまでの `let attempts` のような裸の変数は、複数の Fiber が同時に触ると更新が消えるおそれがあり、並行の世界では使えません。

Effect の答えは `Ref`(参照)です。可変状態を専用の箱に閉じ込め、読み書きをすべて Effect として行います。箱の中身の更新はアトミック(不可分)に実行されるので、何本の Fiber が同時に触っても更新が消えません。

## Ref を作って読み書きする

3 つの操作だけ覚えれば使えます。作る、読む、更新する。エディタのコードを完成させましょう。

```ts
const program = Effect.gen(function* () {
+++  const counter = yield* Ref.make(0)
  console.log("初期値:", yield* Ref.get(counter))

  yield* Ref.update(counter, (n) => n + 1)
  console.log("1回更新後:", yield* Ref.get(counter))+++
})
```

`Ref.update` には「現在値から次の値を計算する関数」を渡します。関数そのものは純粋で、変更という作用は Ref が引き受ける。Part 1 の教えとの折り合いがここでついています。

## 並行アクセスで壊れないか

本当にアトミックなのか、1000 本の Fiber で同時に `+1` して確かめましょう。

```ts
+++  yield* Effect.all(
    Array.from({ length: 1000 }, () => Ref.update(counter, (n) => n + 1)),
    { concurrency: "unbounded" },
  )
  console.log("並行1000回更新後:", yield* Ref.get(counter))+++
```

Run してください。きっちり `1001` です。裸の変数への `counter++` を 1000 並行でやったら、JavaScript でも(シングルスレッドとはいえ await を挟むと)取りこぼしが起こりえますが、Ref なら 1 件も失われません。

「状態を持つこと」自体は悪ではありません。**状態が野放しであること**が悪なのです。Ref はその檻です。
