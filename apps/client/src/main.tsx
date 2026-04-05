import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './i18n.ts'
import './assets/fonts.css'
import './index.css'
import App from './App.tsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from './components/ui/sonner.tsx'
import type { ApiError } from './lib/types.ts'
import { getStoredUiLocale } from './lib/i18n.ts'
import i18n from './i18n.ts'

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Root element not found')

document.documentElement.lang = getStoredUiLocale()
i18n.on('languageChanged', (locale) => {
  document.documentElement.lang = locale
})

const client = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: ApiError) => {
        if (error?.isNetworkError) return false
        return failureCount < 2
      },
      staleTime: 30000, // 30 seconds
    },
  },
})

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={client}>
      <>
        <App />
        <Toaster position='top-right' duration={2000} />
      </>
    </QueryClientProvider>
  </StrictMode>,
)
