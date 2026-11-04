import { useMemo, useState } from 'react'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Priority, Status, Todo, TodoFormData } from './types'
import { sortItems, useDebouncedValue, type SortState } from '../../../shared/lib'
import { todoApi, todoKeys } from '../../../api/todoApi'

type UseTodoListProps = {
	statuses: Status[]
	priorities: Priority[]
	createdAt: string[]
}

export function useTodoList({ statuses, priorities, createdAt }: UseTodoListProps) {
	const queryClient = useQueryClient()
	const [search, setSearch] = useState('')
	const [sort, setSort] = useState<SortState<Todo> | null>(null)
	const [actionError, setActionError] = useState<string | null>(null)

	const normalizedSearch = search.trim()
	const debouncedSearch = useDebouncedValue(normalizedSearch, normalizedSearch ? 400 : 0)

	const params = {
		search: debouncedSearch || undefined,
		statuses: [...statuses].sort(),
		priorities: [...priorities].sort(),
		createdAt: [...createdAt].sort(),
	}

	const todosQuery = useQuery({
		queryKey: todoKeys.list(params),
		queryFn: ({ signal }) => todoApi.getAll(params, signal),
		placeholderData: keepPreviousData,
	})

	const saveMutation = useMutation({
		mutationFn: (todo: Todo | Omit<Todo, 'id'>) =>
			'id' in todo ? todoApi.update(todo) : todoApi.create(todo),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: todoKeys.all }),
	})

	const deleteMutation = useMutation({
		mutationFn: (id: string) => todoApi.delete(id),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: todoKeys.all }),
	})

	const sortedTodos = useMemo(
		() => sortItems(todosQuery.data ?? [], sort),
		[todosQuery.data, sort],
	)

	async function saveTodo(id: string | undefined, data: TodoFormData): Promise<void> {
		setActionError(null)

		const current = todosQuery.data?.find(todo => todo.id === id)
		const createdAt = current?.createdAt ?? new Date().toISOString()

		await saveMutation.mutateAsync(id ? { id, createdAt, ...data } : { ...data, createdAt })
	}

	async function deleteTodo(id: string) {
		setActionError(null)

		try {
			await deleteMutation.mutateAsync(id)
		} catch (err) {
			setActionError(err instanceof Error ? err.message : 'Не удалось удалить задачу')
		}
	}

	return {
		todos: sortedTodos,
		search,
		setSearch,
		sort,
		setSort,
		saveTodo,
		deleteTodo,
		isLoading: todosQuery.isPending,
		error: todosQuery.error?.message ?? actionError,
	}
}
