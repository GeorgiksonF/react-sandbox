import { useState } from 'react'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Priority, Status, Todo, TodoFormData } from './types'
import { useDebouncedValue, type SortState } from '../../../shared/lib'
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
		sort: sort ?? undefined,
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

	async function saveTodo(data: TodoFormData, todo?: Todo | null): Promise<void> {
		setActionError(null)

		const createdAt = todo?.createdAt ?? new Date().toISOString()

		await saveMutation.mutateAsync(todo ? { ...todo, ...data } : { ...data, createdAt })
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
		todos: todosQuery.data ?? [],
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
