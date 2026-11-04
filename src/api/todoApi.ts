import type { Priority, Status, Todo, TodoSortField } from '../features/todo/model/types'
import { todoSchema } from '../features/todo/model/schema'
import type { SortState } from '../shared/lib'
import { api } from './client'

type GetTodosParams = {
	search?: string
	statuses?: Status[]
	priorities?: Priority[]
	createdAt?: string[]
	sort?: SortState<Todo>
}

const SORTABLE_FIELDS = ['title', 'createdAt'] as const satisfies readonly TodoSortField[]

function isSortableField(field: keyof Todo): field is TodoSortField {
	return (SORTABLE_FIELDS as readonly string[]).includes(field)
}

function buildSortParam(sort: SortState<Todo>): string | null {
	if (!isSortableField(sort.field)) {
		return null
	}

	const prefix = sort.direction === 'desc' ? '-' : ''
	const tiebreaker = sort.field === 'createdAt' ? '' : ',-createdAt'

	return `${prefix}${sort.field}${tiebreaker}`
}

export const todoKeys = {
	all: ['todos'] as const,
	list: (params: GetTodosParams) => [...todoKeys.all, 'list', params] as const,
}

export const todoApi = {
	create: (todo: Omit<Todo, 'id'>) => api.post<Todo>('/todos', todo, todoSchema),
	update: (todo: Todo) => api.patch<Todo>(`/todos/${todo.id}`, todo, todoSchema),
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

		if (params?.sort) {
			const sortParam = buildSortParam(params.sort)

			if (sortParam) {
				searchParams.append('_sort', sortParam)
			}
		}

		const query = searchParams.toString()
		return api.get<Todo[]>(`/todos${query ? `?${query}` : ''}`, signal, todoSchema.array())
	},
	delete: (id: string) => api.delete(`/todos/${id}`),
}
