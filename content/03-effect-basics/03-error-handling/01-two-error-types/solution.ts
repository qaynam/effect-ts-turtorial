import { Effect } from "effect"

// 期待されるエラー: Effect<never, Error, never> — E に現れる
const expected = Effect.fail(new Error("在庫がありません"))

// 欠陥(defect): Effect<never, never, never> — E は never のまま
const defect = Effect.die(new Error("価格が負の数になっている"))

const exit1 = Effect.runSyncExit(expected)
if (exit1._tag === "Failure") console.log("fail の原因:", exit1.cause._tag)

const exit2 = Effect.runSyncExit(defect)
if (exit2._tag === "Failure") console.log("die の原因:", exit2.cause._tag)

// sync の中の throw は「約束破り」なので、これも欠陥(Die)になる
const boom = Effect.sync(() => {
  throw new Error("うっかり throw してしまった")
})
const exit3 = Effect.runSyncExit(boom)
if (exit3._tag === "Failure") console.log("throw の原因:", exit3.cause._tag)
