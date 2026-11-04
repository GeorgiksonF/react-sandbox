import styles from './TodoForm.module.css'
import { Controller, useFormContext } from 'react-hook-form'
import { Field, Input, Textarea, Select } from '../../../shared'
import { PRIORITIES, STATUSES } from '../model/consts'
import type { TodoFormData, TodoFormInput } from '../model/types'

function TodoForm() {
	const {
		register,
		control,
		formState: { errors },
	} = useFormContext<TodoFormInput, unknown, TodoFormData>()

	return (
		<div className={styles.form}>
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
			{errors.root?.message && (
				<p className={styles.formError} role="alert">
					{errors.root.message}
				</p>
			)}
		</div>
	)
}

export default TodoForm
