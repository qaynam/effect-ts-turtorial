---
title: "エラー設計とリトライ"
summary: "ドメインのエラーに翻訳し、retry と timeout で守る"
timeoutMs: 15000
docs:
  - label: "Retrying"
    url: "https://effect.website/docs/error-management/retrying/"
  - label: "Timing Out"
    url: "https://effect.website/docs/error-management/timing-out/"
  - label: "Expected Errors"
    url: "https://effect.website/docs/error-management/expected-errors/"
---

本番 API をつないだことで、アプリに新しい壊れ方が 2 つ入り込みました。ネットワークは失敗することがありますし、存在しない都市を検索するとレスポンスから `results` キーごと消えます(`{"generationtime_ms": 0.68}` だけが返ってきます)。今はどちらも `HttpClientError` や `ParseError` という「実装の都合の言葉」のままアプリを貫通しています。呼び出し側が知りたいのは「都市が見つからなかった」「API との通信に失敗した」というアプリの言葉です。今回はエラーをそこへ翻訳し、あわせて retry と timeout で一時的な失敗に耐えられるようにします。

## ドメインのエラーを定義する

Part 3 のタグ付きエラーを 2 つ定義し、`results` が無いレスポンスも受け入れられるよう Schema を `Schema.optional` に変えます。

```ts
+++class ApiError extends Data.TaggedError("ApiError")<{ readonly cause: unknown }> {}
class CityNotFoundError extends Data.TaggedError("CityNotFoundError")<{
  readonly city: string
}> {}+++

const GeoResponse = Schema.Struct({ results: +++Schema.optional(+++Schema.Array(Coords)+++)+++ })
```

`Data` と `Schedule` を effect の import に足しておきましょう。

## getJson を retry と timeout で固める

通信はどのエンドポイントでも同じ手当てが要るので、`getJson` にまとめて仕込みます。1 回の試行は 3 秒で打ち切り、失敗したら間隔を 100ms から倍々に延ばしつつ最大 2 回まで再試行(合計 3 回試行)します。`Schedule.intersect` は「両方の条件が続く間だけ」という合成でした。最後に、残ったエラーをすべて `ApiError` に翻訳します。

```ts
+++const retryPolicy = Schedule.exponential("100 millis").pipe(Schedule.intersect(Schedule.recurs(2)))+++

const getJson = <A>(client: HttpClient.HttpClient, url: string, schema: Schema.Schema<A>) =>
  client.get(url).pipe(
    Effect.flatMap((response) => response.json),
    Effect.flatMap(Schema.decodeUnknown(schema)),
    Effect.scoped,
+++    Effect.timeout("3 seconds"),
    Effect.retry(retryPolicy),
    Effect.mapError((cause) => new ApiError({ cause })),+++
  )
```

## 「見つからない」を失敗として返す

`GeocodingLive` の `search` で、結果が空なら `CityNotFoundError` で失敗させます。

```ts
    search: (city: string) =>
      getJson(client, `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`, GeoResponse).pipe(
~~~        Effect.map((data) => data.results[0]),~~~
+++        Effect.flatMap((data) => {
          const found = data.results?.[0]
          return found === undefined
            ? Effect.fail(new CityNotFoundError({ city }))
            : Effect.succeed(found)
        }),+++
      ),
```

サービス宣言のエラー型もアプリの言葉に置き換えます。`search` は `ApiError | CityNotFoundError`、`current` は `ApiError` です。`FetchError` 型と、不要になった `ParseResult` と `HttpClientError` の import は削除しましょう。役目を終えたスタブ 2 つと `MainStub` も、ここで削除して構いません(実プロジェクトならテスト用ファイルに移すところです)。

## 失敗ケースを受け止める

エラーが 2 種類のタグに整理されたので、`program` の末尾で受け止められます。`Effect.catchTags` は複数の `catchTag` を 1 つのオブジェクトにまとめた形です。

```ts
const program = Effect.gen(function* () {
  // ... 変更なし ...
})+++.pipe(
  Effect.catchTags({
    CityNotFoundError: (e) => Effect.sync(() => console.log(`都市が見つかりません: ${e.city}`)),
    ApiError: () => Effect.sync(() => console.log("API との通信に失敗しました")),
  }),
)+++
```

Run して普段どおり気温が出ることを確認したら、`"Tokyo"` を `"Tokyyyo"` に変えてみましょう。前レッスンでは ParseError の長い診断が出ていた場面で、今度は「都市が見つかりません: Tokyyyo」の 1 行になります。エラーの発生源(通信、検証、空の結果)がどれでも、外に出ていくのは自分で設計した 2 種類だけ。これがタグ付きエラーで境界を作るということです。
