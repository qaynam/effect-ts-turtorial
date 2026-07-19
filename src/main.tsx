import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initBundler } from './sandbox/bundler'

// esbuild-wasm(約10MB)は初回 Run を速くするため起動時にウォームアップする
void initBundler().catch(() => {
  /* 失敗しても Run 時に再試行される */
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
