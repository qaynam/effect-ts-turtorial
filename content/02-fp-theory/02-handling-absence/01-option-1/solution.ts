// 「値がある(Some)」または「無い(None)」の直和型
type Option<A> =
  | { readonly _tag: "Some"; readonly value: A }
  | { readonly _tag: "None" }

const some = <A>(value: A): Option<A> => ({ _tag: "Some", value })
const none: Option<never> = { _tag: "None" }

const users = new Map<number, string>([
  [1, "ichiro"],
  [2, "hanako"],
])

const findUser = (id: number): Option<string> => {
  const name = users.get(id)
  return name === undefined ? none : some(name)
}

const result1 = findUser(1)
const result2 = findUser(99)

console.log(result1._tag === "Some" ? result1.value : "見つかりません")
console.log(result2._tag === "Some" ? result2.value : "見つかりません")
