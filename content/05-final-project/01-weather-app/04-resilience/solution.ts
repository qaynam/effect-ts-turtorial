import { FetchHttpClient, HttpClient } from "@effect/platform"
import { Context, Data, Effect, Layer, Schedule, Schema } from "effect"

class ApiError extends Data.TaggedError("ApiError")<{ readonly cause: unknown }> {}
class CityNotFoundError extends Data.TaggedError("CityNotFoundError")<{
  readonly city: string
}> {}

const Coords = Schema.Struct({ latitude: Schema.Number, longitude: Schema.Number })
const GeoResponse = Schema.Struct({ results: Schema.optional(Schema.Array(Coords)) })
const Current = Schema.Struct({ temperature_2m: Schema.Number, weather_code: Schema.Number })
const WeatherResponse = Schema.Struct({ current: Current })

class Geocoding extends Context.Tag("Geocoding")<Geocoding, {
  readonly search: (city: string) => Effect.Effect<typeof Coords.Type, ApiError | CityNotFoundError>
}>() {}

class Weather extends Context.Tag("Weather")<Weather, {
  readonly current: (coords: typeof Coords.Type) => Effect.Effect<typeof Current.Type, ApiError>
}>() {}

const retryPolicy = Schedule.exponential("100 millis").pipe(Schedule.intersect(Schedule.recurs(2)))

const getJson = <A>(client: HttpClient.HttpClient, url: string, schema: Schema.Schema<A>) =>
  client.get(url).pipe(
    Effect.flatMap((response) => response.json),
    Effect.flatMap(Schema.decodeUnknown(schema)),
    Effect.scoped,
    Effect.timeout("3 seconds"),
    Effect.retry(retryPolicy),
    Effect.mapError((cause) => new ApiError({ cause })),
  )

const GeocodingLive = Layer.effect(Geocoding, Effect.gen(function* () {
  const client = yield* HttpClient.HttpClient
  return {
    search: (city: string) =>
      getJson(client, `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`, GeoResponse).pipe(
        Effect.flatMap((data) => {
          const found = data.results?.[0]
          return found === undefined
            ? Effect.fail(new CityNotFoundError({ city }))
            : Effect.succeed(found)
        }),
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
}))

const MainLive = Layer.merge(GeocodingLive, WeatherLive).pipe(Layer.provide(FetchHttpClient.layer))

const program = Effect.gen(function* () {
  const geocoding = yield* Geocoding
  const weather = yield* Weather
  const coords = yield* geocoding.search("Tokyo")
  const current = yield* weather.current(coords)
  console.log(`Tokyo の座標: ${coords.latitude}, ${coords.longitude}`)
  console.log(`気温: ${current.temperature_2m}°C / 天気コード: ${current.weather_code}`)
}).pipe(
  Effect.catchTags({
    CityNotFoundError: (e) => Effect.sync(() => console.log(`都市が見つかりません: ${e.city}`)),
    ApiError: () => Effect.sync(() => console.log("API との通信に失敗しました")),
  }),
)

Effect.runPromise(program.pipe(Effect.provide(MainLive)))
