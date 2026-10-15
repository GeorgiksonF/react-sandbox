import styles from './Modal.module.css'
import { createPortal } from "react-dom"
import { Button } from '../'

type ModalProps = {
    children: React.ReactNode,
    footer?: React.ReactNode,
    width?: number,
    title?: string,
    onClose: () => void
}

function Modal({ children, footer, width, title = '', onClose}: ModalProps) {
    return createPortal((
        <div 
            className={styles.overlay}
            onMouseDown={(e) => {
                if (e.currentTarget === e.target) onClose()
            }}>
            <div className={styles.modal} style={{width: width + 'px'}}>
            <div className={styles.header}>
                <div className={styles.title}>{ title }</div>
                <Button onClick={onClose}>x</Button>
            </div>
            <div className={styles.content}>
                { children }
            </div>
            {
                footer && (
                    <div className={styles.footer}>
                        { footer }
                    </div>
                )
            }
        </div>
        </div>
    ), document.body)
}

export default Modal