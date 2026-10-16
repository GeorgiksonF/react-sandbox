import styles from './TodoForm.module.css'
import { useState } from 'react'
import { Input, Textarea, Select } from '../../../shared'
import { PRIORITIES, STATUSES } from '../model/consts'
import type { Todo, TodoFormData } from '../model/types'

type Props = {
	todo: Todo | null
	formId: string
	onClose: () => void
	onSave: (todo: TodoFormData) => void
}

function TodoForm({ todo, formId, onSave }: Props) {
	const [title, setTitle] = useState(todo?.title ?? '')
	const [description, setDescription] = useState(todo?.description ?? '')
	const [status, setStatus] = useState(todo?.status ?? null)
	const [priority, setPriority] = useState(todo?.priority ?? null)

	function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
		e.preventDefault()
		if (priority && status) {
			onSave({
				title,
				description,
				status,
				priority,
			})
		}
	}
	return (
		<form className={styles.form} id={formId} onSubmit={handleSubmit}>
			<Input placeholder="Названиe" value={title} onChange={e => setTitle(e.target.value)} />
			<Textarea
				placeholder="Описание"
				value={description}
				onChange={e => setDescription(e.target.value)}
			/>
			<Select placeholder="Статус" items={STATUSES} selected={status} onSelect={setStatus} />
			<Select
				placeholder="Приоритет"
				items={PRIORITIES}
				selected={priority}
				onSelect={setPriority}
			/>
		</form>
	)
}

export default TodoForm
