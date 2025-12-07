import React, { useState } from 'react'

export default function Login({ onSuccess }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    setMessage(null)
    // Accept any email/username and password (always succeed)
    setMessage({ type: 'success', text: 'Signed in (demo) — welcome.' })
    try { localStorage.setItem('mockAuth', JSON.stringify({ username, ts: Date.now() })) } catch (e) {}
    if (onSuccess) onSuccess()
  }

  return (
    <div className="login-root">
      <header className="login-header">
        <div className="shield" aria-hidden>
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="8" r="3" fill="#39B54A" />
            <path d="M12 2l7 3v4.5c0 5.5-3.6 10.7-7 12-3.4-1.3-7-6.5-7-12V5l7-3z" fill="#fff" opacity="0.08" />
            <path d="M12 2l7 3v4.5c0 5.5-3.6 10.7-7 12-3.4-1.3-7-6.5-7-12V5l7-3z" stroke="#39B54A" strokeWidth="1.2" fill="none" />
          </svg>
        </div>
        <h1>Admin Portal</h1>
        <p className="subtitle">NammaGrama Connect Management</p>
      </header>

      <main className="login-main">
        <div className="card">
          <h3>Admin Login</h3>
          <p className="muted">Enter your credentials to access the dashboard</p>

          {message && (
            <div className={`banner ${message.type === 'error' ? 'err' : 'ok'}`}>{message.text}</div>
          )}

          <form onSubmit={handleSubmit} className="form">
            <label className="label">Username
              <div className="input-with-icon">
                <span className="icon">👤</span>
                <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="admin" />
              </div>
            </label>

            <label className="label">Password
              <div className="input-with-icon">
                <span className="icon">🔒</span>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="●●●●●●●●" />
              </div>
            </label>

            <button type="submit" className="btn login-btn">Login to Dashboard</button>
          </form>

          <div className="demo-note">Demo credentials: <strong>admin</strong> / <strong>password</strong></div>
        </div>
      </main>
    </div>
  )
}

