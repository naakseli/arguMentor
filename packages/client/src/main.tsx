import { MantineProvider } from '@mantine/core'
import '@mantine/core/styles.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router'
import ArgumentPage from './features/debate/pages/ArgumentPage'
import HomePage from './layout/HomePage'
import { SocketProvider } from './providers/SocketProvider'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<QueryClientProvider client={queryClient}>
			<MantineProvider>
				<SocketProvider>
					<BrowserRouter>
						<Routes>
							<Route path='' element={<HomePage />} />
							<Route path='/argument/:argumentCode' element={<ArgumentPage />} />
						</Routes>
					</BrowserRouter>
				</SocketProvider>
			</MantineProvider>
		</QueryClientProvider>
	</StrictMode>
)
