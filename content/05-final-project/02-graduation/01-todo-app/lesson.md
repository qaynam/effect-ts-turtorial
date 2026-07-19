---
title: "卒業課題: TODOアプリ"
summary: "Effect の道具を組み合わせ、自分で小さなアプリの形を作る"
expectedOutput: |
  [x] 1. EffectでAPIを叩く
  [ ] 2. Schemaで検証する
  残り: 1
docs:
  - label: "Ref"
    url: "https://effect.website/docs/state-management/ref/"
  - label: "Running Effects"
    url: "https://effect.website/docs/getting-started/running-effects/"
---

最後は卒業課題です。ここまでで学んだことを、天気アプリとは別の題材に移してみます。TODO アプリは小さいですが、状態、更新、表示、実行境界がすべて入っています。

まずはコンソール版で十分です。`Ref` に TODO の配列を閉じ込め、追加・完了切り替え・一覧取得を Effect として定義します。あとでブラウザ UI にするときも、ここで作る関数の形はそのまま使えます。

## TODO の型とストアを決める

右のコードにある `Todo` は、「ID、タイトル、完了済みか」を持つデータです。配列を直接 `push` するのではなく、`Ref<ReadonlyArray<Todo>>` に入れて更新します。

```ts
interface Todo {
  readonly id: number
  readonly title: string
  readonly done: boolean
}

+++type TodoStore = Ref.Ref<ReadonlyArray<Todo>>+++
```

## 操作を Effect として作る

TODO を追加する `addTodo` と、完了状態を反転する `toggleTodo` を実装しましょう。どちらも裸の代入ではなく、`Ref` の更新として表します。

```ts
+++const addTodo = (store: TodoStore, title: string) =>
  Ref.getAndUpdate(store, (todos) => [
    ...todos,
    { id: todos.length + 1, title, done: false },
  ]).pipe(Effect.map((todos) => todos.length + 1))

const toggleTodo = (store: TodoStore, id: number) =>
  Ref.update(store, (todos) =>
    todos.map((todo) => todo.id === id ? { ...todo, done: !todo.done } : todo),
  )+++
```

`addTodo` は追加前の配列を受け取り、次の ID を返します。`toggleTodo` は対象の行だけを新しいオブジェクトに差し替えます。配列も TODO も直接は書き換えていません。

## 表示と実行を分ける

一覧取得と表示用の関数を足し、最後に `program` で操作を並べます。

```ts
+++const listTodos = (store: TodoStore) => Ref.get(store)

const render = (todos: ReadonlyArray<Todo>) =>
  todos
    .map((todo) => `${todo.done ? "[x]" : "[ ]"} ${todo.id}. ${todo.title}`)
    .join("\n")+++
```

```ts
const program = Effect.gen(function* () {
  const store = yield* Ref.make<ReadonlyArray<Todo>>([])
+++  yield* addTodo(store, "EffectでAPIを叩く")
  yield* addTodo(store, "Schemaで検証する")
  yield* toggleTodo(store, 1)

  const todos = yield* listTodos(store)
  console.log(render(todos))
  console.log("残り:", todos.filter((todo) => !todo.done).length)+++
})
```

Run して期待どおり 3 行が出たら、このチュートリアルは完走です。次に自分で作るなら、まずはこのコンソール版 TODO をブラウザ UI に移しましょう。入力欄から `addTodo`、チェックボックスから `toggleTodo`、アプリ起動時やボタン押下時に `Effect.runPromise`。それができたら保存先を `localStorage`、HTTP API、あるいは Cloudflare Workers へ差し替えていきます。サービス、Layer、Schema、Ref、実行境界を分けておけば、差し替える場所は自然に小さくなります。
