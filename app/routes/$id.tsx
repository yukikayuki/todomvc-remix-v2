import { ActionFunctionArgs, redirect } from '@remix-run/node'
import invariant from 'tiny-invariant'
import { clearCompleted, deleteTodo, editTodo, getTodo, toggleAll } from '~/store'

export const action = async ({ request, params: { id } }: ActionFunctionArgs) => {
  console.log({ method: request.method })
  const { method } = request
  const body = await request.formData()

  const _action = body.get('_action')
  invariant(_action)
  console.log({ _action })

  if (method === 'PUT' && _action === 'toggle-all') {
    await toggleAll()
  }

  if (method === 'PUT' && _action === 'toggle-completed') {
    const todo = await getTodo(id!)
    invariant(todo)

    const completed = body.get('completed')

    await editTodo(id!, todo.title, completed === 'on')
  }

  if (method === 'PUT' && _action === 'edit-title') {
    const todo = await getTodo(id!)
    invariant(todo)

    const title = body.get('new-title')
    invariant(title)

    await editTodo(id!, title as string, todo.completed)
  }

  if (method === 'DELETE' && _action === 'delete-todo') {
    await deleteTodo(id!)
  }

  if (method === 'DELETE' && _action === 'clear-completed') {
    await clearCompleted()
  }

  return redirect('/')
}
