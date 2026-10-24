export type SortDirection = 'asc' | 'desc'

export type SortState<T> = {
	field: keyof T
	direction: SortDirection
}

function compareValues(a: unknown, b: unknown): number {
	if (a === b) return 0
	if (a == null) return 1
	if (b == null) return -1

	if (typeof a === 'number' && typeof b === 'number') {
		return a - b
	}

	if (typeof a === 'boolean' && typeof b === 'boolean') {
		return Number(a) - Number(b)
	}

	return String(a).localeCompare(String(b), 'ru', {
		numeric: true,
		sensitivity: 'base',
	})
}

export function sortItems<T>(items: T[], sort: SortState<T> | null): T[] {
	if (!sort) return items

	const direction = sort.direction === 'asc' ? 1 : -1

	return [...items].sort(
		(a, b) => compareValues(a[sort.field], b[sort.field]) * direction,
	)
}

export function getNextSort<T>(
	current: SortState<T> | null,
	field: keyof T,
): SortState<T> | null {
	if (!current || current.field !== field) {
		return { field, direction: 'asc' }
	}

	if (current.direction === 'asc') {
		return { field, direction: 'desc' }
	}

	return null
}
