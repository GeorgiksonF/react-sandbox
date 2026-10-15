import styles from './TodoList.module.css'
import { useEffect, useState } from "react"
import { todoApi } from "../../../api/todoApi"
import { 
    MultiSelect,
    Button,
    Input,
    useModal,
    useToggleList,
    Table
} from "../../../shared"
import TodoEditModal from './TodoEditModal'
import { STATUSES, PRIORITIES, STATUS_LABELS, PRIORITY_LABELS } from "../model/consts"
import type { Priority, Status, Todo } from "../model/types"

function TodoList() {
    const editModal = useModal<Todo>()
    const [ todos, setTodos] = useState<Todo[]>([])
    const statusFilter = useToggleList<Status>()
    const priorityFilter = useToggleList<Priority>()

    const closeEditTodo = () => {
        editModal.close()
    }

    async function getTodos() {
        try {
            const res = await todoApi.getAll()
            setTodos(res)
        } catch (err) {
            throw err
        }
    }

    useEffect(() => {
        getTodos()
    }, [])

    const saveEditTodo = async (todo: Todo) => {
        setTodos(prev => 
            prev.some(t => t.id === todo.id)
                ? prev.map(t => (t.id === todo.id ? todo : t))
                : [...prev, todo]
        )
        await todoApi.create(todo)
        
        editModal.close()
    }

    return <div>
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
        <Table
            data={todos}
            rowKey={todo => todo.id}
            emptyText="Нет активных задач"    
        >
            <Table.Column<Todo> field="title" title="Название" />
            <Table.Column<Todo> 
                title="Статус" 
                render={(todo) => STATUS_LABELS[todo.status]} 
            />
            <Table.Column<Todo> 
                title="Приоритет" 
                render={(todo) => PRIORITY_LABELS[todo.priority]} 
            />
        </Table>
        {
            editModal.isOpen && (
                <TodoEditModal 
                    todo={editModal.data}
                    onClose={closeEditTodo}
                    onSave={saveEditTodo}
                />
            )
        }
    </div>
}

export default TodoList