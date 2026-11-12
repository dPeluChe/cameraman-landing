import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AppV2 } from './AppV2.tsx'
import { AppV3 } from './AppV3.tsx'
import { AppV4 } from './AppV4.tsx'

const urlParams = new URLSearchParams(window.location.search)
const v = urlParams.get('v')
const path = window.location.pathname

const renderApp = () => {
  if (v === '4' || path.startsWith('/v4')) return <AppV4 />
  if (v === '3' || path.startsWith('/v3')) return <AppV3 />
  if (v === '2' || path.startsWith('/v2')) return <AppV2 />
  return <App />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {renderApp()}
  </StrictMode>,
)
