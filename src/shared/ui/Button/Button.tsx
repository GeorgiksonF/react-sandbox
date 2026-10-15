import styles from './Button.module.css'

interface ButtonProps extends React.ComponentPropsWithoutRef<'button'> {
    variant?: 'primary' | 'secondary';
    children: React.ReactNode;
}

function Button({variant = 'primary', onClick, children, ...rest}: ButtonProps) {
    return (
        <button
            className={`${styles.button} ${styles[variant]}`}
            onClick={onClick} 
            {...rest}>
            { children }
        </button>
    )
}

export default Button;
