import type { Priority, Status } from './types'
import { PRIORITY_VALUES, STATUS_VALUES } from './schema'

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

export const STATUSES = STATUS_VALUES.map(key => ({ key, value: STATUS_LABELS[key] }))
export const PRIORITIES = PRIORITY_VALUES.map(key => ({ key, value: PRIORITY_LABELS[key] }))
