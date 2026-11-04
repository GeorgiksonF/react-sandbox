import { Navigate, Route, Routes } from 'react-router'
import TodoPage from './pages/todo/TodoPage'

function RoutesConfig() {
	return (
		<Routes>
			<Route path="/" element={<Navigate to="/todo-list" replace />} />
			<Route path="/todo-list" element={<TodoPage />} />
		</Routes>
	)
}

export default RoutesConfig
