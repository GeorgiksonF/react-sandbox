import { Navigate, Route, Routes } from 'react-router'
import TodoPage from './pages/todo/TodoPage'
import NotFoundPage from './pages/not-found/NotFoundPage'

function RoutesConfig() {
	return (
		<Routes>
			<Route path="/" element={<Navigate to="/todo-list" replace />} />
			<Route path="/todo-list" element={<TodoPage />} />
			<Route path="*" element={<NotFoundPage />} />
		</Routes>
	)
}

export default RoutesConfig
