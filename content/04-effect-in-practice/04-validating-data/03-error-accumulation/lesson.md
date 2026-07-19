---
title: "エラーを全部集める"
summary: "fail-fast をやめて失敗を蓄積する"
docs:
  - label: "Error Formatters"
    url: "https://effect.website/docs/schema/error-formatters/"
  - label: "Error Accumulation"
    url: "https://effect.website/docs/error-management/error-accumulation/"
expectedOutput: |
  [fail-fast]
  - name: Expected a string at least 1 character(s) long, actual ""
  [errors: all]
  - name: Expected a string at least 1 character(s) long, actual ""
  - age: Expected number, actual "28"
  - email: Expected string, actual 123
  [Effect.all]
  - 名前が不正です
  [Effect.validateAll]
  - 名前が不正です
  - 年齢が不正です
---

ここまでの Effect と Schema は **fail-fast**(最初の失敗で即座に止まる)でした。外部 API を 3 回叩く処理なら、1 回目が落ちた時点で残りを走らせないのが正解です。

でも登録フォームだとどうでしょう。名前も年齢もメールも間違っているのに「名前を入力してください」だけ返して、直して送信したら今度は「年齢が不正です」。ユーザーは何往復もさせられます。ここで欲しいのは **蓄積**、つまり全部走らせて悪い所を全部報告する挙動です。

Part 2 で「flatMap は逐次、zip は合流」と分けた区別が、ここで実務の分かれ道になります。逐次なら前が落ちれば後ろは実行できませんが、独立した計算の合流なら、全部走らせてから失敗をまとめられるからです。

## 既定は 1 件しか出ない

エディタのコードは 3 フィールドすべてが不正なデータを検証します。まず Run してください。`[fail-fast]` の下に `name` の 1 件しか出ません。残り 2 件は検証すらされていません。

## errors: "all" を渡す

`decodeUnknownEither` の第 2 引数でこの挙動を切り替えられます。

```ts
console.log("[fail-fast]")
report(Schema.decodeUnknownEither(Form)(input))
+++console.log("[errors: all]")
report(Schema.decodeUnknownEither(Form, { errors: "all" })(input))+++
```

今度は 3 件すべて出ます。`report` の中で使っている `ParseResult.ArrayFormatter` は、Schema が持つ入れ子のエラーツリーを `{ path, message }` の平らな配列に均してくれる整形器です。フォームの各入力欄の下にメッセージを出したいとき、この形がそのまま使えます。

## Effect でも同じことをする

Schema の外側、つまり普通の Effect の合成にも同じ選択肢があります。`Effect.all` は fail-fast で、Run した結果のとおり最初のエラーで止まります。`Effect.validateAll` は全部走らせて、**エラーを配列で**返します。

```ts
+++console.log("[Effect.validateAll]")
Effect.runSync(
  Effect.validateAll(checks, (c) => c).pipe(
    Effect.catchAll((es) => Effect.sync(() => es.forEach((e) => console.log("- " + e)))),
  ),
)+++
```

同じ `checks` を渡しているのに、`Effect.all` は 1 件、`Effect.validateAll` は 2 件。エラー型も `string` から `string[]` に変わっていることに注目してください。「複数の失敗がありうる」ことが型に出ています。

判断基準はこうです。**検証の対象が互いに独立で、報告先が人間なら蓄積**。フォーム、設定ファイル、CSV の一括取り込みがこれにあたります。逆に**後の処理が前の結果に依存する、あるいは失敗にコストが伴うなら fail-fast**。外部 API の連続呼び出しで 1 本目が落ちているのに残りを投げるのは、無駄な負荷と余計な副作用を生むだけです。既定が fail-fast なのは、そちらが安全側だからです。蓄積は「選んで」使ってください。
