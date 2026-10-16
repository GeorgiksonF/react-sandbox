import { useCallback, useState } from 'react'

export function useToggleList<T>() {
	const [items, setItems] = useState<T[]>([])

	const toggle = useCallback((value: T) => {
		setItems(prev => (prev.includes(value) ? prev.filter(x => x !== value) : [...prev, value]))
	}, [])

	return {
		items,
		toggle,
	}
}
