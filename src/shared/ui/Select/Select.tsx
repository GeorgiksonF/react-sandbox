import styles from './Select.module.css'
import { useMemo, useState } from 'react'

interface SelectItem {
    key: SelectKey,
    value: string
}

export type SelectKey = string | null

interface SelectProps<T extends SelectItem> {
    items: T[]
    selected: T['key'] | null
    placeholder?: string
    onSelect: (key: T['key']) => void
}

function Select<T extends SelectItem>({ items, selected, placeholder, onSelect }: SelectProps<T>) {
    const [ isOpen, setIsOpen ] = useState(false)
    const [ query, setQuery ] = useState('')
    const currentItem = items.find(item => item.key === selected)
    const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
        if (e.currentTarget.contains(e.relatedTarget as Node | null)) return
        setQuery('')
        setIsOpen(false)
    }

    const availableItems = useMemo(() => {
        const q = query.trim().toLowerCase()

        return items.filter(item => 
            !q || item.value.toLowerCase().includes(q)
        )
    }, [items, query])

    return (
        <div className={styles.select} onBlur={handleBlur} tabIndex={-1}>
            <div onClick={() => setIsOpen(true)} className={styles.inputWrapper}>
                {
                    isOpen
                        ? (
                            <input 
                                type="text" 
                                className={styles.input}
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder={currentItem?.value || placeholder}
                                aria-label="Поиск"
                                aria-expanded={isOpen}
                                role="combobox"
                            />
                        ) : (
                            <span className={!currentItem?.value ? styles.placeholder : ''}>{currentItem?.value || placeholder}</span>
                        )
                }
            </div>
            {
                isOpen && (
                    availableItems.length > 0 ? (
                        <ul role='listbox' className={styles.list}>
                            {availableItems.map(item => (
                                <li 
                                    key={item.key}
                                    className={styles.item}
                                    role="option"
                                    aria-selected={false}
                                    onMouseDown={e => e.preventDefault()}
                                    onClick={() => {
                                        onSelect(item.key);
                                        setQuery('');
                                        setIsOpen(false)
                                    }}
                                >
                                    { item.value }
                                </li>
                            ))}
                        </ul>
                    ) : <div className={styles.fallback}>
                        <span>Ничего не найдено</span>
                    </div>
                )
            }
        </div>
    )
}

export default Select