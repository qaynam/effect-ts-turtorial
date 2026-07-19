---
title: "Layerの合成と差し替え"
summary: "本番とテストを Layer の付け替えで切り替える"
docs:
  - label: "Managing Layers"
    url: "https://effect.website/docs/requirements-management/layers/"
expectedOutput: |
  [log] ユーザーを取得します
  結果: 本番ユーザー1
  [log] ユーザーを取得します
  結果: テストユーザー
---

Layer の本当のうれしさは、**差し替え**にあります。データベースに繋ぐ処理をテストしたいとき、本物の DB を立てる代わりに、決まった値を返すスタブ(偽物の実装)を Layer ごと付け替えればいい。プログラム本体には一切手を入れません。

エディタのコードには 2 つのサービス(`Database` と `Logger`)と、その本番実装があります。`program` は両方を要求するので、型は `Effect<void, never, Database | Logger>` です。`R` には要求したサービスが `|` で積み上がっていきます。

## Layer をまとめる

サービスが 2 つあるなら Layer も 2 つ必要です。エディタのコードでは `Effect.provide` を 2 回並べていますが、`Layer.merge` で先に 1 つの Layer にまとめる方が見通しがよくなります。書き換えましょう。

```ts
+++const MainLive = Layer.merge(DatabaseLive, LoggerLive)+++

Effect.runSync(
  ~~~program.pipe(Effect.provide(DatabaseLive), Effect.provide(LoggerLive))~~~+++Effect.provide(program, MainLive)+++,
)
```

## テスト用スタブに差し替える

次に、DB に繋がずに固定値を返すテスト実装を作り、`Logger` はそのままで `Database` だけ差し替えた構成を用意しましょう。

```ts
+++const DatabaseTest = Layer.succeed(Database, {
  lookup: () => Effect.succeed("テストユーザー"),
})

const MainTest = Layer.merge(DatabaseTest, LoggerLive)

Effect.runSync(Effect.provide(program, MainTest))+++
```

Run すると、同じ `program` が本番構成とテスト構成で 1 回ずつ動きます。2 回目は DB(のふり)に触れず「テストユーザー」が返っています。

アプリが育ってサービスが 10 個になっても、やることは同じです。末端の Layer を差し替えて merge し直すだけで、アプリ全体の配線が切り替わります。依存を型 `R` で宣言し、Layer で配線する。これが Effect 流の依存性注入(Dependency Injection)です。
