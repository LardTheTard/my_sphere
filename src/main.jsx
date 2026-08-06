import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import MinimalPortfolio from './MinimalPortfolio.jsx'
import './styles.css'

if (location.pathname !== '/current') {
  const favicon = document.getElementById('site-favicon')
  favicon.href = '/life-favicon.png'
  favicon.type = 'image/png'
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {location.pathname === '/current' ? <App /> : <MinimalPortfolio />}
  </StrictMode>,
)
