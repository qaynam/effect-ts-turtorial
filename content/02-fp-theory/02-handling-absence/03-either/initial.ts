type Option<A> =
  | { readonly _tag: "Some"; readonly value: A }
  | { readonly _tag: "None" }

const some = <A>(value: A): Option<A> => ({ _tag: "Some", value })
const none: Option<never> = { _tag: "None" }

// TODO: Either<E, A> を定義して、2 つの失敗を区別できるようにしよう
const parseAge = (input: string): Option<number> => {
  const n = Number(input)
  if (Number.isNaN(n)) return none
  if (n < 0) return none
  return some(n)
}

const show = (result: Option<number>): string =>
  result._tag === "Some" ? `年齢は ${result.value} 歳` : "何かが失敗しました(理由は不明)"

console.log(show(parseAge("28")))
console.log(show(parseAge("abc")))
console.log(show(parseAge("-3")))
