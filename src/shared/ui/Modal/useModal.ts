import { useCallback, useState } from "react";

interface ModalState<T> {
    isOpen: boolean,
    data: T | null
}
export function useModal<T = void>(initial = false) {
    const [ state, setState ] = useState<ModalState<T>>({
        isOpen: false,
        data: null
    })

    const open = useCallback((data: T | null = null) => {
        setState({ isOpen: true, data })
    }, [])

    const close = useCallback((data: T | null = null) => {
        setState({ isOpen: false, data })
    }, [])

    
    return { 
        isOpen: state.isOpen,
        data: state.data,
        open,
        close
    }
}