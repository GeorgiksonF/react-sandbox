export type SortDirection = 'asc' | 'desc'

export type SortState<T> = {
	field: keyof T
	direction: SortDirection
}

export function getNextSort<T>(current: SortState<T> | null, field: keyof T): SortState<T> | null {
	if (!current || current.field !== field) {
		return { field, direction: 'asc' }
	}

	if (current.direction === 'asc') {
		return { field, direction: 'desc' }
	}

	return null
}
