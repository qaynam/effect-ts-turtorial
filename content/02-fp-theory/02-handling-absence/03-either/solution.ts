// 「失敗(Left)に理由が入っている」または「成功(Right)に値が入っている」
type Either<E, A> =
  | { readonly _tag: "Left"; readonly left: E }
  | { readonly _tag: "Right"; readonly right: A }

const left = <E>(e: E): Either<E, never> => ({ _tag: "Left", left: e })
const right = <A>(a: A): Either<never, A> => ({ _tag: "Right", right: a })

// どんな失敗があり得るかが、型シグネチャに現れる
const parseAge = (input: string): Either<string, number> => {
  const n = Number(input)
  if (Number.isNaN(n)) return left(`数値ではありません: ${input}`)
  if (n < 0) return left(`負の年齢は不正です: ${n}`)
  return right(n)
}

const show = (result: Either<string, number>): string =>
  result._tag === "Right" ? `年齢は ${result.right} 歳` : `入力エラー: ${result.left}`

console.log(show(parseAge("28")))
console.log(show(parseAge("abc")))
console.log(show(parseAge("-3")))
