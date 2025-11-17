import { MantineProvider } from '@mantine/core'
import '@mantine/core/styles.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router'
import ArgumentPage from './features/debate/pages/ArgumentPage'
import HomePage from './layout/HomePage'
import { IdentityProvider } from './providers/IdentityProvider'
import { SocketProvider } from './providers/SocketProvider'

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<MantineProvider>
			<IdentityProvider>
				<SocketProvider>
					<BrowserRouter>
						<Routes>
							<Route path='' element={<HomePage />} />
							<Route path='/argument/:argumentCode' element={<ArgumentPage />} />
						</Routes>
					</BrowserRouter>
				</SocketProvider>
			</IdentityProvider>
		</MantineProvider>
	</StrictMode>
)
