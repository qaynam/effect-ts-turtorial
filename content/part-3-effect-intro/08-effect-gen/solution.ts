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

// yield* が await に相当する。上から下へ素直に読める
const program = Effect.gen(function* () {
  const items = yield* fetchCart
  const total = yield* calcTotal(items)
  return `合計金額: ${total}`
})

console.log(Effect.runSync(program))
