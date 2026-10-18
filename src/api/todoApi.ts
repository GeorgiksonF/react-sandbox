import type { Priority, Status, Todo } from '../features/todo/model/types'
import { api } from './client'

type GetTodosParams = {
	search?: string
	statuses?: Status[]
	priorities?: Priority[]
}
export const todoApi = {
	create: (todo: Todo) => api.post<Todo>('/todos', todo),
	update: (todo: Todo) => api.patch<Todo>(`/todos/${todo.id}`, todo),
	getAll: (params?: GetTodosParams, signal?: AbortSignal) => {
		const searchParams = new URLSearchParams()
		const where: Record<string, unknown> = {}

		if (params?.search) {
			where.title = { contains: params.search }
		}

		if (params?.statuses && params?.statuses.length > 0) {
			where.status = { in: params.statuses }
		}

		if (params?.priorities && params?.priorities.length > 0) {
			where.priority = { in: params.priorities }
		}

		if (Object.keys(where).length > 0) {
			searchParams.append('_where', JSON.stringify(where))
		}

		console.log(searchParams.values)
		const query = searchParams.toString()
		return api.get<Todo[]>(`/todos${query ? `?${query}` : ''}`, signal)
	},
	delete: (id: string) => api.delete(`/todos/${id}`),
}
