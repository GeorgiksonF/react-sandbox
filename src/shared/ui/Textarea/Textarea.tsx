import styles from './Textarea.module.css'

type TextareaProps = React.ComponentPropsWithoutRef<'textarea'>

function Textarea({ placeholder, value, onChange }: TextareaProps) {
	return (
		<div className={styles.textareaWrapper}>
			<textarea
				className={styles.textarea}
				placeholder={placeholder}
				onChange={onChange}
				value={value}
			/>
		</div>
	)
}

export default Textarea
