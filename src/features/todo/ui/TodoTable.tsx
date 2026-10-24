import { Dropdown, Table } from '../../../shared'
import { formatDate, type SortState } from '../../../shared/lib'
import { PRIORITY_LABELS, STATUS_LABELS } from '../model/consts'
import type { Todo } from '../model/types'

type Props = {
	todos: Todo[]
	sort?: SortState<Todo> | null
	onSortChange?: (sort: SortState<Todo> | null) => void
	className?: string
	onEdit?: (todo: Todo) => void
	onDelete?: (id: string) => void
}

function TodoTable({ todos, sort, onSortChange, className, onEdit, onDelete }: Props) {
	return (
		<Table
			data={todos}
			rowKey={todo => todo.id}
			sort={sort}
			onSortChange={onSortChange}
			emptyText="Нет активных задач"
			className={className}
		>
			<Table.Column<Todo> field="title" title="Название" sortable />
			<Table.Column<Todo>
				title="Статус"
				field="status"
				render={todo => STATUS_LABELS[todo.status]}
			/>
			<Table.Column<Todo>
				title="Приоритет"
				field="priority"
				render={todo => PRIORITY_LABELS[todo.priority]}
			/>
			<Table.Column<Todo>
				title="Дата создания"
				field="createdAt"
				render={todo => formatDate(todo.createdAt)}
				sortable
			/>
			<Table.Column<Todo>
				id="actions"
				render={todo => {
					const actions = [
						{
							key: 'edit',
							label: 'Редактировать',
							handler: () => onEdit?.(todo),
						},
						{
							key: 'delete',
							label: 'Удалить',
							handler: () => onDelete?.(todo.id),
						},
					]

					return <Dropdown list={actions}>...</Dropdown>
				}}
			/>
		</Table>
	)
}

export default TodoTable
