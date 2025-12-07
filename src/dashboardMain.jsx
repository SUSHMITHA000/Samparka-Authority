import React from 'react'
import { createRoot } from 'react-dom/client'
import Dashboard from './components/Dashboard'
import './styles.css'

const root = createRoot(document.getElementById('root'))
// Prevent direct access: redirect to login if not signed in (mockAuth)
const isAuthed = (() => {
  try { return !!localStorage.getItem('mockAuth') } catch (e) { return false }
})()

if (!isAuthed) {
  // Not signed in — redirect to root (login)
  window.location.href = '/'
} else {
  root.render(
    <React.StrictMode>
      <Dashboard onLogout={() => { try { localStorage.removeItem('mockAuth') } catch(e){}; window.location.href = '/' }} />
    </React.StrictMode>
  )
}
