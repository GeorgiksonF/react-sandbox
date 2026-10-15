import styles from './Inpute.module.css'

type InputProps = React.ComponentPropsWithoutRef<'input'>

function Input({ value, onChange, ...rest }: InputProps) {
    return (
        <div className={styles.inputWrapper}>
            <input
                type="text" 
                className={styles.input}
                onChange={onChange}
                value={value}
                {...rest}
            />
        </div>
    )
}

export default Input