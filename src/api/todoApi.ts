import type { Todo } from '../features/todo/model/types'
import { api } from './client'

export const todoApi = {
    create: (todo: Todo) => api.post<Todo>('/todos', todo),
    getAll: () => api.get<Todo[]>('/todos')
}