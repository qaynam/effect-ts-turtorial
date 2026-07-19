---
title: "パターンマッチと網羅性チェック"
summary: "_tag と switch で分岐し、never で「ケースの漏れ」をコンパイルエラーにする"
expectedOutput: |
  314
  25
  12
---

前のレッスンでは `status` フィールドで状態を見分けました。このように、union の各メンバーが共通のフィールドを持ち、その値で見分けられる型を**判別可能ユニオン(discriminated union)**と呼びます。見分けるためのフィールド名は何でもよいのですが、このチュートリアルでは今後 `_tag` で統一します。Part 3 で使う Effect のデータ型が、まさにこの名前を使っているからです。

右のコードには、図形を表す判別可能ユニオン `Shape` と、面積を計算する `area` があります。`switch` 文で `_tag` を分岐すると、各 `case` の中では型が絞り込まれます。`case "Circle":` の中では `shape.radius` に触れる、という具合です。

ただし、いまの `area` には問題があります。`Rectangle` のケースを書き忘れているのに、`default` の `return 0` が受け止めてしまうため、コンパイルも実行も通ってしまうのです。Run すると 3 行目が `0` になっています。

## ケースを追加する

まず、素直に `Rectangle` のケースを足しましょう。

```ts
    case "Square":
      return shape.side * shape.side
+++    case "Rectangle":
      return shape.width * shape.height+++
```

## 漏れをコンパイルエラーにする

書き忘れそのものを機械に見つけさせることもできます。すべての `case` を書き終えたとき、`default` に到達する値は存在しません。TypeScript はこれを「`default` での `shape` の型は `never`(値が存在しない型)」と表現します。そこで `default` を、`never` への代入に書き換えます。

```ts
~~~    default:
      return 0~~~
+++    default: {
      const exhaustive: never = shape
      return exhaustive
    }+++
```

いま全ケースが揃っているので、この代入は成立します。将来 `Shape` に `Triangle` を追加して `case` を書き忘れると、`default` に `Triangle` が流れ込み、「`Triangle` は `never` に代入できない」というコンパイルエラーになります。実行して初めて気づくバグが、**型の追加と同時に**見つかるようになるわけです。

Run して `314`、`25`、`12` が並べば完成です。余裕があれば実際に `Shape` へ `{ readonly _tag: "Triangle"; ... }` を追加して、エディタがどこを赤くするか見てみましょう。
