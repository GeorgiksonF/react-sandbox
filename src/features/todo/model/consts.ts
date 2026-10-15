import type {
    Status,
    Priority
} from './types'

export const STATUSES: { value: string, key: Status }[] = [
    { value: 'Ожидание', key: 'waiting'},
    { value: 'В процессе', key: 'pending'},
    { value: 'Готов', key: 'ready'},
]

export const PRIORITIES: { value: string, key: Priority }[] = [
    { value: 'Низкий', key: 'low'},
    { value: 'Средний', key: 'medium'},
    { value: 'Высокий', key: 'high'},
]
