type User = { name: string; plan: string }

// plan だけ違う「新しいオブジェクト」を作って返す
function upgrade(user: User): User {
  return { ...user, plan: "pro" }
}

const hanako: User = { name: "Hanako", plan: "free" }
const upgraded = upgrade(hanako)

console.log(hanako.plan) // 元の値はそのまま
console.log(upgraded.plan)
