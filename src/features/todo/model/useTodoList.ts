import { useEffect, useState } from 'react'
import type { Priority, Status, Todo, TodoFormData } from './types'
import { todoApi } from '../../../api/todoApi'

type UseTodoListProps = {
	statuses: Status[]
	priorities: Priority[]
}

export function useTodoList({ statuses, priorities }: UseTodoListProps) {
	const [search, setSearch] = useState('')
	const [todos, setTodos] = useState<Todo[]>([])

	useEffect(() => {
		const controller = new AbortController()

		const fetchTodos = async () => {
			try {
				const res = await todoApi.getAll(
					{
						search,
						priorities,
						statuses,
					},
					controller.signal,
				)
				setTodos(res)
			} catch (error) {
				console.error(error)
			}
		}

		const timer = setTimeout(async () => fetchTodos(), search ? 400 : 0)

		return () => {
			controller.abort()
			clearTimeout(timer)
		}
	}, [search, statuses, priorities])

	async function saveTodo(id: string | undefined, data: TodoFormData) {
		if (id) {
			const updated: Todo = {
				id,
				...data,
			}

			await todoApi.update(updated)
			setTodos(prev => prev.map(t => (t.id === updated.id ? updated : t)))
		} else {
			const created: Todo = {
				...data,
				createdAt: new Date().toISOString(),
				id: crypto.randomUUID(),
			}

			await todoApi.create(created)
			setTodos(prev => [...prev, created])
		}
	}

	async function deleteTodo(id: string) {
		await todoApi.delete(id)
		setTodos(prev => prev.filter(todo => todo.id !== id))
	}
	return {
		todos,
		search,
		setSearch,
		saveTodo,
		deleteTodo,
	}
}
