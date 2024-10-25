import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import TransactionDashboard from './App'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <TransactionDashboard />
  </StrictMode>,
)
