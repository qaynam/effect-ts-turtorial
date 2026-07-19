import { pipe, flow } from "effect"

const trim = (s: string) => s.trim()
const toUpperCase = (s: string) => s.toUpperCase()
const addExclamation = (s: string) => s + "!"

// 1. pipe を使って書き換えてみよう
const formatName = (input: string) =>
  addExclamation(toUpperCase(trim(input)))

// 2. flow を使って書いてみよう
const formatNameFlow = (input: string) =>
  addExclamation(toUpperCase(trim(input)))

console.log(formatName("  ichiro  "))
console.log(formatNameFlow("  ichiro  "))
