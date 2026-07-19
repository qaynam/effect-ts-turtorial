import { FetchHttpClient, HttpClient } from "@effect/platform"
import { Effect } from "effect"

// Open-Meteo: 無料・API キー不要の天気 API
const url =
  "https://api.open-meteo.com/v1/forecast?latitude=35.68&longitude=139.76&current=temperature_2m"

const program = Effect.gen(function* () {
  const client = yield* HttpClient.HttpClient
  const response = yield* client.get(url)
  // TODO: この as キャストを Schema.decodeUnknown による検証に置き換えよう
  const body = (yield* response.json) as {
    current: { temperature_2m: number }
  }
  console.log(`現在の気温: ${body.current.temperature_2m}°C`)
})

// 要求された HttpClient を fetch 実装で提供して実行する
Effect.runPromise(
  program.pipe(Effect.scoped, Effect.provide(FetchHttpClient.layer)),
)
