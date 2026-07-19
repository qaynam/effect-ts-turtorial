import { Context, Effect } from "effect"

class Config extends Context.Tag("Config")<
  Config,
  { readonly appName: string; readonly retries: number }
>() {}

const program = Effect.gen(function* () {
  const config = yield* Config
  console.log(`${config.appName} を起動(リトライ ${config.retries} 回)`)
})

// TODO: provideService をやめて、
// 1. Layer.succeed(Config, ...) で ConfigLive を作り、Effect.provide で注入
// 2. Layer.effect(Config, ...) で ConfigV2 を作り、もう一度実行
Effect.runSync(
  Effect.provideService(program, Config, { appName: "MyApp", retries: 3 }),
)
