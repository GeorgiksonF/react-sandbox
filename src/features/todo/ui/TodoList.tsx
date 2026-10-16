import styles from './TodoList.module.css'
import { useEffect, useState } from 'react'
import { todoApi } from '../../../api/todoApi'
import { MultiSelect, Button, Input, useModal, useToggleList } from '../../../shared'
import TodoEditModal from './TodoEditModal'
import { STATUSES, PRIORITIES } from '../model/consts'
import type { Priority, Status, Todo, TodoFormData } from '../model/types'
import TodoTable from './TodoTable'

function TodoList() {
	const editModal = useModal<Todo>()
	const [todos, setTodos] = useState<Todo[]>([])
	const statusFilter = useToggleList<Status>()
	const priorityFilter = useToggleList<Priority>()

	const closeEditTodo = () => {
		editModal.close()
	}

	useEffect(() => {
		async function getTodos() {
			const res = await todoApi.getAll()
			setTodos(res)
		}
		getTodos()
	}, [])

	const saveEditTodo = async (data: TodoFormData) => {
		if (editModal.data) {
			const updatedTodo: Todo = {
				...editModal.data,
				...data,
			}

			await todoApi.update(updatedTodo)
			setTodos(prev => prev.map(todo => (todo.id === updatedTodo.id ? updatedTodo : todo)))
		} else {
			const todo: Todo = {
				...data,
				id: crypto.randomUUID(),
			}

			await todoApi.create(todo)
			setTodos(prev => [...prev, todo])
		}

		editModal.close()
	}

	async function deleteTodo(id: string) {
		await todoApi.delete(id)
		setTodos(prev => prev.filter(todo => todo.id !== id))
	}

	return (
		<div>
			<h1>TODO лист</h1>
			<div className={styles.header}>
				<Input type="text" placeholder="Поиск" />

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
