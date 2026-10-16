import { useMemo, useState } from 'react'
import styles from './MultiSelect.module.css'

interface MultiSelectItem {
	key: MultiSelectKey
	value: string
}

export type MultiSelectKey = string

interface MultiSelectProps<T extends MultiSelectItem> {
	items: T[]
	selected: T['key'][]
	placeholder?: string
	onSelect: (key: T['key']) => void
}

function MultiSelect<T extends MultiSelectItem>({
	items,
	selected,
	placeholder,
	onSelect,
}: MultiSelectProps<T>) {
	const [isOpen, setIsOpen] = useState(false)
	const [query, setQuery] = useState('')

	const selectedSet = useMemo(() => new Set(selected), [selected])

	const selectedItems = useMemo(
		() => items.filter(item => selectedSet.has(item.key)),
		[items, selectedSet],
	)

	const availableItems = useMemo(() => {
		const q = query.trim().toLowerCase()

		return items.filter(
			item => !selectedSet.has(item.key) && (!q || item.value.toLowerCase().includes(q)),
		)
	}, [items, selectedSet, query])

	const handleRemove = (e: React.MouseEvent<HTMLButtonElement>, key: MultiSelectKey) => {
		e.preventDefault()
		e.stopPropagation()
		onSelect(key)
	}

	const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
		if (e.currentTarget.contains(e.relatedTarget as Node | null)) return

		setIsOpen(false)
	}

	return (
		<div className={styles.multiSelect} onBlur={handleBlur} tabIndex={-1}>
			<div onClick={() => setIsOpen(true)} className={styles.inputWrapper}>
				{selectedItems.map(item => (
					<span key={item.key} className={styles.selected}>
						{item.value}
						<button
							type="button"
							aria-label={`Убрать ${item.value}`}
							onClick={e => handleRemove(e, item.key)}
							className={styles.remove}
						>
							x
						</button>
					</span>
				))}
				<input
					type="text"
					className={styles.input}
					value={query}
					onChange={e => setQuery(e.target.value)}
					placeholder={placeholder}
					aria-label="Поиск"
					aria-expanded={isOpen}
					role="combobox"
				/>
			</div>
			{isOpen &&
				(availableItems.length > 0 ? (
					<ul role="listbox" className={styles.list}>
						{availableItems.map(item => (
							<li
								key={item.key}
								className={styles.item}
								role="option"
								aria-selected={false}
								onMouseDown={e => e.preventDefault()}
								onClick={() => {
									onSelect(item.key)
									setQuery('')
								}}
							>
								{item.value}
							</li>
						))}
					</ul>
				) : (
					<div className={styles.fallback}>
						<span>Ничего не найдено</span>
					</div>
				))}
		</div>
	)
}

export default MultiSelect
