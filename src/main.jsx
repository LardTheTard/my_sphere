import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import MinimalPortfolio from './MinimalPortfolio.jsx'
import './styles.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {location.pathname === '/current' ? <App /> : <MinimalPortfolio />}
  </StrictMode>,
)
