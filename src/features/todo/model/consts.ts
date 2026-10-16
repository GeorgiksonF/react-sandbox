import type { Status, Priority } from './types'

export const STATUSES: { value: string; key: Status }[] = [
	{ value: 'Ожидание', key: 'waiting' },
	{ value: 'В процессе', key: 'pending' },
	{ value: 'Готов', key: 'ready' },
]

export const PRIORITIES: { value: string; key: Priority }[] = [
	{ value: 'Низкий', key: 'low' },
	{ value: 'Средний', key: 'medium' },
	{ value: 'Высокий', key: 'high' },
]

export const STATUS_LABELS: Record<Status, string> = {
	waiting: 'Ожидание',
	pending: 'В процессе',
	ready: 'Готов',
}

export const PRIORITY_LABELS: Record<Priority, string> = {
	low: 'Низкий',
	medium: 'Средний',
	high: 'Высокий',
}
