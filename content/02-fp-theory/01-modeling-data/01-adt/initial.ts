interface User {
  readonly name: string
  readonly age: number
}

// TODO: フラグの寄せ集めをやめて、3 つの状態の直和型に書き換えよう
interface FetchState {
  readonly isLoading: boolean
  readonly error: string | null
  readonly user: User | null
}

const describe = (state: FetchState): string => {
  if (state.isLoading) return "読み込み中..."
  if (state.user !== null) return `ようこそ、${state.user.name} さん`
  if (state.error !== null) return `エラー: ${state.error}`
  return "???" // どの状態でもない…そんな値が作れてしまう
}

console.log(describe({ isLoading: true, error: null, user: null }))
console.log(describe({ isLoading: false, error: null, user: { name: "ichiro", age: 28 } }))
console.log(describe({ isLoading: false, error: "接続できません", user: null }))
