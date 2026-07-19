const users = new Map<number, string>([
  [1, "ichiro"],
  [2, "hanako"],
])

// TODO: Option<A> 型と some / none を定義して、null をやめよう
const findUser = (id: number): string | null => users.get(id) ?? null

const result1 = findUser(1)
const result2 = findUser(99)

console.log(result1 !== null ? result1 : "見つかりません")
console.log(result2 !== null ? result2 : "見つかりません")
