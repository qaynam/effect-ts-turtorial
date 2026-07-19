import { Effect } from "effect"

interface Item {
  name: string
  price: number
}

const fetchCart = Effect.succeed<Item[]>([
  { name: "キーボード", price: 3000 },
  { name: "ケーブル", price: 300 },
])

const calcTotal = (items: Item[]) =>
  Effect.succeed(items.reduce((sum, item) => sum + item.price, 0))

// yield* が await に相当する。items と total が同じスコープに並ぶ
const program = Effect.gen(function* () {
  const items = yield* fetchCart
  const total = yield* calcTotal(items)
  return `${items.length} 点で合計 ${total} 円`
})

console.log(Effect.runSync(program))
