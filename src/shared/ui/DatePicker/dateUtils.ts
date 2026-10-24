export const MAX_DIGITS = 8

export const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

export const MONTHS = [
	'Январь',
	'Февраль',
	'Март',
	'Апрель',
	'Май',
	'Июнь',
	'Июль',
	'Август',
	'Сентябрь',
	'Октябрь',
	'Ноябрь',
	'Декабрь',
]

export interface CalendarDay {
	date: Date
	inCurrentMonth: boolean
}

function pad(value: number) {
	return String(value).padStart(2, '0')
}

export function startOfMonth(date: Date) {
	return new Date(date.getFullYear(), date.getMonth(), 1)
}

export function isoFromDate(date: Date) {
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function parseIso(value: string | undefined) {
	if (!value) return null

	const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value)

	if (!match) return null

	const year = Number(match[1])
	const month = Number(match[2])
	const day = Number(match[3])
	const date = new Date(year, month - 1, day)

	if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
		return null
	}

	return date
}

export function formatIso(value: string | undefined) {
	const date = parseIso(value)

	return date ? `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}` : ''
}

export function formatDigits(digits: string) {
	const value = digits.slice(0, MAX_DIGITS)

	if (value.length <= 2) return value
	if (value.length <= 4) return `${value.slice(0, 2)}.${value.slice(2)}`

	return `${value.slice(0, 2)}.${value.slice(2, 4)}.${value.slice(4)}`
}

export function digitsToIso(digits: string) {
	if (digits.length !== MAX_DIGITS) return ''

	const day = Number(digits.slice(0, 2))
	const month = Number(digits.slice(2, 4))
	const year = Number(digits.slice(4, 8))
	const date = new Date(year, month - 1, day)

	if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
		return ''
	}

	return `${digits.slice(4, 8)}-${digits.slice(2, 4)}-${digits.slice(0, 2)}`
}

export function countDigits(value: string) {
	return value.replace(/\D/g, '').length
}

export function caretPosition(digitIndex: number) {
	if (digitIndex <= 2) return digitIndex
	if (digitIndex <= 4) return digitIndex + 1

	return digitIndex + 2
}

export function getCalendarDays(viewDate: Date): CalendarDay[] {
	const year = viewDate.getFullYear()
	const month = viewDate.getMonth()
	const firstDay = new Date(year, month, 1)
	const offset = (firstDay.getDay() + 6) % 7
	const start = new Date(year, month, 1 - offset)

	return Array.from({ length: 42 }, (_, index) => {
		const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + index)

		return { date, inCurrentMonth: date.getMonth() === month }
	})
}
