import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { todoFormSchema } from './schema'
import type { Todo, TodoFormData, TodoFormInput } from './types'

type SaveHandler = (todo: TodoFormData) => Promise<void>

export function useTodoForm(todo: Todo | null, onSave: SaveHandler) {
	const methods = useForm<TodoFormInput, unknown, TodoFormData>({
		resolver: zodResolver(todoFormSchema),
		mode: 'onChange',
		defaultValues: {
			title: todo?.title ?? '',
			description: todo?.description ?? '',
			status: todo?.status ?? null,
			priority: todo?.priority ?? null,
		},
	})

	const { subscribe, clearErrors, handleSubmit, setError } = methods

	useEffect(() => {
		return subscribe({
			formState: { values: true },
			callback: () => clearErrors('root'),
		})
	}, [subscribe, clearErrors])

	const onSubmit = handleSubmit(async data => {
		clearErrors('root')

		try {
			await onSave(data)
		} catch (err) {
			setError('root', {
				message: err instanceof Error ? err.message : 'Не удалось сохранить задачу',
			})
		}
	})

	return { methods, onSubmit }
}
