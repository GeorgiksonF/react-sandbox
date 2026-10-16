import styles from './Dropdown.module.css'
import Button, { type ButtonVariant } from '../Button/Button'
import { useEffect, useRef, useState } from 'react'
import { autoUpdate, flip, offset, shift, useFloating } from '@floating-ui/react'

type ListItem = {
	key: string
	label: string
	handler: () => void
}

type DropdownProps<T> = {
	children: React.ReactNode
	variant?: ButtonVariant
	list: T[]
}

function Dropdown<T extends ListItem>({ list, children, variant }: DropdownProps<T>) {
	const [isOpen, setIsOpen] = useState(false)
	const wrapperRef = useRef<HTMLDivElement>(null)
	const { refs, floatingStyles } = useFloating({
		open: isOpen,
		onOpenChange: setIsOpen,
		placement: 'bottom-start',
		whileElementsMounted: autoUpdate,
		middleware: [
			offset({
				alignmentAxis: -24,
				mainAxis: 4,
			}),
			flip({
				fallbackPlacements: ['bottom-end', 'top-start', 'top-end'],
			}),
			shift({ padding: 8 }),
		],
	})
	const { setReference, setFloating } = refs

	useEffect(() => {
		if (!isOpen) return

		function handlePointerDown(event: PointerEvent) {
			const wrapper = wrapperRef.current

			if (wrapper && event.target instanceof Node && !wrapper.contains(event.target)) {
				setIsOpen(false)
			}
		}

		document.addEventListener('pointerdown', handlePointerDown)

		return () => {
			document.removeEventListener('pointerdown', handlePointerDown)
		}
	}, [isOpen])

	return (
		<div ref={wrapperRef} className={styles.wrapper}>
			<Button variant={variant} onClick={() => setIsOpen(!isOpen)} ref={setReference}>
				{children}
			</Button>
			{isOpen && (
				<ul className={styles.list} ref={setFloating} style={floatingStyles}>
					{list.map(item => (
						<li
							className={styles.item}
							key={item.key}
							onClick={() => {
								item.handler()
								setIsOpen(false)
							}}
						>
							{item.label}
						</li>
					))}
				</ul>
			)}
		</div>
	)
}

export default Dropdown
