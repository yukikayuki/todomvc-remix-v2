import { ActionFunctionArgs, json, LoaderFunctionArgs, MetaFunction, redirect } from '@remix-run/node'
import { addTodo, getTodos, Todo } from '~/store'
import { Form, Link, useFetcher, useLoaderData, useNavigation } from '@remix-run/react'
import { useEffect, useRef, useState } from 'react'

export const meta: MetaFunction = () => {
  return [{ title: 'New Remix App' }, { name: 'description', content: 'Welcome to Remix!' }]
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const body = await request.formData()
  await addTodo(body.get('new-todo') as string)

  return redirect('/')
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const params = new URLSearchParams(new URL(request.url).search)
  const filter = params.get('filter') ?? undefined

  const todos = await getTodos(filter)

  return json({
    todos,
    params: {
      filter,
    },
  })
}

export default function _index() {
  const { todos, params } = useLoaderData<typeof loader>()

  return (
    <div className={'todoapp'}>
      <Header />
      <Main todos={todos} />
      <Footer todos={todos} params={{ filter: params.filter }} />
    </div>
  )
}

const Header = () => {
  // 新規作成のinputのリセット処理群
  // Doc: https://www.youtube.com/watch?v=bMLej7bg5Zo&list=PLXoynULbYuEDG2wBFSZ66b85EIspy3fy6
  // Note: YouTubeはv1の書き方なので、雰囲気を掴むのに使う
  const nav = useNavigation()
  const isNewTodoAdding = nav.state === 'submitting' && nav.formData?.get('_action') === 'new-todo'
  const newTodoFormRef = useRef<HTMLFormElement>(null)
  useEffect(() => {
    if (!isNewTodoAdding) {
      newTodoFormRef.current?.reset()
    }
  }, [isNewTodoAdding])

  return (
    <header className={'header'}>
      <h1>todos</h1>
      <Form className={'input-container'} method={'post'} ref={newTodoFormRef}>
        <input type={'hidden'} name={'_action'} value={'new-todo'} />
        <input
          name={'new-todo'}
          className={'new-todo'}
          type={'text'}
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus
          placeholder={'What needs to be done?'}
        />
      </Form>
    </header>
  )
}

const Main = ({ todos }: { todos: Todo[] }) => {
  return (
    <main className={'main'}>
      <div className={'toggle-all-container'}>
        <Form method={'put'} action={`/all`}>
          <input type={'hidden'} name={'_action'} value={'toggle-all'} />
          <input id={'toggle-all'} className={'toggle-all'} type={'submit'} />
          <label className={'toggle-all-label'} htmlFor={'toggle-all'}>
            Toggle All Input
          </label>
        </Form>
      </div>

      <ul className={'todo-list'}>
        {todos.map((todo) => {
          return <Item todo={todo} key={todo.id} />
        })}
      </ul>
    </main>
  )
}

const Item = ({ todo }: { todo: Todo }) => {
  const fetcher = useFetcher()
  const [isWritable, setIsWritable] = useState(false)

  // 編集フォームのリセット処理群
  const nav = useNavigation()
  const isTodoTitleEditing = nav.state === 'submitting' && nav.formData?.get('_action') === 'edit-title'
  const editTodoFormRef = useRef<HTMLFormElement>(null)
  useEffect(() => {
    if (!isTodoTitleEditing) {
      setIsWritable(false)
      editTodoFormRef.current?.reset()
    }
  }, [isTodoTitleEditing])

  const idForToggleForm = `form-toggle-${todo.id}`

  return (
    <li className={todo.completed ? 'completed' : ''}>
      <div className={'view'}>
        {isWritable && (
          <Form method={'put'} action={`/${todo.id}`} ref={editTodoFormRef}>
            <input type={'hidden'} name={'_action'} value={'edit-title'} />
            <input
              className={'new-todo'}
              type={'text'}
              name={'new-title'}
              defaultValue={todo.title}
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
              onBlur={() => setIsWritable(false)}
            />
          </Form>
        )}
        {!isWritable && (
          <>
            <fetcher.Form id={idForToggleForm}>
              <input type={'hidden'} name={'_action'} value={'toggle-completed'} />
            </fetcher.Form>
            <input
              className={'toggle'}
              type={'checkbox'}
              form={idForToggleForm}
              name={'completed'}
              checked={todo.completed}
              onChange={(ev) =>
                fetcher.submit(new FormData(ev.currentTarget.form!), {
                  method: 'put',
                  action: `/${todo.id}`,
                  encType: 'multipart/form-data',
                })
              }
            />
            <label onDoubleClick={() => setIsWritable(true)}>{todo.title}</label>
            <Form method={'delete'} action={`/${todo.id}`} encType={'multipart/form-data'}>
              <input type={'hidden'} name={'_action'} value={'delete-todo'} />
              <button type={'submit'} className={'destroy'} />
            </Form>
          </>
        )}
      </div>
    </li>
  )
}

const Footer = ({ todos, params }: { todos: Todo[]; params: { filter: string | undefined } }) => {
  const activeTodos = todos.filter((t) => !t.completed)

  return (
    <footer className={'footer'}>
      <span className={'todo-count'}>
        {activeTodos.length} {activeTodos.length > 1 ? 'items' : 'item'} left!
      </span>
      <ul className={'filters'}>
        <li>
          <Link to={'/'} className={params.filter == null ? 'selected' : ''}>
            All
          </Link>
        </li>
        <li>
          <Link to={'/?filter=active'} className={params.filter === 'active' ? 'selected' : ''}>
            Active
          </Link>
        </li>
        <li>
          <Link to={'/?filter=completed'} className={params.filter === 'completed' ? 'selected' : ''}>
            Completed
          </Link>
        </li>
      </ul>
      <Form method={'delete'} action={'/all'}>
        <input type={'hidden'} name={'_action'} value={'clear-completed'} />
        <button className="clear-completed" type={'submit'}>
          Clear completed
        </button>
      </Form>
    </footer>
  )
}
