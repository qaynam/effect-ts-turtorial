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

type WeatherRow =
  | {
      readonly _tag: "WeatherRow"
      readonly city: string
      readonly temperature: number
      readonly weatherCode: number
    }
  | { readonly _tag: "MessageRow"; readonly city: string; readonly message: string }

interface WeatherState {
  readonly rows: ReadonlyArray<WeatherRow>
}

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
      getJson(
        client,
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`,
        GeoResponse,
      ).pipe(
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

const fetchCity = (city: string) => Effect.gen(function* () {
  const geocoding = yield* Geocoding
  const weather = yield* Weather
  const coords = yield* geocoding.search(city)
  const current = yield* weather.current(coords)
  return {
    _tag: "WeatherRow" as const,
    city,
    temperature: current.temperature_2m,
    weatherCode: current.weather_code,
  }
}).pipe(
  Effect.catchTags({
    CityNotFoundError: (e) =>
      Effect.succeed({ _tag: "MessageRow" as const, city: e.city, message: "都市が見つかりません" }),
    ApiError: () =>
      Effect.succeed({ _tag: "MessageRow" as const, city, message: "取得に失敗しました" }),
  }),
)

const program = Effect.gen(function* () {
  const rows = yield* Effect.all(
    ["Tokyo", "Osaka", "Sapporo", "Ryugujo"].map(fetchCity),
    { concurrency: 3 },
  )
  return { rows } satisfies WeatherState
})

const renderWeather = (state: WeatherState) => {
  console.log("天気一覧")
  for (const row of state.rows) {
    if (row._tag === "WeatherRow") {
      console.log(`${row.city}: ${row.temperature}°C (天気コード ${row.weatherCode})`)
    } else {
      console.log(`${row.city}: ${row.message}`)
    }
  }
}

const state = await Effect.runPromise(program.pipe(Effect.provide(MainLive)))
renderWeather(state)
