import styles from './Field.module.css'

type FieldProps = {
	error?: string
	children: React.ReactNode
}

function Field({ error, children }: FieldProps) {
	return (
		<div className={styles.field}>
			{children}
			{error && (
				<p className={styles.error} role="alert">
					{error}
				</p>
			)}
		</div>
	)
}

export default Field
