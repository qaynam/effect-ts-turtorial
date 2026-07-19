// 結果が引数だけで決まる純粋な関数。ticketFor(1) はいつでも 101
function ticketFor(customer: number): number {
  return 100 + customer
}

// (1) 式をそのまま 2 回書く
console.log(`直接: ${ticketFor(1)}, ${ticketFor(1)}`)

// (2) 変数に抽出しても意味は変わらない
const ticket = ticketFor(1)
console.log(`抽出: ${ticket}, ${ticket}`)

// (3) 評価結果そのものに置き換えても意味は変わらない = 参照透過
console.log(`置換: ${101}, ${101}`)
