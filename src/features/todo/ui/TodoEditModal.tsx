import { FormProvider } from 'react-hook-form'
import { Modal, Button } from '../../../shared'
import { useTodoForm } from '../model/useTodoForm'
import type { Todo, TodoFormData } from '../model/types'
import TodoForm from './TodoForm'

type Props = {
	todo: Todo | null
	onClose: () => void
	onSave: (todo: TodoFormData) => Promise<void>
}

function TodoEditModal({ todo, onClose, onSave }: Props) {
	const { methods, onSubmit } = useTodoForm(todo, onSave)
	const { isDirty, isValid, isSubmitting } = methods.formState

	return (
		<FormProvider {...methods}>
			<Modal
				title={`${todo ? 'Редактирование' : 'Создание'} задачи`}
				onClose={onClose}
				formProps={{ onSubmit, noValidate: true }}
				footer={
					<>
						<Button type="button" onClick={onClose}>
							Отмена
						</Button>
						<Button type="submit" disabled={!isDirty || !isValid || isSubmitting}>
							{isSubmitting ? 'Сохранение…' : todo ? 'Сохранить' : 'Создать'}
						</Button>
					</>
				}
				width={600}
			>
				<TodoForm />
			</Modal>
		</FormProvider>
	)
}

export default TodoEditModal
