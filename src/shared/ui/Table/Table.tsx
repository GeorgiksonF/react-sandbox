import { Children, isValidElement, type ReactNode } from 'react'
import type { SortDirection, SortState } from '../../lib/sort'
import { getNextSort } from '../../lib/sort'
import styles from './Table.module.css'

type ColumnProps<T> = {
	id?: string
	field?: keyof T
	title?: string
	sortable?: boolean
	render?: (row: T, rowIndex: number) => ReactNode
}

export function Column<T>(_: ColumnProps<T>) {
	return null
}

type TableProps<T> = {
	data: T[]
	children: ReactNode
	rowKey: (row: T, index: number) => string | number
	sort?: SortState<T> | null
	onSortChange?: (sort: SortState<T> | null) => void
	emptyText?: string
	className?: string
}

function getSortIcon(direction: SortDirection | null) {
	if (direction === 'asc') return '▲'
	if (direction === 'desc') return '▼'
	return '⇅'
}

function Table<T>({
	data,
	children,
	rowKey,
	sort = null,
	onSortChange,
	emptyText = 'Данные отсутствут',
	className = '',
}: TableProps<T>) {
	const columns = Children.toArray(children).filter(
		(child): child is React.ReactElement<ColumnProps<T>> =>
			isValidElement(child) && child.type === Column,
	)

	if (data.length === 0) {
		return <div>{emptyText}</div>
	}

	return (
		<table className={`${styles.table} ${className}`}>
			<thead>
				<tr>
					{columns.map((col, index) => {
						const { id, field, title, sortable } = col.props
						const columnKey = id || (field ? String(field) : `col-${index}`)
						const isSortable = Boolean(sortable && field && onSortChange)
						const isActive = Boolean(field && sort?.field === field)
						const ariaSort = isSortable
							? isActive
								? sort?.direction === 'asc'
									? 'ascending'
									: 'descending'
								: 'none'
							: undefined

						return (
							<th key={columnKey} className={styles.th} aria-sort={ariaSort}>
								{isSortable && field ? (
									<button
										type="button"
										className={styles.sortButton}
										onClick={() => onSortChange?.(getNextSort(sort, field))}
										aria-label={`Сортировать по «${title ?? String(field)}»`}
									>
										<span>{title}</span>
										<span
											className={`${styles.sortIcon} ${
												isActive ? styles.sortIconActive : ''
											}`}
											aria-hidden="true"
										>
											{getSortIcon(isActive ? (sort?.direction ?? null) : null)}
										</span>
									</button>
								) : (
									title
								)}
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
