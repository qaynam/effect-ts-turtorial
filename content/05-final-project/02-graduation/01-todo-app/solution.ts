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

const render = (todos: ReadonlyArray<Todo>) =>
  todos
    .map((todo) => `${todo.done ? "[x]" : "[ ]"} ${todo.id}. ${todo.title}`)
    .join("\n")

const program = Effect.gen(function* () {
  const store = yield* Ref.make<ReadonlyArray<Todo>>([])
  yield* addTodo(store, "EffectでAPIを叩く")
  yield* addTodo(store, "Schemaで検証する")
  yield* toggleTodo(store, 1)

  const todos = yield* listTodos(store)
  console.log(render(todos))
  console.log("残り:", todos.filter((todo) => !todo.done).length)
})

Effect.runSync(program)
