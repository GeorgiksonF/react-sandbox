import styles from './Input.module.css'

type InputProps = React.ComponentPropsWithRef<'input'>

function Input({ type = 'text', className, ...rest }: InputProps) {
	return (
		<div className={styles.inputWrapper}>
			<input
				type={type}
				className={`${styles.input}${className ? ` ${className}` : ''}`}
				{...rest}
			/>
		</div>
	)
}

export default Input
