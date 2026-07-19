---
title: "HttpClient"
summary: "HTTP を叩き、レスポンスを Schema で検証する"
timeoutMs: 15000
docs:
  - label: "Platform (Introduction)"
    url: "https://effect.website/docs/platform/introduction/"
  - label: "HttpClient API リファレンス"
    url: "https://effect-ts.github.io/effect/platform/HttpClient.ts.html"
---

Part 4 の道具が全部そろったので、実際の API を叩きます。HTTP リクエストには `@effect/platform` の `HttpClient` を使います。これは Part 4 の冒頭で学んだ**サービス**そのものです。

```ts
const program = Effect.gen(function* () {
  const client = yield* HttpClient.HttpClient  // サービスとして要求(R に入る)
  const response = yield* client.get(url)      // GET リクエスト
  const json = yield* response.json            // ボディを JSON として読む
  // ...
})
```

要求したからには提供が要ります。`FetchHttpClient.layer` が「ブラウザの `fetch` を使う実装」の Layer です。

```ts
Effect.runPromise(
  program.pipe(
    Effect.scoped,                         // レスポンスというリソースを後片付け
    Effect.provide(FetchHttpClient.layer), // fetch 実装を注入
  ),
)
```

`Effect.scoped` も `Effect.provide` も、このパートで学んだ形のままです。テストでは Layer をスタブに差し替えられる、という構図も Layer のレッスンと同じです。

## まず動かす

エディタのコードは [Open-Meteo](https://open-meteo.com/)(無料、API キー不要の天気 API)から東京の現在気温を取得します。まず Run して気温が表示されることを確認してください。

ただし今のコードには 1 か所ごまかしがあります。`response.json` の結果は `unknown` なので、`as` でキャストしています。前のレッスンで「信じます宣言」と呼んだやつです。

## as を Schema に置き換える

レスポンスの形をスキーマで宣言し、キャストを検証に置き換えましょう。

```ts
+++const CurrentWeather = Schema.Struct({
  current: Schema.Struct({ temperature_2m: Schema.Number }),
})+++

const program = Effect.gen(function* () {
  const client = yield* HttpClient.HttpClient
  const response = yield* client.get(url)
~~~  const body = (yield* response.json) as { current: { temperature_2m: number } }~~~
+++  const json = yield* response.json
  const body = yield* Schema.decodeUnknown(CurrentWeather)(json)+++
  console.log(`現在の気温: ${body.current.temperature_2m}°C`)
})
```

見た目の動作は変わりませんが、意味が変わりました。API が仕様変更でフィールド名を変えたら、キャスト版は `undefined` を黙って表示します。Schema 版はその瞬間に `ParseError` で止まり、どこが期待と違うかを報告します。

「要求(R)を Layer で満たし、外部データは Schema で検証し、リソースは Scope で片付ける」。この 3 点セットが Effect アプリの背骨です。Part 5 では、これに retry と並行処理を加えて天気アプリを完成させます。座標(`latitude` / `longitude`)を好きな都市(大阪 34.69 / 135.50、札幌 43.06 / 141.35)に変えて遊んでみてください。
