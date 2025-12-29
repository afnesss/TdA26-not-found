import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Root element not found')

const client = new QueryClient();

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={client}>
    <App />
    </QueryClientProvider>
  </StrictMode>,
)
