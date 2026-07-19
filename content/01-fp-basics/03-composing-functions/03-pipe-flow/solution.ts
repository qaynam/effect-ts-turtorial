import { pipe, flow } from "effect"

const trim = (s: string): string => s.trim()
const toUpperCase = (s: string): string => s.toUpperCase()
const addExclamation = (s: string): string => s + "!"

// pipe: 先頭の値を、続く関数に順番に通す
const formatName = (input: string): string =>
  pipe(input, trim, toUpperCase, addExclamation)

// flow: 値を渡さず、関数の合成だけを作る
const formatNameFlow = flow(trim, toUpperCase, addExclamation)

console.log(formatName("  ichiro  "))
console.log(formatNameFlow("  ichiro  "))
