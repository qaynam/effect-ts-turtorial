import { Context, Effect, Layer } from "effect"

class Config extends Context.Tag("Config")<
  Config,
  { readonly appName: string; readonly retries: number }
>() {}

const program = Effect.gen(function* () {
  const config = yield* Config
  console.log(`${config.appName} を起動(リトライ ${config.retries} 回)`)
})

// できあがった実装をそのまま包む Layer
const ConfigLive = Layer.succeed(Config, { appName: "MyApp", retries: 3 })

// 構築に処理が必要なら Layer.effect
const ConfigV2 = Layer.effect(
  Config,
  Effect.sync(() => {
    // ここで環境変数やファイルを読む、といった処理ができる
    return { appName: "MyApp v2", retries: 5 }
  }),
)

Effect.runSync(Effect.provide(program, ConfigLive))
Effect.runSync(Effect.provide(program, ConfigV2))
