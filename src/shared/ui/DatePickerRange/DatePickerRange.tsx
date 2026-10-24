import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import styles from '../DatePicker/DatePicker.module.css'
import rangeStyles from './DatePickerRange.module.css'
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
} from '../DatePicker/dateUtils'

const RANGE_MAX_DIGITS = MAX_DIGITS * 2
const RANGE_SEPARATOR = ' — '
const DATE_PLACEHOLDER = 'ДД.ММ.ГГГГ'
const FIRST_DATE_LENGTH = 10

interface DatePickerRangeProps {
	value?: string[]
	onChange?: (value: string[]) => void
	placeholder?: string
	disabled?: boolean
	id?: string
	name?: string
	className?: string
}

function isoOrEmpty(value: string | undefined) {
	const date = parseIso(value)

	return date ? isoFromDate(date) : ''
}

function normalizeRange(values: string[]) {
	return [...new Set(values.map(isoOrEmpty).filter(Boolean))].sort().slice(0, 2)
}

function formatRange(values: string[]) {
	return values.map(formatIso).filter(Boolean).join(RANGE_SEPARATOR)
}

function sameRange(first: string[], second: string[]) {
	return first.length === second.length && first.every((value, index) => value === second[index])
}

function formatRangeDigits(digits: string) {
	const first = digits.slice(0, MAX_DIGITS)
	const second = digits.slice(MAX_DIGITS, RANGE_MAX_DIGITS)

	return second
		? `${formatDigits(first)}${RANGE_SEPARATOR}${formatDigits(second)}`
		: formatDigits(first)
}

function rangeCaretPosition(digitIndex: number) {
	if (digitIndex <= MAX_DIGITS) return caretPosition(digitIndex)

	return FIRST_DATE_LENGTH + RANGE_SEPARATOR.length + caretPosition(digitIndex - MAX_DIGITS)
}

function hasRangeError(digits: string) {
	if (digits.length < MAX_DIGITS) return false
	if (!digitsToIso(digits.slice(0, MAX_DIGITS))) return true
	if (digits.length < RANGE_MAX_DIGITS) return false

	return !digitsToIso(digits.slice(MAX_DIGITS, RANGE_MAX_DIGITS))
}

function DatePickerRange({
	value,
	onChange,
	placeholder = `${DATE_PLACEHOLDER}${RANGE_SEPARATOR}${DATE_PLACEHOLDER}`,
	disabled = false,
	id,
	name,
	className,
}: DatePickerRangeProps) {
	const [innerValue, setInnerValue] = useState<string[]>([])
	const [draft, setDraft] = useState('')
	const [isEditing, setIsEditing] = useState(false)
	const [isOpen, setIsOpen] = useState(false)
	const [hoverIso, setHoverIso] = useState('')
	const rawValue = value === undefined ? innerValue : value
	const currentDates = normalizeRange(rawValue)
	const [viewDate, setViewDate] = useState(() =>
		startOfMonth(parseIso(currentDates[0]) ?? new Date()),
	)
	const [todayIso] = useState(() => isoFromDate(new Date()))

	const inputRef = useRef<HTMLInputElement>(null)
	const wrapperRef = useRef<HTMLDivElement>(null)
	const caretRef = useRef<number | null>(null)

	const startIso = currentDates[0] ?? ''
	const endIso = currentDates[1] ?? ''
	const displayValue = isEditing ? draft : formatRange(currentDates)
	const digits = draft.replace(/\D/g, '')
	const isInvalid = isEditing && hasRangeError(digits)

	const previewIso = isOpen && startIso && !endIso && hoverIso ? hoverIso : endIso
	const rangeStart = startIso && previewIso && previewIso < startIso ? previewIso : startIso
	const rangeEnd =
		startIso && previewIso && previewIso < startIso ? startIso : previewIso || startIso

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

	function commit(nextValue: string[]) {
		if (value === undefined) {
			setInnerValue(nextValue)
		}

		onChange?.(nextValue)
	}

	function applyDigits(nextDigits: string) {
		if (nextDigits.length === 0) {
			if (currentDates.length > 0) commit([])
			return
		}

		if (nextDigits.length < MAX_DIGITS) return

		const firstIso = digitsToIso(nextDigits.slice(0, MAX_DIGITS))

		if (!firstIso) return

		if (nextDigits.length < RANGE_MAX_DIGITS) {
			const nextRange = [firstIso]

			if (!sameRange(nextRange, currentDates)) commit(nextRange)
			return
		}

		const secondIso = digitsToIso(nextDigits.slice(MAX_DIGITS, RANGE_MAX_DIGITS))

		if (!secondIso) return

		const nextRange = normalizeRange([firstIso, secondIso])

		if (!sameRange(nextRange, currentDates)) commit(nextRange)
	}

	function openCalendar() {
		if (disabled) return

		const date = parseIso(currentDates[0]) ?? new Date()

		setViewDate(startOfMonth(date))
		setHoverIso('')
		setIsOpen(true)
	}

	function toggleCalendar() {
		if (isOpen) {
			setIsOpen(false)
			return
		}

		openCalendar()
	}

	function closeCalendar() {
		inputRef.current?.focus()
		setIsOpen(false)
		setIsEditing(false)
	}

	function changeMonth(offset: number) {
		setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1))
	}

	function selectDate(date: Date) {
		const iso = isoFromDate(date)

		if (currentDates.length === 1) {
			const nextRange = normalizeRange([currentDates[0], iso])

			if (!sameRange(nextRange, currentDates)) commit(nextRange)

			setViewDate(startOfMonth(date))
			setHoverIso('')
			closeCalendar()
			return
		}

		commit([iso])
		setViewDate(startOfMonth(date))
		setHoverIso('')
	}

	function clearRange() {
		commit([])
		setHoverIso('')
		closeCalendar()
	}

	function handleFocus() {
		if (disabled) return

		setDraft(formatRange(currentDates))
		setIsEditing(true)
	}

	function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
		const rawValueText = event.target.value
		const cursor = event.target.selectionStart ?? rawValueText.length
		const digitsBeforeCaret = countDigits(rawValueText.slice(0, cursor))
		const nextDigits = rawValueText.replace(/\D/g, '').slice(0, RANGE_MAX_DIGITS)
		const nextDraft = formatRangeDigits(nextDigits)

		if (nextDraft === draft) {
			caretRef.current = null
			return
		}

		caretRef.current = Math.min(rangeCaretPosition(digitsBeforeCaret), nextDraft.length)
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
		const nextDigits = nextRaw.replace(/\D/g, '').slice(0, RANGE_MAX_DIGITS)
		const nextDraft = formatRangeDigits(nextDigits)
		const digitIndex = countDigits(nextRaw.slice(0, removeIndex))

		caretRef.current = Math.min(rangeCaretPosition(digitIndex), nextDraft.length)
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
					maxLength={23}
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
				<div className={styles.popover} role="dialog" aria-label="Выбор диапазона дат">
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
					<div className={rangeStyles.days} onMouseLeave={() => setHoverIso('')}>
						{calendarDays.map(day => {
							const iso = isoFromDate(day.date)
							const isRangeStart = iso === rangeStart
							const isRangeEnd = iso === rangeEnd
							const isSelected = isRangeStart || isRangeEnd
							const isInRange =
								Boolean(rangeStart && rangeEnd) &&
								iso > rangeStart &&
								iso < rangeEnd
							const dayClassName = [
								styles.day,
								rangeStyles.rangeDay,
								day.inCurrentMonth ? '' : styles.dayOutside,
								iso === todayIso ? styles.today : '',
								isInRange ? rangeStyles.inRange : '',
								isSelected
									? rangeStart === rangeEnd
										? rangeStyles.selected
										: isRangeStart
											? rangeStyles.rangeStart
											: rangeStyles.rangeEnd
									: '',
							]
								.filter(Boolean)
								.join(' ')

							return (
								<button
									key={iso}
									type="button"
									className={dayClassName}
									onClick={() => selectDate(day.date)}
									onMouseEnter={() => setHoverIso(iso)}
									aria-label={iso}
									aria-pressed={isSelected}
								>
									{day.date.getDate()}
								</button>
							)
						})}
					</div>
					<div className={styles.footer}>
						<button type="button" className={styles.footerButton} onClick={clearRange}>
							Очистить
						</button>
						<div className={rangeStyles.footerActions}>
							{currentDates.length === 1 && (
								<button
									type="button"
									className={styles.footerButton}
									onClick={closeCalendar}
								>
									Готово
								</button>
							)}
							<button
								type="button"
								className={styles.footerButton}
								onClick={() => selectDate(new Date())}
							>
								Сегодня
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}

export default DatePickerRange
