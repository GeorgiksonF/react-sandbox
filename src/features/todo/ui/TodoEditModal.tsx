import type { Todo, TodoFormData } from '../model/types'
import { Modal, Button } from '../../../shared'
import TodoForm from './TodoForm'

type Props = {
	todo: Todo | null
	onClose: () => void
	onSave: (todo: TodoFormData) => void
}

const FORM_ID = 'todo-edit-form'
function TodoEditModal({ todo, onClose, onSave }: Props) {
	return (
		<Modal
			title={`${todo ? 'Редактирование' : 'Создание'} задачи`}
			onClose={onClose}
			footer={
				<>
					<Button onClick={onClose}>Отмена</Button>
					<Button type="submit" form={FORM_ID}>
						{todo ? 'Сохранить' : 'Создать'}
					</Button>
				</>
			}
			width={600}
		>
			<TodoForm todo={todo} onSave={onSave} onClose={onClose} formId={FORM_ID} />
		</Modal>
	)
}

export default TodoEditModal
