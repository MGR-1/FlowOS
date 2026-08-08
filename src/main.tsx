import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

// Global CSS reset + animations
const style = document.createElement('style')
style.textContent = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { height: 100%; }
  body { background: #0F1117; -webkit-font-smoothing: antialiased; }
  input::placeholder { color: #505A6E; }
  input:focus { border-color: #1D9E75 !important; }
  button { transition: opacity 0.15s, background 0.15s; }
  button:hover { opacity: 0.85; }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #2A3045; border-radius: 3px; }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.4; }
  }
`
document.head.appendChild(style)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
