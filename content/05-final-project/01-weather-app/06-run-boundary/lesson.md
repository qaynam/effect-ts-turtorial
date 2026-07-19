---
title: "実行境界を作る"
summary: "Effect の中核を UI 表示用のデータに変え、runPromise を端に寄せる"
timeoutMs: 15000
docs:
  - label: "Running Effects"
    url: "https://effect.website/docs/getting-started/running-effects/"
---

前のレッスンで、複数都市の天気を並行に取れるようになりました。ただし今の `program` は、データ取得と `console.log` が同じ場所に混ざっています。小さな確認コードならそれで十分ですが、ブラウザアプリに近づけるなら「Effect の中核」と「画面へ反映する境界」を分けます。

今回は `program` が表示用の状態を返すようにし、最後の `runPromise` の外側で描画します。実際の React や Svelte なら、この境界で `setState` やストア更新を呼びます。Effect の外に出る場所を 1 箇所に絞るのが狙いです。

## 表示用の型を作る

文字列を直接返す代わりに、UI が扱いやすい形を作ります。成功した行と、失敗メッセージの行を直和型で表しましょう。

```ts
+++type WeatherRow =
  | {
      readonly _tag: "WeatherRow"
      readonly city: string
      readonly temperature: number
      readonly weatherCode: number
    }
  | { readonly _tag: "MessageRow"; readonly city: string; readonly message: string }

interface WeatherState {
  readonly rows: ReadonlyArray<WeatherRow>
}+++
```

## 1 都市分をデータで返す

`fetchCity` を、表示済みの文字列ではなく `WeatherRow` を返す関数に変えます。失敗も `MessageRow` に畳み込むので、呼び出し側は「行の配列が必ず返る」と考えられます。

```ts
const fetchCity = (city: string) => Effect.gen(function* () {
  const geocoding = yield* Geocoding
  const weather = yield* Weather
  const coords = yield* geocoding.search(city)
  const current = yield* weather.current(coords)
~~~  return `${city}: ${current.temperature_2m}°C (天気コード ${current.weather_code})`~~~
+++  return {
    _tag: "WeatherRow" as const,
    city,
    temperature: current.temperature_2m,
    weatherCode: current.weather_code,
  }+++
}).pipe(
  Effect.catchTags({
~~~    CityNotFoundError: (e) => Effect.succeed(`${e.city}: 都市が見つかりません`),
    ApiError: () => Effect.succeed(`${city}: 取得に失敗しました`),~~~
+++    CityNotFoundError: (e) =>
      Effect.succeed({ _tag: "MessageRow" as const, city: e.city, message: "都市が見つかりません" }),
    ApiError: () =>
      Effect.succeed({ _tag: "MessageRow" as const, city, message: "取得に失敗しました" }),+++
  }),
)
```

## program は状態を返すだけにする

`program` から `console.log` を消し、`WeatherState` を返します。Effect の中核は「必要なデータを作る」ことに集中させます。

```ts
const program = Effect.gen(function* () {
  const lines = yield* Effect.all(
    ["Tokyo", "Osaka", "Sapporo", "Ryugujo"].map(fetchCity),
    { concurrency: 3 },
  )
~~~  for (const line of lines) console.log(line)~~~
+++  return { rows: lines } satisfies WeatherState+++
})
```

## 境界で描画する

最後に、表示用の関数を作って `runPromise` の結果を渡します。ここがアプリと外の世界の境界です。

```ts
+++const renderWeather = (state: WeatherState) => {
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
renderWeather(state)+++
~~~Effect.runPromise(program.pipe(Effect.provide(MainLive)))~~~
```

Run すると出力は前回とほぼ同じですが、責務が変わっています。`program` は API・Schema・retry・並行処理を含む Effect の世界、`renderWeather` は結果を表示する UI の世界です。境界がはっきりすると、表示先を `console.log` から React の `setState` に変えるときも、中核の Effect プログラムをほとんど触らずに済みます。
