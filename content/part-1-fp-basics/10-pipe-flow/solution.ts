import { pipe, flow } from "effect"

const trim = (s: string) => s.trim()
const toUpperCase = (s: string) => s.toUpperCase()
const addExclamation = (s: string) => s + "!"

// 1. pipe: 値を先頭に置き、関数を順に並べる
const formatName = (input: string) =>
  pipe(input, trim, toUpperCase, addExclamation)

// 2. flow: 値を渡さず、関数の合成だけを作る
const formatNameFlow = flow(trim, toUpperCase, addExclamation)

console.log(formatName("  ichiro  "))
console.log(formatNameFlow("  ichiro  "))
