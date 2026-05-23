import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// QueryClientProvider is owned by App.tsx (single source of truth) to avoid
// a duplicate, orphaned React Query cache.
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
