import type { Priority, Status, Todo } from '../features/todo/model/types'
import { api } from './client'

type GetTodosParams = {
	search?: string
	statuses?: Status[]
	priorities?: Priority[]
	createdAt?: string[]
}

/**
 * Ключи кэша TanStack Query.
 * `all` — префикс всех запросов списка (для инвалидации),
 * `list` — конкретный набор фильтров.
 */
export const todoKeys = {
	all: ['todos'] as const,
	list: (params: GetTodosParams) => [...todoKeys.all, 'list', params] as const,
}

export const todoApi = {
	create: (todo: Omit<Todo, 'id'>) => api.post<Todo>('/todos', todo),
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

		if (params?.createdAt && params.createdAt.length > 0) {
			const [from, to = from] = params.createdAt
			const start = new Date(`${from}T00:00:00.000`)
			const end = new Date(`${to}T23:59:59.999`)

			where.createdAt = {
				gte: start.toISOString(),
				lte: end.toISOString(),
			}
		}

		if (Object.keys(where).length > 0) {
			searchParams.append('_where', JSON.stringify(where))
		}

		const query = searchParams.toString()
		return api.get<Todo[]>(`/todos${query ? `?${query}` : ''}`, signal)
	},
	delete: (id: string) => api.delete(`/todos/${id}`),
}
