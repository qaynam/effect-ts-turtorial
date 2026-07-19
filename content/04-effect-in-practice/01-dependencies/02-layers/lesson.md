---
title: "Layer"
summary: "サービスの「作り方」を値にする"
docs:
  - label: "Managing Layers"
    url: "https://effect.website/docs/requirements-management/layers/"
expectedOutput: |
  MyApp を起動(リトライ 3 回)
  MyApp v2 を起動(リトライ 5 回)
---

前のレッスンでは `Effect.provideService` に実装オブジェクトを直接渡しました。小さなプログラムならこれで十分ですが、実務のサービスは「設定ファイルを読んでから作る」「他のサービスに依存して作る」など、構築自体に手順があります。この**サービスの作り方**を値として表したものが `Layer`(レイヤー)です。

## Layer.succeed

もっとも単純な Layer は、できあがった実装をそのまま包む `Layer.succeed` です。右のコードの `provideService` を書き換えましょう。

```ts
+++const ConfigLive = Layer.succeed(Config, {
  appName: "MyApp",
  retries: 3,
})+++

Effect.runSync(~~~Effect.provideService(program, Config, { appName: "MyApp", retries: 3 })~~~+++Effect.provide(program, ConfigLive)+++)
```

Layer には `ConfigLive` のように「Tag 名 + Live」と名付けるのが Effect の慣習です。注入には `Effect.provide` を使います。

## Layer.effect

構築に処理が必要なら `Layer.effect` を使います。第 2 引数は「実装を作る Effect」です。末尾に追加しましょう。

```ts
+++const ConfigV2 = Layer.effect(
  Config,
  Effect.sync(() => {
    // ここで環境変数やファイルを読む、といった処理ができる
    return { appName: "MyApp v2", retries: 5 }
  }),
)

Effect.runSync(Effect.provide(program, ConfigV2))+++
```

Run すると、同じ `program` が 2 回、違う設定で動きます。`program` は「Config が欲しい」としか言っておらず、**どう作るか**は Layer が全部知っている。この分離が次のレッスンで効いてきます。
