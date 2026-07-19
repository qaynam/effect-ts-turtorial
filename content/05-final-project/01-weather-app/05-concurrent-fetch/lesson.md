---
title: "複数都市の並行取得"
summary: "Effect.all の concurrency で複数都市をまとめて取得する"
timeoutMs: 15000
docs:
  - label: "Basic Concurrency"
    url: "https://effect.website/docs/concurrency/basic-concurrency/"
---

1 都市の天気は取れるようになったので、複数都市を一度に表示できるようにします。順番に取得すると待ち時間は都市数に比例して伸びますが、各都市の取得は互いに独立なので、Part 4 の `Effect.all` に `concurrency` を付けて並行に走らせられます。

もう 1 つ、並行化とセットで決めておくことがあります。1 都市が見つからなかったとき、全体を失敗させるかどうかです。天気の一覧表示なら、失敗した都市だけエラーの行を出して残りは表示するのが自然でしょう。そこでエラー処理を `program` の末尾から「都市 1 件分」の単位へ移し、失敗も 1 行の文字列に変換してしまいます。

## 1 都市分を関数に抽出する

`program` の中身を、都市名を受け取って表示用の 1 行を返す関数にします。`console.log` はやめて文字列を `return` し、エラーもここで文字列に変換します。こうすると `fetchCity` は「決して失敗しない、1 行を作る Effect」になります。

```ts
+++const fetchCity = (city: string) => Effect.gen(function* () {
  const geocoding = yield* Geocoding
  const weather = yield* Weather
  const coords = yield* geocoding.search(city)
  const current = yield* weather.current(coords)
  return `${city}: ${current.temperature_2m}°C (天気コード ${current.weather_code})`
}).pipe(
  Effect.catchTags({
    CityNotFoundError: (e) => Effect.succeed(`${e.city}: 都市が見つかりません`),
    ApiError: () => Effect.succeed(`${city}: 取得に失敗しました`),
  }),
)+++
```

## 並行に集めて表示する

古い `program` を削除し、都市のリストを `fetchCity` で並行に処理する版に置き換えます。

```ts
+++const program = Effect.gen(function* () {
  const lines = yield* Effect.all(
    ["Tokyo", "Osaka", "Sapporo", "Ryugujo"].map(fetchCity),
    { concurrency: 3 },
  )
  for (const line of lines) console.log(line)
})+++
```

`cities.map(fetchCity)` で「1 行を作る Effect」の配列を作り、`Effect.all` が同時に最大 3 件ずつ実行して、結果を元の順序のまま配列で返します。リストに混ぜた Ryugujo(竜宮城)は実在しないので、前レッスンで作った `CityNotFoundError` の経路が一覧の中で生きてきます。

Run すると、3 都市の気温と「Ryugujo: 都市が見つかりません」の 4 行が並びます。並行で取得しても表示順が崩れないことにも注目してください。`concurrency: 3` を `1` に変えると逐次実行になり、体感できる程度に遅くなります。`"unbounded"`(無制限)も試してみましょう。相手の API に負荷をかけすぎない上限を自分で選べるのが `concurrency` オプションの価値です。
