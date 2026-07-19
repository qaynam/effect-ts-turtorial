import { pipe, flow } from "effect"

const trim = (s: string): string => s.trim()
const toUpperCase = (s: string): string => s.toUpperCase()
const addExclamation = (s: string): string => s + "!"

// 1. TODO: pipe を使って「左から右へ」読める形に書き換えよう
const formatName = (input: string): string =>
  addExclamation(toUpperCase(trim(input)))

// 2. TODO: flow を使って、関数の合成だけを先に作ろう
const formatNameFlow = (input: string): string =>
  addExclamation(toUpperCase(trim(input)))

console.log(formatName("  ichiro  "))
console.log(formatNameFlow("  ichiro  "))
