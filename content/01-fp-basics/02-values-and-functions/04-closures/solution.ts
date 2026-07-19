// count は makeCounter が呼ばれるたびに新しく作られ、
// 返された関数だけがそれを触れる(クロージャ)
function makeCounter() {
  let count = 0
  return () => {
    count = count + 1
    return count
  }
}

const counterA = makeCounter()
const counterB = makeCounter()

console.log(counterA())
console.log(counterA())
console.log(counterA())
console.log(counterB()) // counterA とは独立
