---
title: "本番 Layer"
summary: "実 API を叩く Layer を作り、1 行でスタブと切り替える"
timeoutMs: 15000
docs:
  - label: "Platform (Introduction)"
    url: "https://effect.website/docs/platform/introduction/"
  - label: "HttpClient API リファレンス"
    url: "https://effect-ts.github.io/effect/platform/HttpClient.ts.html"
---

アプリの形はスタブで完成しているので、今回はいよいよ本物の API をつなぎます。といっても `program` には一切手を入れません。Open-Meteo を叩く「本番 Layer」をスタブの隣に作り、provide を差し替えるだけです。

どちらのサービスも、やることは「GET する、JSON を読む、Schema で検証する」の 3 手で同じです。まずこれを共通のヘルパーにしましょう。あわせて、通信が加わることでエラーの種類が増える(検証失敗の `ParseError` に通信失敗の `HttpClientError` が加わる)ので、2 つをまとめた型を作ってサービス宣言のエラー型を置き換えます。

```ts
~~~import { Context, Effect, Layer, ParseResult, Schema } from "effect"~~~
+++import { FetchHttpClient, HttpClient, HttpClientError } from "@effect/platform"
import { Context, Effect, Layer, ParseResult, Schema } from "effect"+++
```

```ts
+++type FetchError = ParseResult.ParseError | HttpClientError.HttpClientError

const getJson = <A>(client: HttpClient.HttpClient, url: string, schema: Schema.Schema<A>) =>
  client.get(url).pipe(
    Effect.flatMap((response) => response.json),
    Effect.flatMap(Schema.decodeUnknown(schema)),
    Effect.scoped,
  )+++
```

サービス宣言の `ParseResult.ParseError` を 2 箇所とも `FetchError` に書き換えておきましょう(スタブは失敗しない実装なので、そのままこの宣言を満たします)。

## 本番 Layer を書く

スタブの下に、本物の実装を追加します。`Layer.effect` は「構築時に別のサービスを要求できる Layer」でした。ここでは構築時に `HttpClient` を受け取り、各メソッドはそれを使って `getJson` を呼びます。

```ts
+++const GeocodingLive = Layer.effect(Geocoding, Effect.gen(function* () {
  const client = yield* HttpClient.HttpClient
  return {
    search: (city: string) =>
      getJson(client, `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`, GeoResponse).pipe(
        Effect.map((data) => data.results[0]),
      ),
  }
}))
const WeatherLive = Layer.effect(Weather, Effect.gen(function* () {
  const client = yield* HttpClient.HttpClient
  return {
    current: (coords: typeof Coords.Type) =>
      getJson(
        client,
        `https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude}&longitude=${coords.longitude}&current=temperature_2m,weather_code`,
        WeatherResponse,
      ).pipe(Effect.map((data) => data.current)),
  }
}))+++
```

## 組み立てて切り替える

スタブ側と本番側を、それぞれ 1 つの Layer にまとめます。本番側は `HttpClient` を要求しているので、`FetchHttpClient.layer` を provide して依存を内部で解決しておきます。

```ts
+++const MainStub = Layer.merge(GeocodingStub, WeatherStub)+++
+++const MainLive = Layer.merge(GeocodingLive, WeatherLive).pipe(Layer.provide(FetchHttpClient.layer))+++
```

そして最終行を 1 語だけ書き換えます。

```ts
Effect.runPromise(program.pipe(Effect.provide(~~~Layer.merge(GeocodingStub, WeatherStub)~~~+++MainLive+++)))
```

Run すると、今度は本物の東京の座標と現在の気温が表示されます。`MainLive` を `MainStub` に戻せば、ネットワークなしの固定値にいつでも切り替えられます。`program` から見れば 2 つのサービスは宣言どおりの相手でしかなく、中身がスタブか本物かは provide の 1 行だけの違いです。これが最初のレッスンで依存の宣言から始めた見返りです。

`"Tokyo"` を `"Osaka"` や `"Sapporo"` に変えて Run してみましょう。ついでに `"Tokyyyo"`(存在しない都市)も試してみてください。ParseError で失敗するはずです。この壊れ方の手当てが次のレッスンの主題です。
