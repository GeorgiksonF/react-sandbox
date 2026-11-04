import styles from './TodoForm.module.css'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { z } from 'zod'
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

type FormInput = z.input<typeof todoFormSchema>
type FormOutput = z.output<typeof todoFormSchema>

function TodoForm({ todo, formId, onSave }: Props) {
	const {
		register,
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<FormInput, unknown, FormOutput>({
		resolver: zodResolver(todoFormSchema),
		defaultValues: {
			title: todo?.title ?? '',
			description: todo?.description ?? '',
			status: todo?.status ?? null,
			priority: todo?.priority ?? null,
		},
	})

	return (
		<form
			className={styles.form}
			id={formId}
			onSubmit={handleSubmit(data => onSave(data))}
			noValidate
		>
			<Field error={errors.title?.message}>
				<Input placeholder="Название" {...register('title')} />
			</Field>
			<Field error={errors.description?.message}>
				<Textarea placeholder="Описание" {...register('description')} />
			</Field>
			<Field error={errors.status?.message}>
				<Controller
					control={control}
					name="status"
					render={({ field }) => (
						<Select
							placeholder="Статус"
							items={STATUSES}
							selected={field.value}
							onSelect={field.onChange}
						/>
					)}
				/>
			</Field>
			<Field error={errors.priority?.message}>
				<Controller
					control={control}
					name="priority"
					render={({ field }) => (
						<Select
							placeholder="Приоритет"
							items={PRIORITIES}
							selected={field.value}
							onSelect={field.onChange}
						/>
					)}
				/>
			</Field>
		</form>
	)
}

export default TodoForm
