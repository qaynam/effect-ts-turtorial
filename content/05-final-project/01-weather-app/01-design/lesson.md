---
title: "設計から始める"
summary: "依存を宣言し、スタブで骨組みを動かす"
expectedOutput: |
  Tokyo の座標: 35.69, 139.69
  気温: 20°C
docs:
  - label: "Managing Services"
    url: "https://effect.website/docs/requirements-management/services/"
  - label: "Managing Layers"
    url: "https://effect.website/docs/requirements-management/layers/"
---

ここからは総仕上げです。Part 1〜4 で手に入れた部品(Effect.gen、タグ付きエラー、Service と Layer、Schema、HttpClient)を組み合わせて、都市名から現在の天気を表示するアプリを 6 レッスンかけて作ります。今回から初期コードは「前のレッスンの解答」を引き継ぎます。つまり、自分のアプリを少しずつ育てていく形です。

最初のレッスンでは fetch を 1 行も書きません。先に決めるのは「このアプリは何に依存するか」です。処理は 2 段階に分かれます。都市名から座標を得る**ジオコーディング**と、座標から現在の天気を得る**天気取得**です。この 2 つを Context.Tag のサービスとして宣言すれば、実装がまだなくても、アプリ全体の流れを型付きで書き始められます。

## 2 つのサービスを宣言する

TODO(1) と (2) の位置に、サービスを宣言しましょう。

```ts
+++class Geocoding extends Context.Tag("Geocoding")<Geocoding, {
  readonly search: (city: string) => Effect.Effect<Coords>
}>() {}

class Weather extends Context.Tag("Weather")<Weather, {
  readonly current: (coords: Coords) => Effect.Effect<number>
}>() {}+++
```

`search` は「都市名を渡すと座標を返す Effect」、`current` は「座標を渡すと気温を返す Effect」です。どう取得するか(どの API か、キャッシュするか)は一切書いていません。それは実装側の事情で、利用側が知る必要のない情報だからです。

## スタブ Layer を作る

実装の代わりに、固定値を返すスタブ(仮実装)を TODO(3) に置きます。

```ts
+++const GeocodingStub = Layer.succeed(Geocoding, {
  search: () => Effect.succeed({ latitude: 35.69, longitude: 139.69 }),
})

const WeatherStub = Layer.succeed(Weather, {
  current: () => Effect.succeed(20),
})+++
```

## 流れを組み立てる

最後に、2 つのサービスをつないでアプリの本体を書き、スタブを provide して実行します。

```ts
const program = Effect.gen(function* () {
+++  const geocoding = yield* Geocoding
  const weather = yield* Weather
  const coords = yield* geocoding.search("Tokyo")
  const temperature = yield* weather.current(coords)
  console.log(`Tokyo の座標: ${coords.latitude}, ${coords.longitude}`)
  console.log(`気温: ${temperature}°C`)+++
~~~  console.log("まだ何も実装されていません")~~~
})

Effect.runPromise(program+++.pipe(Effect.provide(Layer.merge(GeocodingStub, WeatherStub)))+++)
```

Run すると、座標と気温の 2 行が表示されます。値は偽物ですが、「都市名 → 座標 → 気温」というアプリの背骨はこれで完成です。依存を先に決めたことで、実装を書く前にアプリの形が決まりました。残りのレッスンでやることは、この骨組みの中身を本物へ差し替えていくことだけです。スタブの気温を変えると出力も変わることを確かめてみましょう。
