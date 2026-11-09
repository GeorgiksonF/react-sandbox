import { Component, type ErrorInfo, type ReactNode } from 'react'

type Props = {
	children: ReactNode
}

type State = {
	hasError: boolean
	message: string
}

class ErrorBoundary extends Component<Props, State> {
	state: State = {
		hasError: false,
		message: '',
	}

	static getDerivedStateFromError(error: unknown): State {
		return {
			hasError: true,
			message: error instanceof Error ? error.message : 'Неизвестная ошибка',
		}
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		console.error('Необработанная ошибка приложения', error, errorInfo)
	}

	render() {
		if (this.state.hasError) {
			return (
				<div role="alert">
					<h1>Что-то пошло не так</h1>
					<p>{this.state.message}</p>
					<button type="button" onClick={() => window.location.reload()}>
						Перезагрузить страницу
					</button>
				</div>
			)
		}

		return this.props.children
	}
}

export default ErrorBoundary
