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

// flatMap の連鎖で書かれた処理。
// これを Effect.gen(function* () { ... }) で書き直してみよう
const program = fetchCart.pipe(
  Effect.flatMap((items) =>
    calcTotal(items).pipe(
      Effect.map((total) => `合計金額: ${total}`),
    ),
  ),
)

console.log(Effect.runSync(program))
