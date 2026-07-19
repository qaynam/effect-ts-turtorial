import { Effect, Ref } from "effect"

interface Todo {
  readonly id: number
  readonly title: string
  readonly done: boolean
}

type TodoStore = Ref.Ref<ReadonlyArray<Todo>>

const addTodo = (store: TodoStore, title: string) =>
  Ref.getAndUpdate(store, (todos) => [
    ...todos,
    { id: todos.length + 1, title, done: false },
  ]).pipe(Effect.map((todos) => todos.length + 1))

const toggleTodo = (store: TodoStore, id: number) =>
  Ref.update(store, (todos) =>
    todos.map((todo) => todo.id === id ? { ...todo, done: !todo.done } : todo),
  )

const listTodos = (store: TodoStore) => Ref.get(store)

const program = Effect.gen(function* () {
  const store = yield* Ref.make<ReadonlyArray<Todo>>([])
  yield* addTodo(store, "EffectでAPIを叩く")
  yield* addTodo(store, "Schemaで検証する")

  // TODO: 1 番の TODO を完了済みにし、一覧と残り件数を表示しよう
  const todos = yield* listTodos(store)
  console.log("TODO数:", todos.length)
})

Effect.runSync(program)
