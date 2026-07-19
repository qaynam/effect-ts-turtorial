---
title: "イミュータビリティ"
expectedOutput: |
  free
  pro
---

前の章で、副作用の中でも特にやっかいなのは「データの書き換え」だと分かりました。この章では、書き換えない側の道具立てを揃えます。データを**イミュータブル**(immutable、不変)に扱うとは、既存の値を変更する代わりに、**変更後の姿をした新しい値を作る**ことです。

配列は、副作用のレッスンでやったように `slice()` でコピーしてから操作できます。**スプレッド構文** `[...]` でも同じことができ、ES2023 以降なら `toSorted` / `toReversed` という「コピーして返す」専用メソッドもあります(エディタで試せます)。

```ts
const sorted = [...scores].sort((a, b) => b - a) // コピーしてからソート
const sorted2 = scores.toSorted((a, b) => b - a) // 1 つのメソッドで同じこと
const reversed = scores.toReversed()             // 逆順のコピー
```

オブジェクトにもスプレッド構文が使えます。`{ ...元, 変えたい部分 }` と書くと、「一部だけ違うコピー」が作れます。

```ts
const user = { name: "Ichiro", age: 20 }
const older = { ...user, age: 21 } // user はそのまま。older は age だけ違う
```

## 課題: 書き換えずにアップグレードする

右の `upgrade` は、引数で受け取った `user` の `plan` を直接書き換えています。Run すると、元の `hanako` まで `pro` になってしまっているのが分かります。

スプレッド構文で「plan だけ違う新しいオブジェクト」を返すように直しましょう。

```ts
function upgrade(user: User): User {
  ~~~user.plan = "pro"
  return user~~~
  +++return { ...user, plan: "pro" }+++
}
```

Run すると、1 行目が `free` に変わります。変更前の `hanako` と変更後の `upgraded` が、**別の値として同時に手元にある**ことに注目してください。書き換えないスタイルでは、変更前後の比較や取り消しがこのように自然にできます。
