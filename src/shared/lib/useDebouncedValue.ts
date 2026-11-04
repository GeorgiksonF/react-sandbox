import { useEffect, useState } from 'react'

/**
 * Возвращает значение, которое обновляется не чаще, чем раз в `delay` мс.
 * Нужен, чтобы не отправлять запрос на каждое нажатие клавиши.
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
	const [debouncedValue, setDebouncedValue] = useState(value)

	useEffect(() => {
		const timer = setTimeout(() => setDebouncedValue(value), delay)

		return () => clearTimeout(timer)
	}, [value, delay])

	return debouncedValue
}
