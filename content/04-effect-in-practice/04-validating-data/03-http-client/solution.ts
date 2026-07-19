import { FetchHttpClient, HttpClient } from "@effect/platform"
import { Effect, Schema } from "effect"

const url =
  "https://api.open-meteo.com/v1/forecast?latitude=35.68&longitude=139.76&current=temperature_2m"

// レスポンスに期待する形。使うフィールドだけ書けばよい
const CurrentWeather = Schema.Struct({
  current: Schema.Struct({ temperature_2m: Schema.Number }),
})

const program = Effect.gen(function* () {
  const client = yield* HttpClient.HttpClient
  const response = yield* client.get(url)
  const json = yield* response.json
  // as キャストの代わりに実行時検証。形が違えば ParseError で止まる
  const body = yield* Schema.decodeUnknown(CurrentWeather)(json)
  console.log(`現在の気温: ${body.current.temperature_2m}°C`)
})

Effect.runPromise(
  program.pipe(Effect.scoped, Effect.provide(FetchHttpClient.layer)),
)
