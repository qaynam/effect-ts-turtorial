---
title: "HttpClient"
summary: "FetchHttpClient で API を叩く"
docs:
  - label: "Platform (Introduction)"
    url: "https://effect.website/docs/platform/introduction/"
  - label: "HttpClient API リファレンス"
    url: "https://effect-ts.github.io/effect/platform/HttpClient.ts.html"
timeoutMs: 15000
---

# HttpClient

いよいよ実際の API を叩いてみましょう。Effect で HTTP リクエストを行うには `@effect/platform` の `HttpClient` を使います。

```ts
import { FetchHttpClient, HttpClient } from "@effect/platform"
import { Effect } from "effect"

const program = Effect.gen(function* () {
  const client = yield* HttpClient.HttpClient
  const response = yield* client.get("https://example.com/api")
  return yield* response.json
})
```

## 読み解いていく

- `yield* HttpClient.HttpClient` : サービス(依存)として HTTP クライアントを**要求**します。この時点で program の `R` に `HttpClient` が入ります
- `client.get(url)` : GET リクエストを行う Effect
- `response.json` : レスポンスボディを JSON として読む Effect

そして実行するときに、**要求された依存を提供**します。

```ts
program.pipe(
  Effect.scoped,                        // レスポンスなどのリソースを後片付け
  Effect.provide(FetchHttpClient.layer) // 「fetch を使う実装」を注入
)
```

`FetchHttpClient.layer` は「ブラウザの `fetch` を使った HttpClient 実装」です。テストのときはここをスタブ実装に差し替えられます — これが `R` 型パラメータと Layer の力で、詳しくは Part 4 の Layer のレッスンで扱ったとおりです。

## 課題

右のコードは [Open-Meteo](https://open-meteo.com/)(無料・API キー不要の天気 API)から東京の現在気温を取得します。

1. まず Run して、東京の気温が表示されることを確認してください
2. 次に `latitude` / `longitude` を自分の好きな都市の座標に変えて実行してみましょう(例: 大阪 34.69 / 135.50、札幌 43.06 / 141.35)
