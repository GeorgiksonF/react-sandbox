function pad(value: number) {
	return String(value).padStart(2, '0')
}

/**
 * Форматирует дату в dd.mm.yyyy по локальному времени.
 * Для строк без времени (YYYY-MM-DD) использует календарную дату как есть.
 */
export function formatDate(value: string | Date | null | undefined): string {
	if (!value) return ''

	const date =
		value instanceof Date
			? value
			: /^\d{4}-\d{2}-\d{2}$/.test(value)
				? new Date(
						Number(value.slice(0, 4)),
						Number(value.slice(5, 7)) - 1,
						Number(value.slice(8, 10)),
					)
				: new Date(value)

	if (Number.isNaN(date.getTime())) return ''

	return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`
}
