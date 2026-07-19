import { Effect } from "effect"

// 期待されるエラー: 起こりうると分かっていて、E チャンネルで扱う
const expected = Effect.fail(new Error("在庫がありません"))

// 欠陥(defect): 起きたらバグ。E には現れない
const defect = Effect.die(new Error("価格が負の数になっている"))

// ↑ 2 つにカーソルを乗せて、E の型の違いを確認しよう

// TODO ①: expected と defect を runSyncExit で実行し、
//          Failure のとき cause._tag を出力して見比べよう
// TODO ②: Effect.sync の中で throw する boom を作り、
//          その cause._tag がどちらになるか観察しよう
