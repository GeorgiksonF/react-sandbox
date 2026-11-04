import styles from './Textarea.module.css'

type TextareaProps = React.ComponentPropsWithoutRef<'textarea'>

function Textarea({ ...rest }: TextareaProps) {
	return (
		<div className={styles.textareaWrapper}>
			<textarea className={styles.textarea} {...rest} />
		</div>
	)
}

export default Textarea
