import { Context, Effect, Layer, ParseResult, Schema } from "effect"

const Coords = Schema.Struct({ latitude: Schema.Number, longitude: Schema.Number })
const GeoResponse = Schema.Struct({ results: Schema.Array(Coords) })
const Current = Schema.Struct({ temperature_2m: Schema.Number, weather_code: Schema.Number })
const WeatherResponse = Schema.Struct({ current: Current })

class Geocoding extends Context.Tag("Geocoding")<Geocoding, {
  readonly search: (city: string) => Effect.Effect<typeof Coords.Type, ParseResult.ParseError>
}>() {}

class Weather extends Context.Tag("Weather")<Weather, {
  readonly current: (
    coords: typeof Coords.Type,
  ) => Effect.Effect<typeof Current.Type, ParseResult.ParseError>
}>() {}

const stubGeoJson: unknown = { results: [{ latitude: 35.69, longitude: 139.69 }] }
const stubWeatherJson: unknown = { current: { temperature_2m: 20, weather_code: 0 } }

const GeocodingStub = Layer.succeed(Geocoding, {
  search: () =>
    Schema.decodeUnknown(GeoResponse)(stubGeoJson).pipe(
      Effect.map((data) => data.results[0]),
    ),
})
const WeatherStub = Layer.succeed(Weather, {
  current: () =>
    Schema.decodeUnknown(WeatherResponse)(stubWeatherJson).pipe(
      Effect.map((data) => data.current),
    ),
})

const program = Effect.gen(function* () {
  const geocoding = yield* Geocoding
  const weather = yield* Weather
  const coords = yield* geocoding.search("Tokyo")
  const current = yield* weather.current(coords)
  console.log(`Tokyo の座標: ${coords.latitude}, ${coords.longitude}`)
  console.log(`気温: ${current.temperature_2m}°C / 天気コード: ${current.weather_code}`)
})

Effect.runPromise(program.pipe(Effect.provide(Layer.merge(GeocodingStub, WeatherStub))))
