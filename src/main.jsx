import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/service-worker.js')
    .then(() => console.log('Service Worker registrován'))
    .catch((err) => console.error('Chyba při registraci:', err))
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
