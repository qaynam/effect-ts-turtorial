import { Effect } from "effect"

const getPrice = Effect.succeed(1200)

const program = getPrice.pipe(
  // tap: 値を変えずに途中を覗く
  Effect.tap((price) => Effect.sync(() => console.log(`税抜: ${price} 円`))),
  // map: 成功値を加工する
  Effect.map((price) => price * 1.1),
  // andThen: 普通の関数なら map、Effect を返す関数なら flatMap として働く
  Effect.andThen((price) => `合計: ${Math.round(price)} 円`),
)

console.log(Effect.runSync(program))
