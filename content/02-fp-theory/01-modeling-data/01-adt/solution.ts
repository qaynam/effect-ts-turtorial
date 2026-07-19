interface User {
  readonly name: string
  readonly age: number
}

// 直和型: 3 つの状態のうち、どれか 1 つだけ
type FetchState =
  | { readonly status: "loading" }
  | { readonly status: "success"; readonly user: User }
  | { readonly status: "failure"; readonly message: string }

const describe = (state: FetchState): string => {
  if (state.status === "loading") return "読み込み中..."
  if (state.status === "success") return `ようこそ、${state.user.name} さん`
  return `エラー: ${state.message}`
}

console.log(describe({ status: "loading" }))
console.log(describe({ status: "success", user: { name: "ichiro", age: 28 } }))
console.log(describe({ status: "failure", message: "接続できません" }))
