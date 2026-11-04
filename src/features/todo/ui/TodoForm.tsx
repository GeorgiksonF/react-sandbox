import styles from './TodoForm.module.css'
import { useState } from 'react'
import { z } from 'zod'
import { Field, Input, Textarea, Select } from '../../../shared'
import { PRIORITIES, STATUSES } from '../model/consts'
import { todoFormSchema } from '../model/schema'
import type { Todo, TodoFormData } from '../model/types'

type Props = {
	todo: Todo | null
	formId: string
	onClose: () => void
	onSave: (todo: TodoFormData) => void
}

type FieldErrors = Partial<Record<keyof TodoFormData, string[]>>

function TodoForm({ todo, formId, onSave }: Props) {
	const [title, setTitle] = useState(todo?.title ?? '')
	const [description, setDescription] = useState(todo?.description ?? '')
	const [status, setStatus] = useState(todo?.status ?? null)
	const [priority, setPriority] = useState(todo?.priority ?? null)
	const [errors, setErrors] = useState<FieldErrors>({})

	function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
		e.preventDefault()

		const result = todoFormSchema.safeParse({ title, description, status, priority })

		if (!result.success) {
			setErrors(z.flattenError(result.error).fieldErrors)
			return
		}

		setErrors({})
		onSave(result.data)
	}
	return (
		<form className={styles.form} id={formId} onSubmit={handleSubmit} noValidate>
			<Field error={errors.title?.[0]}>
				<Input
					placeholder="Название"
					value={title}
					onChange={e => setTitle(e.target.value)}
				/>
			</Field>
			<Field error={errors.description?.[0]}>
				<Textarea
					placeholder="Описание"
					value={description}
					onChange={e => setDescription(e.target.value)}
				/>
			</Field>
			<Field error={errors.status?.[0]}>
				<Select
					placeholder="Статус"
					items={STATUSES}
					selected={status}
					onSelect={setStatus}
				/>
			</Field>
			<Field error={errors.priority?.[0]}>
				<Select
					placeholder="Приоритет"
					items={PRIORITIES}
					selected={priority}
					onSelect={setPriority}
				/>
			</Field>
		</form>
	)
}

export default TodoForm
