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

// メッセージに items と total の両方が要るので、ネストが避けられない。
// TODO: Effect.gen(function* () { ... }) で上から下へ流れる形に書き直そう
const program = fetchCart.pipe(
  Effect.flatMap((items) =>
    calcTotal(items).pipe(
      Effect.map((total) => `${items.length} 点で合計 ${total} 円`),
    ),
  ),
)

console.log(Effect.runSync(program))
