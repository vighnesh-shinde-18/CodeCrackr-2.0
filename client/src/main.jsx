import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom';
import ThemeContextProvider from './context/ThemeContext.jsx';
import './index.css'
import App from './App.jsx'
import { SidebarProvider } from '@/components/ui/sidebar';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,                 // Retry failed requests once
      staleTime: 60 * 1000,     // Data is fresh for 1 minute (No background refetching)
      gcTime: 10 * 60 * 1000,   // Cache kept in memory for 10 mins (Formerly 'cacheTime')
      refetchOnWindowFocus: false, // Don't refetch just because I clicked the window
      refetchOnReconnect: true,
    },
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeContextProvider>
        <SidebarProvider>
          <QueryClientProvider client={queryClient}>
            <App />
            <ReactQueryDevtools initialIsOpen={true} />
          </QueryClientProvider>
        </SidebarProvider>
      </ThemeContextProvider>
    </BrowserRouter>
  </StrictMode>,
)
