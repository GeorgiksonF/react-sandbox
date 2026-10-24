import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import styles from './DatePicker.module.css'
import {
	MAX_DIGITS,
	MONTHS,
	WEEKDAYS,
	caretPosition,
	countDigits,
	digitsToIso,
	formatDigits,
	formatIso,
	getCalendarDays,
	isoFromDate,
	parseIso,
	startOfMonth,
} from './dateUtils'

interface DatePickerProps {
	value?: string
	onChange?: (value: string) => void
	placeholder?: string
	disabled?: boolean
	id?: string
	name?: string
	className?: string
}

function DatePicker({
	value,
	onChange,
	placeholder = 'ДД.ММ.ГГГГ',
	disabled = false,
	id,
	name,
	className,
}: DatePickerProps) {
	const [innerValue, setInnerValue] = useState('')
	const [draft, setDraft] = useState('')
	const [isEditing, setIsEditing] = useState(false)
	const [isOpen, setIsOpen] = useState(false)
	const [viewDate, setViewDate] = useState(() => startOfMonth(parseIso(value) ?? new Date()))
	const [todayIso] = useState(() => isoFromDate(new Date()))

	const inputRef = useRef<HTMLInputElement>(null)
	const wrapperRef = useRef<HTMLDivElement>(null)
	const caretRef = useRef<number | null>(null)

	const currentValue = value === undefined ? innerValue : value
	const selectedDate = parseIso(currentValue)
	const selectedIso = selectedDate ? isoFromDate(selectedDate) : ''
	const displayValue = isEditing ? draft : formatIso(currentValue)
	const digits = draft.replace(/\D/g, '')
	const isInvalid = isEditing && digits.length === MAX_DIGITS && !digitsToIso(digits)

	const calendarDays = getCalendarDays(viewDate)

	useLayoutEffect(() => {
		if (caretRef.current === null || !inputRef.current) return

		const position = caretRef.current
		caretRef.current = null
		inputRef.current.setSelectionRange(position, position)
	}, [draft])

	useEffect(() => {
		if (!isOpen) return

		function handlePointerDown(event: PointerEvent) {
			const wrapper = wrapperRef.current

			if (wrapper && event.target instanceof Node && !wrapper.contains(event.target)) {
				setIsOpen(false)
			}
		}

		function handleKeyDown(event: KeyboardEvent) {
			if (event.key !== 'Escape') return

			setIsOpen(false)
			inputRef.current?.focus()
		}

		document.addEventListener('pointerdown', handlePointerDown)
		document.addEventListener('keydown', handleKeyDown)

		return () => {
			document.removeEventListener('pointerdown', handlePointerDown)
			document.removeEventListener('keydown', handleKeyDown)
		}
	}, [isOpen])

	function commit(nextValue: string) {
		if (value === undefined) {
			setInnerValue(nextValue)
		}

		onChange?.(nextValue)
	}

	function applyDigits(nextDigits: string) {
		if (nextDigits.length === 0) {
			if (currentValue !== '') commit('')
			return
		}

		const iso = digitsToIso(nextDigits)

		if (iso && iso !== currentValue) commit(iso)
	}

	function openCalendar() {
		if (disabled) return

		const date = parseIso(currentValue) ?? new Date()

		setViewDate(startOfMonth(date))
		setIsOpen(true)
	}

	function toggleCalendar() {
		if (isOpen) {
			setIsOpen(false)
			return
		}

		openCalendar()
	}

	function changeMonth(offset: number) {
		setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1))
	}

	function selectDate(date: Date) {
		inputRef.current?.focus()
		commit(isoFromDate(date))
		setViewDate(startOfMonth(date))
		setIsOpen(false)
		setIsEditing(false)
	}

	function clearDate() {
		inputRef.current?.focus()
		commit('')
		setIsEditing(false)
		setIsOpen(false)
	}

	function handleFocus() {
		if (disabled) return

		setDraft(formatIso(currentValue))
		setIsEditing(true)
	}

	function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
		const rawValue = event.target.value
		const cursor = event.target.selectionStart ?? rawValue.length
		const digitsBeforeCaret = countDigits(rawValue.slice(0, cursor))
		const nextDigits = rawValue.replace(/\D/g, '').slice(0, MAX_DIGITS)
		const nextDraft = formatDigits(nextDigits)

		if (nextDraft === draft) {
			caretRef.current = null
			return
		}

		caretRef.current = Math.min(caretPosition(digitsBeforeCaret), nextDraft.length)
		setDraft(nextDraft)
		applyDigits(nextDigits)
	}

	function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
		if (event.key === 'ArrowDown' && !isOpen) {
			event.preventDefault()
			openCalendar()
			return
		}

		if (
			event.key.length === 1 &&
			!/\d/.test(event.key) &&
			!event.ctrlKey &&
			!event.metaKey &&
			!event.altKey
		) {
			event.preventDefault()
			return
		}

		if (event.key !== 'Backspace' && event.key !== 'Delete') return

		const input = event.currentTarget
		const start = input.selectionStart
		const end = input.selectionEnd

		if (start === null || end === null || start !== end) return

		const isBackspace = event.key === 'Backspace'
		const dotIndex = isBackspace ? start - 1 : start

		if (dotIndex < 0 || input.value[dotIndex] !== '.') return

		const removeIndex = isBackspace ? dotIndex - 1 : dotIndex + 1

		if (removeIndex < 0 || removeIndex >= input.value.length) return

		event.preventDefault()

		const nextRaw = input.value.slice(0, removeIndex) + input.value.slice(removeIndex + 1)
		const nextDigits = nextRaw.replace(/\D/g, '').slice(0, MAX_DIGITS)
		const nextDraft = formatDigits(nextDigits)
		const digitIndex = countDigits(nextRaw.slice(0, removeIndex))

		caretRef.current = Math.min(caretPosition(digitIndex), nextDraft.length)
		setDraft(nextDraft)
		applyDigits(nextDigits)
	}

	return (
		<div ref={wrapperRef} className={`${styles.datePicker}${className ? ` ${className}` : ''}`}>
			<div
				className={`${styles.inputWrapper}${isInvalid ? ` ${styles.invalid}` : ''}${
					disabled ? ` ${styles.disabled}` : ''
				}`}
			>
				<input
					ref={inputRef}
					id={id}
					name={name}
					type="text"
					inputMode="numeric"
					autoComplete="off"
					maxLength={10}
					className={styles.input}
					value={displayValue}
					placeholder={placeholder}
					disabled={disabled}
					aria-invalid={isInvalid || undefined}
					onFocus={handleFocus}
					onBlur={() => setIsEditing(false)}
					onChange={handleChange}
					onKeyDown={handleKeyDown}
				/>
				<button
					type="button"
					className={styles.iconButton}
					onClick={toggleCalendar}
					disabled={disabled}
					aria-label={isOpen ? 'Закрыть календарь' : 'Открыть календарь'}
					aria-expanded={isOpen}
				>
					<svg
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
						aria-hidden="true"
					>
						<rect x="3" y="4" width="18" height="18" rx="2" />
						<line x1="16" y1="2" x2="16" y2="6" />
						<line x1="8" y1="2" x2="8" y2="6" />
						<line x1="3" y1="10" x2="21" y2="10" />
					</svg>
				</button>
			</div>
			{isOpen && (
				<div className={styles.popover} role="dialog" aria-label="Выбор даты">
					<div className={styles.header}>
						<button
							type="button"
							className={styles.navButton}
							onClick={() => changeMonth(-1)}
							aria-label="Предыдущий месяц"
						>
							‹
						</button>
						<span className={styles.title}>
							{MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
						</span>
						<button
							type="button"
							className={styles.navButton}
							onClick={() => changeMonth(1)}
							aria-label="Следующий месяц"
						>
							›
						</button>
					</div>
					<div className={styles.weekdays}>
						{WEEKDAYS.map(weekday => (
							<span key={weekday} className={styles.weekday}>
								{weekday}
							</span>
						))}
					</div>
					<div className={styles.days}>
						{calendarDays.map(day => {
							const iso = isoFromDate(day.date)
							const isSelected = iso === selectedIso
							const isToday = iso === todayIso
							const dayClassName = [
								styles.day,
								day.inCurrentMonth ? '' : styles.dayOutside,
								isToday ? styles.today : '',
								isSelected ? styles.selected : '',
							]
								.filter(Boolean)
								.join(' ')

							return (
								<button
									key={iso}
									type="button"
									className={dayClassName}
									onClick={() => selectDate(day.date)}
									aria-label={iso}
									aria-pressed={isSelected}
								>
									{day.date.getDate()}
								</button>
							)
						})}
					</div>
					<div className={styles.footer}>
						<button type="button" className={styles.footerButton} onClick={clearDate}>
							Очистить
						</button>
						<button
							type="button"
							className={styles.footerButton}
							onClick={() => selectDate(new Date())}
						>
							Сегодня
						</button>
					</div>
				</div>
			)}
		</div>
	)
}

export default DatePicker
