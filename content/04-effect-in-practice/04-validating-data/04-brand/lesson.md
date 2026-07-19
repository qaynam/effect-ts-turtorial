---
title: "Brand で不正な値を作らせない"
summary: "検証済みであることを型に刻む"
docs:
  - label: "Branded Types"
    url: "https://effect.website/docs/code-style/branded-types/"
  - label: "Schema (Branded types)"
    url: "https://effect.website/docs/schema/advanced-usage/"
expectedOutput: |
  送信: taro@example.com
  拒否: @ がありません: taro-example.com
  送信: hanako@example.com
  Schema も拒否しました
---

前のレッスンで検証は完璧になりました。ところが検証を通したあと、その値はただの `string` に戻ります。

```ts
function sendMail(to: string) { /* ... */ }
```

この関数は、検証済みのメールアドレスも、フォームから来たばかりの生の文字列も、`"hello"` も等しく受け取ります。型は「検証したかどうか」を何も覚えていません。結果として、呼び出しのたびに検証し直すか、どこかで忘れて壊れたアドレスに送信するかの二択になります。

Part 2 の ADT は「ありえない**状態**を表現できなくする」道具でした。**Brand(ブランド)** は「検証済みであることを**型**に刻む」道具です。`string` と『検証済みのメールアドレス』を、実行時のコストなしに型レベルで別物にします。

## Email 型を作る

エディタのコードには `Brand.refined` で作った `Email` がすでにあります。`string & Brand.Brand<"Email">` という型は、実行時にはただの string ですが、TypeScript から見ると `string` とは別の型です。この型の値を作る唯一の入り口が `Email(...)` という検証つきコンストラクタです。

まず `sendMail` の引数を書き換えましょう。

```ts
~~~const sendMail = (to: string) => console.log(`送信: ${to}`)~~~
+++const sendMail = (to: Email) => console.log(`送信: ${to}`)+++
```

そのうえで、下のコメントアウトされた行のコメントを外してください。

```ts
sendMail(Email("taro@example.com"))
~~~// sendMail("taro-example.com")~~~
+++sendMail("taro-example.com")+++
```

生の文字列を渡した行に赤い波線が出ます。**`Type 'string' is not assignable to type 'Brand<"Email">'`**。検証を通っていない文字列は、もうこの関数に届きません。確認できたら行を元どおりコメントに戻してください。

## 例外ではなく Either で受ける

`Email("...")` は検証に失敗すると throw します。失敗を値として扱いたいときは `.either` を使います。

```ts
+++const result = Email.either("taro-example.com")
console.log(Either.isLeft(result) ? `拒否: ${result.left[0].message}` : "通過")+++
```

## Schema とつなぐ

外部データは Schema で検証していたのでした。`Schema.brand` を挟むと、その検証結果にそのままブランドが付きます。

```ts
~~~const EmailFromString = Schema.String~~~
+++const EmailFromString = Schema.String.pipe(
  Schema.filter((s) => s.includes("@") || "@ が必要です"),
  Schema.brand("Email"),
)+++
```

`decodeUnknownSync(EmailFromString)(...)` の戻り値が `sendMail` にそのまま渡せることを確かめてください。`Brand.refined` で作った `Email` と、Schema が付けたブランドは同じ `"Email"` なので、同一の型として扱われます。JSON の入り口から `sendMail` の中まで、検証済みという事実が型で運ばれていきます。

設計の原則としてはこうです。**検証は境界で 1 度だけ**。HTTP レスポンスを受け取る場所、フォームを受け付ける場所で Schema と Brand を通し、そこから内側では二度と検証しない。内側の関数が `Email` を要求していれば、検証を忘れたコードはコンパイルが通らないからです。防御的チェックをアプリ中に撒くかわりに、型に見張らせる。これが Part 4 の締めくくりです。`Brand.nominal`(検証なしで、`UserId` と `OrderId` を混同させないだけの用途)も試してみてください。
