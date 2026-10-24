import styles from './TodoList.module.css'
import {
	MultiSelect,
	Button,
	Input,
	useModal,
	useToggleList,
	DatePickerRange,
} from '../../../shared'
import TodoEditModal from './TodoEditModal'
import { STATUSES, PRIORITIES } from '../model/consts'
import type { Priority, Status, Todo, TodoFormData } from '../model/types'
import TodoTable from './TodoTable'
import { useTodoList } from '../model/useTodoList'
import { useState } from 'react'

function TodoList() {
	const editModal = useModal<Todo>()
	const statusFilter = useToggleList<Status>()
	const priorityFilter = useToggleList<Priority>()
	const [createdAtFilter, setCreatedAtFilter] = useState<string[]>([])

	const { todos, saveTodo, deleteTodo, search, setSearch } = useTodoList({
		statuses: statusFilter.items,
		priorities: priorityFilter.items,
		createdAt: createdAtFilter,
	})

	async function saveEditTodo(todo: TodoFormData) {
		await saveTodo(editModal.data?.id, todo)
		editModal.close()
	}
	async function closeEditTodo() {
		editModal.close()
	}

	return (
		<div>
			<h1>TODO лист</h1>
			<div className={styles.header}>
				<Input
					type="text"
					placeholder="Поиск..."
					value={search}
					onChange={e => setSearch(e.target.value)}
				/>

				<Button onClick={() => editModal.open()}>Добавить</Button>
			</div>
			<div className={styles.filters}>
				<MultiSelect
					items={STATUSES}
					selected={statusFilter.items}
					placeholder="Статус"
					onSelect={statusFilter.toggle}
				/>
				<MultiSelect
					items={PRIORITIES}
					selected={priorityFilter.items}
					placeholder="Приоритет"
					onSelect={priorityFilter.toggle}
				/>
				<DatePickerRange value={createdAtFilter} onChange={setCreatedAtFilter} />
			</div>
			<TodoTable
				todos={todos}
				className={styles.table}
				onEdit={editModal.open}
				onDelete={deleteTodo}
			/>
			{editModal.isOpen && (
				<TodoEditModal
					todo={editModal.data}
					onClose={closeEditTodo}
					onSave={saveEditTodo}
				/>
			)}
		</div>
	)
}

export default TodoList
