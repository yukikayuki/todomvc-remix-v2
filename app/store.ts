import { v4 as uuid } from 'uuid'

export type Todo = {
  id: string
  title: string
  completed: boolean
}

let store: Todo[] = []

const setStore = async (todos: Todo[]) => {
  store = todos
}

export const getTodos = async (filter?: string | undefined) => {
  if (filter === 'active') {
    return store.filter((t) => !t.completed)
  }

  if (filter === 'completed') {
    return store.filter((t) => t.completed)
  }

  return store
}

export const getTodo = async (id: string) => {
  const todos = await getTodos()
  return todos.find((t) => t.id === id)
}

export const addTodo = async (title: string) => {
  const id = uuid()
  const newTodo: Todo = {
    id,
    title,
    completed: false,
  }

  await setStore([...store, newTodo])
}

export const editTodo = async (id: string, title: string, completed: boolean) => {
  const todos = await getTodos()
  const newTodos = todos.map((t) => {
    if (t.id === id) {
      return {
        ...t,
        title,
        completed,
      }
    }

    return t
  })

  await setStore(newTodos)
}

export const deleteTodo = async (id: string) => {
  const todos = await getTodos()
  const newTodos = todos.filter((t) => t.id !== id)
  await setStore(newTodos)
}

export const toggleAll = async () => {
  const todos = await getTodos()
  const doesActiveExist = todos.some((t) => !t.completed)

  if (doesActiveExist) {
    const newTodos = todos.map((t) => ({ ...t, completed: true }))
    await setStore(newTodos)
  } else {
    const newTodos = todos.map((t) => ({ ...t, completed: false }))
    await setStore(newTodos)
  }
}

export const clearCompleted = async () => {
  const todos = await getTodos()
  const newTodos = todos.filter((t) => !t.completed)

  await setStore(newTodos)
}
