import { FetchHttpClient, HttpClient } from "@effect/platform"
import { Effect } from "effect"

// 例: 大阪(34.69, 135.50)の現在気温
const url =
  "https://api.open-meteo.com/v1/forecast?latitude=34.69&longitude=135.50&current=temperature_2m"

const program = Effect.gen(function* () {
  const client = yield* HttpClient.HttpClient
  const response = yield* client.get(url)
  const body = (yield* response.json) as {
    current: { temperature_2m: number }
  }
  console.log(`現在の気温: ${body.current.temperature_2m}°C`)
})

Effect.runPromise(
  program.pipe(Effect.scoped, Effect.provide(FetchHttpClient.layer)),
)
