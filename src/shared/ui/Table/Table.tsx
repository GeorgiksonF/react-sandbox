import { Children, isValidElement, type ReactNode } from 'react'
import styles from './Table.module.css'

type ColumnProps<T> = {
	id?: string
	field?: keyof T
	title?: string
	render?: (row: T, rowIndex: number) => ReactNode
}

export function Column<T>(_: ColumnProps<T>) {
	return null
}

type TableProps<T> = {
	data: T[]
	children: ReactNode
	rowKey: (row: T, index: number) => string | number
	emptyText?: string
	className?: string
}

function Table<T>({
	data,
	children,
	rowKey,
	emptyText = 'Данные отсутствут',
	className = '',
}: TableProps<T>) {
	const columns = Children.toArray(children).filter(
		(child): child is React.ReactElement<ColumnProps<T>> =>
			isValidElement(child) && child.type === Column,
	)

	if (data.length === 0) {
		;<div>{emptyText}</div>
	}

	return (
		<table className={`${styles.table} ${className}`}>
			<thead>
				<tr>
					{columns.map((col, index) => {
						const columnKey =
							col.props.id ||
							(col.props.field ? String(col.props.field) : `col-${index}`)
						return (
							<th key={columnKey} className={styles.th}>
								{col.props.title}
							</th>
						)
					})}
				</tr>
			</thead>
			<tbody>
				{data.map((row, rowIndex) => (
					<tr key={rowKey(row, rowIndex)} className={styles.tr}>
						{columns.map((col, index) => {
							const { id, field, render } = col.props
							const columnKey = id || (field ? String(field) : `col-${index}`)
							return (
								<td key={columnKey} className={styles.td}>
									{render
										? render(row, rowIndex)
										: field
											? String(row[field] ?? '')
											: ''}
								</td>
							)
						})}
					</tr>
				))}
			</tbody>
		</table>
	)
}

Table.Column = Column
export default Table
