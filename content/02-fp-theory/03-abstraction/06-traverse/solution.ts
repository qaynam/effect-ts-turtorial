type Option<A> =
  | { readonly _tag: "Some"; readonly value: A }
  | { readonly _tag: "None" }

const some = <A>(value: A): Option<A> => ({ _tag: "Some", value })
const none: Option<never> = { _tag: "None" }

const map = <A, B>(option: Option<A>, f: (a: A) => B): Option<B> =>
  option._tag === "Some" ? some(f(option.value)) : none

const flatMap = <A, B>(option: Option<A>, f: (a: A) => Option<B>): Option<B> =>
  option._tag === "Some" ? f(option.value) : none

// 前レッスンの Applicative。両方 Some なら中身のペア、どちらかが None なら None
const zip = <A, B>(oa: Option<A>, ob: Option<B>): Option<readonly [A, B]> =>
  flatMap(oa, (a) => map(ob, (b) => [a, b] as const))

const parseNumber = (text: string): Option<number> => {
  const n = Number(text)
  return text.trim() === "" || Number.isNaN(n) ? none : some(n)
}

// 空の配列から始めて、zip で 1 つずつ中身を合流させる
const sequenceOption = <A>(options: ReadonlyArray<Option<A>>): Option<ReadonlyArray<A>> =>
  options.reduce<Option<ReadonlyArray<A>>>(
    (acc, option) => map(zip(acc, option), ([values, value]) => [...values, value]),
    some([]),
  )

// map してから sequence する。これが traverse
const traverseOption = <A, B>(
  items: ReadonlyArray<A>,
  f: (a: A) => Option<B>,
): Option<ReadonlyArray<B>> => sequenceOption(items.map(f))

// map しただけでは Option が配列の中に散らばったまま
console.log(["1", "2", "3"].map(parseNumber).length)

const allOk = traverseOption(["1", "2", "3"], parseNumber)
console.log(allOk._tag === "Some" ? allOk.value.join(",") : "None")

const hasBad = traverseOption(["1", "two", "3"], parseNumber)
console.log(hasBad._tag === "Some" ? hasBad.value.join(",") : "None")
