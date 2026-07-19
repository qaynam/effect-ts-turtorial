type Option<A> =
  | { readonly _tag: "Some"; readonly value: A }
  | { readonly _tag: "None" }

const some = <A>(value: A): Option<A> => ({ _tag: "Some", value })
const none: Option<never> = { _tag: "None" }

const map = <A, B>(option: Option<A>, f: (a: A) => B): Option<B> =>
  option._tag === "Some" ? some(f(option.value)) : none

// 表示用: Some(5) / None の形の文字列にする
const show = <A>(option: Option<A>): string =>
  option._tag === "Some" ? `Some(${option.value})` : "None"

const id = <A>(a: A): A => a
const f = (n: number) => n + 1
const g = (n: number) => n * 2

// 恒等則: 何もしない関数を map しても、箱は変わらない
console.log(`恒等則: ${show(map(some(5), id))} = ${show(some(5))}`)

// TODO: 合成則を検証しよう
//   map(map(some(5), f), g) と map(some(5), (n) => g(f(n))) を比べる

// TODO: Array でも合成則を検証しよう
//   [1, 2, 3].map(f).map(g) と [1, 2, 3].map((n) => g(f(n))) を比べる
