import { Link } from 'react-router'

function NotFoundPage() {
	return (
		<div>
			<h1>Страница не найдена</h1>
			<p>Такой страницы нет или она была перемещена.</p>
			<Link to="/todo-list">Вернуться к списку задач</Link>
		</div>
	)
}

export default NotFoundPage
