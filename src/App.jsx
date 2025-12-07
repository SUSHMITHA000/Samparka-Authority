import React, { useState } from 'react'
import Login from './components/Login'
import Dashboard from './components/Dashboard'

export default function App(){
  const [authed, setAuthed] = useState(() => {
    try { return !!localStorage.getItem('mockAuth') } catch (e) { return false }
  })

  return (
    <div className="app-root">
      {authed ? (
        <Dashboard onLogout={() => setAuthed(false)} />
      ) : (
        <Login onSuccess={() => setAuthed(true)} />
      )}
    </div>
  )
}
