import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './index.css'
import App from './App.tsx'
import RoutesConfig from './RoutesConfig.tsx'

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<BrowserRouter>
			<RoutesConfig />
			<App />
		</BrowserRouter>
	</StrictMode>,
)
