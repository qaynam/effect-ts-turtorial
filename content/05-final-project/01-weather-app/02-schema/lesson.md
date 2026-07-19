---
title: "レスポンスの Schema"
summary: "API の生 JSON を Schema で検証してから使う"
expectedOutput: |
  Tokyo の座標: 35.69, 139.69
  気温: 20°C / 天気コード: 0
docs:
  - label: "Schema (Introduction)"
    url: "https://effect.website/docs/schema/introduction/"
  - label: "Schema (Basic Usage)"
    url: "https://effect.website/docs/schema/basic-usage/"
---

スタブは今、`Coords` や数値をそのまま返しています。しかし本物の API が返すのは、型の保証がまったくない JSON です。実際のレスポンスはこういう形をしています。

```json
// https://geocoding-api.open-meteo.com/v1/search?name=Tokyo&count=1
{ "results": [{ "name": "Tokyo", "latitude": 35.6895, "longitude": 139.69171, ... }] }

// https://api.open-meteo.com/v1/forecast?latitude=...&current=temperature_2m,weather_code
{ "current": { "time": "...", "temperature_2m": 30.6, "weather_code": 1, ... } }
```

本番に一歩近づけるため、スタブにも「API が返すはずの生の JSON」を `unknown` として持たせ、Schema で検証してから返す形に変えます。こうしておけば、本物へ差し替えるときに変わるのは「JSON をどこから持ってくるか」だけになります。

## レスポンスの形を Schema にする

`interface Coords` を削除し、代わりに上の JSON と対応する Schema を定義しましょう。使うフィールドだけ書けば十分です(余分なフィールドはデコード時に無視されます)。

```ts
~~~interface Coords {
  readonly latitude: number
  readonly longitude: number
}~~~
+++const Coords = Schema.Struct({ latitude: Schema.Number, longitude: Schema.Number })
const GeoResponse = Schema.Struct({ results: Schema.Array(Coords) })
const Current = Schema.Struct({ temperature_2m: Schema.Number, weather_code: Schema.Number })
const WeatherResponse = Schema.Struct({ current: Current })+++
```

## サービスの型を Schema から導出する

TypeScript の型は `typeof Coords.Type` で Schema から取り出せます。手書きの型と Schema の二重管理がなくなり、定義元は Schema 一つになります。あわせて `current` の返り値を、気温だけでなく天気コードも含む `Current` に変えます。デコードは失敗しうるので、エラー型 `ParseResult.ParseError` も宣言に加えます(`ParseResult` の import も忘れずに)。

```ts
class Geocoding extends Context.Tag("Geocoding")<Geocoding, {
  readonly search: (city: string) => Effect.Effect<+++typeof Coords.Type, ParseResult.ParseError+++>
}>() {}

class Weather extends Context.Tag("Weather")<Weather, {
  readonly current: (
    coords: +++typeof Coords.Type+++,
  ) => Effect.Effect<+++typeof Current.Type, ParseResult.ParseError+++>
}>() {}
```

## スタブを「生 JSON + 検証」に差し替える

スタブが固定値を直接返すのをやめ、`unknown` の JSON を `Schema.decodeUnknown` に通してから返します。

```ts
+++const stubGeoJson: unknown = { results: [{ latitude: 35.69, longitude: 139.69 }] }
const stubWeatherJson: unknown = { current: { temperature_2m: 20, weather_code: 0 } }+++

const GeocodingStub = Layer.succeed(Geocoding, {
  search: () =>
    +++Schema.decodeUnknown(GeoResponse)(stubGeoJson).pipe(
      Effect.map((data) => data.results[0]),
    )+++,
})
const WeatherStub = Layer.succeed(Weather, {
  current: () =>
    +++Schema.decodeUnknown(WeatherResponse)(stubWeatherJson).pipe(
      Effect.map((data) => data.current),
    )+++,
})
```

最後に `program` の出力行を、天気コードも表示するよう更新します。

```ts
  console.log(`気温: ${current.temperature_2m}°C+++ / 天気コード: ${current.weather_code}+++`)
```

Run すると座標と気温に加えて天気コードが表示されます。見た目は前レッスンとほぼ同じですが、データは今や「unknown を検証して通ったもの」だけです。試しに `stubWeatherJson` の気温を文字列 `"20"` に変えて Run してみましょう。ParseError が壊れたデータの正確な位置を教えてくれます(確かめたら元に戻しておきましょう)。
