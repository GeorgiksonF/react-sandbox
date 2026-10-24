export type Status = 'waiting' | 'pending' | 'ready'
export type Priority = 'low' | 'medium' | 'high'

export interface Todo {
	id: string
	title: string
	description: string
	status: Status
	createdAt: string
	priority: Priority
}

export type TodoFormData = Omit<Todo, 'id' | 'createdAt'>
