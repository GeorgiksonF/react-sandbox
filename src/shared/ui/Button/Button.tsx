import styles from './Button.module.css'

export type ButtonVariant = 'primary' | 'secondary'
interface ButtonProps extends React.ComponentPropsWithRef<'button'> {
	variant?: ButtonVariant
	children: React.ReactNode
}

function Button({ variant = 'primary', onClick, children, ref, ...rest }: ButtonProps) {
	return (
		<button
			ref={ref}
			className={`${styles.button} ${styles[variant]}`}
			onClick={onClick}
			{...rest}
		>
			{children}
		</button>
	)
}

export default Button
