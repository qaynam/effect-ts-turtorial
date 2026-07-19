// 番号を発行するたびに外側の issued を書き換える、不純な関数
let issued = 0
function nextTicket(): number {
  issued = issued + 1
  return issued
}

// (1) 式をそのまま 2 回書く
console.log(`直接: ${nextTicket()}, ${nextTicket()}`)

// (2) 「同じ式なんだから」と変数に抽出する
const ticket = nextTicket()
console.log(`抽出: ${ticket}, ${ticket}`)

// TODO: (1) と (2) は同じ意味のはずなのに、結果が食い違う。
// nextTicket を純粋な関数に直して、どちらも同じ結果にしよう
