import { Context, Effect, Layer } from "effect"

// 都市名 --(Geocoding)--> 座標 --(Weather)--> 現在の気温
interface Coords {
  readonly latitude: number
  readonly longitude: number
}

class Geocoding extends Context.Tag("Geocoding")<Geocoding, {
  readonly search: (city: string) => Effect.Effect<Coords>
}>() {}

class Weather extends Context.Tag("Weather")<Weather, {
  readonly current: (coords: Coords) => Effect.Effect<number>
}>() {}

const GeocodingStub = Layer.succeed(Geocoding, {
  search: () => Effect.succeed({ latitude: 35.69, longitude: 139.69 }),
})

const WeatherStub = Layer.succeed(Weather, {
  current: () => Effect.succeed(20),
})

const program = Effect.gen(function* () {
  const geocoding = yield* Geocoding
  const weather = yield* Weather
  const coords = yield* geocoding.search("Tokyo")
  const temperature = yield* weather.current(coords)
  console.log(`Tokyo の座標: ${coords.latitude}, ${coords.longitude}`)
  console.log(`気温: ${temperature}°C`)
})

Effect.runPromise(program.pipe(Effect.provide(Layer.merge(GeocodingStub, WeatherStub))))
