import type { Todo } from '../features/todo/model/types'
import { api } from './client'

export const todoApi = {
	create: (todo: Todo) => api.post<Todo>('/todos', todo),
	update: (todo: Todo) => api.patch<Todo>(`/todos/${todo.id}`, todo),
	getAll: () => api.get<Todo[]>('/todos'),
	delete: (id: string) => api.delete(`/todos/${id}`),
}
