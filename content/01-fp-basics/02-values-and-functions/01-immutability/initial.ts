type User = { name: string; plan: string }

// 引数の user を直接書き換えてしまっている
function upgrade(user: User): User {
  user.plan = "pro"
  return user
}

const hanako: User = { name: "Hanako", plan: "free" }
const upgraded = upgrade(hanako)

console.log(hanako.plan) // free のはずが…
console.log(upgraded.plan)
