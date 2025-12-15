import React, { useState, useMemo } from 'react'
import ComplaintDetail from '../pages/ComplaintDetail'

function Sidebar({ onLogout, active, setActive }){
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon">NG</div>
        <div>
          <div className="brand-title">NammaGrama</div>
          <div className="brand-sub">Admin Portal</div>
        </div>
      </div>

      <nav className="nav">
        <button className={`nav-item ${active==='dashboard'?'active':''}`} onClick={()=>setActive('dashboard')}>Dashboard</button>
        <button className={`nav-item ${active==='complaints'?'active':''}`} onClick={()=>setActive('complaints')}>Complaints</button>
        <button className={`nav-item ${active==='authorities'?'active':''}`} onClick={()=>setActive('authorities')}>Authorities</button>
        <button className={`nav-item ${active==='reports'?'active':''}`} onClick={()=>setActive('reports')}>Reports</button>
      </nav>

      <div className="sidebar-bottom">
        <button className="btn logout" onClick={onLogout}>Logout</button>
      </div>
    </aside>
  )
}

function StatCard({ title, value, subtitle }){
  return (
    <div className="stat-card">
      <div className="stat-title">{title}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-sub">{subtitle}</div>
    </div>
  )
}

function CategoryBar({ label, value, percent }){
  return (
    <div className="cat-row">
      <div className="cat-label">{label}</div>
      <div className="cat-bar">
        <div className="cat-fill" style={{ width: `${percent}%` }} />
      </div>
      <div className="cat-value">{value} ({percent}%)</div>
    </div>
  )
}

function ComplaintModal({ complaint, onClose, onSave }){
  const [draft, setDraft] = useState(complaint)

  React.useEffect(()=>{
    setDraft(complaint)
  },[complaint])

  if(!draft) return null

  const handleChange = (k, v) => setDraft({...draft, [k]: v})

  const handleSaveClick = () => {
    if(onSave) onSave(draft)
    if(onClose) onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e)=>e.stopPropagation()}>
        <div className="modal-head">
          <h3>{draft.title}</h3>
          <div>
            <button className="btn" onClick={onClose} style={{marginRight:8}}>Close</button>
            <button className="btn" onClick={handleSaveClick}>Save</button>
          </div>
        </div>
        <div className="modal-body">
          <img src={draft.img || '/logo192.png'} alt="thumb" className="modal-thumb" />
          <div className="modal-info">
            <p><strong>Location:</strong> {draft.location}</p>
            <p><strong>Category:</strong> {draft.category}</p>
            <p>
              <strong>Status:</strong>
              <select value={draft.status} onChange={e=>handleChange('status', e.target.value)} style={{marginLeft:8,padding:6,borderRadius:8}}>
                <option>Pending</option>
                <option>In Progress</option>
                <option>Completed</option>
              </select>
            </p>
            <p>
              <strong>Assign To:</strong>
              <input value={draft.authority||''} onChange={e=>handleChange('authority', e.target.value)} placeholder="Authority name" style={{marginLeft:8,padding:6,borderRadius:8,border:'1px solid #e6eef8'}} />
            </p>
            <p><strong>Date:</strong> {draft.date}</p>
            <p className="modal-desc">{draft.desc}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard({ onLogout }){
  const [active, setActive] = useState('dashboard')
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [authModal, setAuthModal] = useState(null)

  const defaultAuthorities = [
    { id: 1, name: 'Road Authority', category: 'Roads & Infrastructure', phone: '+91 9876543210', email: 'roads@panchayat.gov', status: 'Active', assigned: 8, resolved: 45 },
    { id: 2, name: 'Water Authority', category: 'Water Supply', phone: '+91 9876543211', email: 'water@panchayat.gov', status: 'Active', assigned: 5, resolved: 32 },
    { id: 3, name: 'Electricity Board', category: 'Electricity', phone: '+91 9876543212', email: 'electricity@panchayat.gov', status: 'Active', assigned: 3, resolved: 28 },
    { id: 4, name: 'Waste Management', category: 'Waste Management', phone: '+91 9876543213', email: 'waste@panchayat.gov', status: 'Active', assigned: 6, resolved: 51 }
  ]

  const [authorities, setAuthorities] = useState(()=>{
    try {
      const raw = localStorage.getItem('authoritiesData')
      if(raw) return JSON.parse(raw)
    } catch(e){}
    return defaultAuthorities
  })

  const saveAuthorities = (next) => {
    setAuthorities(next)
    try { localStorage.setItem('authoritiesData', JSON.stringify(next)) } catch(e){}
  }

  const defaultComplaints = [
    { id: 1, title: 'Pothole on Main Road', location: 'Main Road, Near Bus Stand', category: 'Roads & Infrastructure', status: 'In Progress', date: '2025-04-10', desc: 'Large pothole causing vehicle damage.', img:'/logo192.png', authority: '' },
    { id: 2, title: 'Garbage Not Collected', location: 'Gandhi Nagar, Ward 3', category: 'Waste Management', status: 'Pending', date: '2025-04-12', desc: 'Garbage not collected for 3 days.', img:'/logo192.png', authority: '' },
    { id: 3, title: 'Street Light Not Working', location: 'Temple Street, Ward 5', category: 'Electricity', status: 'Completed', date: '2025-04-05', desc: 'Street light broken near temple.', img:'/logo192.png', authority: '' },
    { id: 4, title: 'Water Supply Issue', location: 'Nehru Colony, Ward 2', category: 'Water Supply', status: 'In Progress', date: '2025-04-11', desc: 'Low pressure and intermittent supply.', img:'/logo192.png', authority: '' },
    { id: 5, title: 'Drainage Blockage', location: 'Market Area, Ward 1', category: 'Drainage', status: 'Pending', date: '2025-04-13', desc: 'Drain clogged causing overflow.', img:'/logo192.png', authority: '' }
  ]

  const [complaints, setComplaints] = useState(()=>{
    try {
      const raw = localStorage.getItem('complaintsData')
      if(raw) return JSON.parse(raw)
    } catch(e){}
    return defaultComplaints
  })

  const saveComplaints = (next) => {
    setComplaints(next)
    try { localStorage.setItem('complaintsData', JSON.stringify(next)) } catch(e){}
  }

  const filtered = complaints.filter(c=>{
    if(filter === 'pending' && c.status !== 'Pending') return false
    if(filter === 'inprogress' && c.status !== 'In Progress') return false
    if(filter === 'completed' && c.status !== 'Completed') return false
    if(search && !(`${c.title} ${c.location} ${c.category}`.toLowerCase().includes(search.toLowerCase()))) return false
    return true
  })

  const handleSave = (updated) => {
    const next = complaints.map(c => c.id === updated.id ? updated : c)
    saveComplaints(next)
    setSelected(updated)
  }

  // Reports calculations
  const totalComplaints = complaints.length
  const pendingCount = complaints.filter(c=>c.status === 'Pending').length
  const inProgressCount = complaints.filter(c=>c.status === 'In Progress').length
  const completedCount = complaints.filter(c=>c.status === 'Completed').length

  const activeAuthoritiesCount = authorities.filter(a=>a.status === 'Active').length

  // Average resolution time (approx): for completed complaints, compute days since complaint date to today
  const avgResolutionDays = (()=>{
    try{
      const completed = complaints.filter(c=>c.status === 'Completed' && c.date)
      if(completed.length === 0) return 0
      const totalDays = completed.reduce((sum,c)=>{
        const d = new Date(c.date)
        if(isNaN(d)) return sum
        const diff = (Date.now() - d.getTime()) / (1000*60*60*24)
        return sum + diff
      },0)
      return Math.round((totalDays / completed.length) * 10) / 10
    }catch(e){return 0}
  })()

  const resolutionRate = totalComplaints ? Math.round((completedCount / totalComplaints) * 100) : 0

  const complaintsByCategory = useMemo(()=>{
    const map = {}
    complaints.forEach(c=>{
      map[c.category] = (map[c.category] || 0) + 1
    })
    return map
  },[complaints])

  // export CSV of complaints
  const exportCSV = () => {
    const headers = ['id','title','location','category','status','date','authority']
    const rows = complaints.map(c=> headers.map(h=>`"${(c[h]||'').toString().replace(/"/g,'""')}"`).join(','))
    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'complaints.csv'
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  // simple print/PDF export: open a printable window with report summary
  const exportPDF = () => {
    const w = window.open('', '_blank')
    if(!w) return
    const catRows = Object.entries(complaintsByCategory).map(([k,v])=>`<div style="margin:6px 0"><strong>${k}</strong>: ${v}</div>`).join('')
    w.document.write(`<html><head><title>Reports</title></head><body><h1>Reports & Analytics</h1><div>Total Complaints: ${totalComplaints}</div><div>Pending: ${pendingCount}</div><div>In Progress: ${inProgressCount}</div><div>Completed: ${completedCount}</div><h3>By Category</h3>${catRows}</body></html>`)
    w.document.close()
    w.print()
  }

  function AuthorityModal({ authority, onClose, onSave }){
    const [draft, setDraft] = useState(authority || { name:'', category:'', phone:'', email:'', status:'Active', assigned:0, resolved:0 })

    React.useEffect(()=>{
      setDraft(authority || { name:'', category:'', phone:'', email:'', status:'Active', assigned:0, resolved:0 })
    },[authority])

    if(authority === null) return null

    const handleChange = (k,v) => setDraft({...draft, [k]: v})

    const handleSaveClick = () => {
      if(onSave) onSave(draft)
      if(onClose) onClose()
    }

    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal" onClick={(e)=>e.stopPropagation()}>
          <div className="modal-head">
            <h3>{draft.id ? 'Edit Authority' : 'Add Authority'}</h3>
            <div>
              <button className="btn" onClick={onClose} style={{marginRight:8}}>Close</button>
              <button className="btn" onClick={handleSaveClick}>Save</button>
            </div>
          </div>
          <div className="modal-body" style={{display:'block'}}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              <div className="field">
                <span className="label">Name</span>
                <input value={draft.name} onChange={e=>handleChange('name', e.target.value)} />
              </div>
              <div className="field">
                <span className="label">Category</span>
                <input value={draft.category} onChange={e=>handleChange('category', e.target.value)} />
              </div>
              <div className="field">
                <span className="label">Phone</span>
                <input value={draft.phone} onChange={e=>handleChange('phone', e.target.value)} />
              </div>
              <div className="field">
                <span className="label">Email</span>
                <input value={draft.email} onChange={e=>handleChange('email', e.target.value)} />
              </div>
              <div className="field">
                <span className="label">Assigned</span>
                <input type="number" value={draft.assigned} onChange={e=>handleChange('assigned', Number(e.target.value))} />
              </div>
              <div className="field">
                <span className="label">Resolved</span>
                <input type="number" value={draft.resolved} onChange={e=>handleChange('resolved', Number(e.target.value))} />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }



  return (
    <div className="dashboard-root">
      <Sidebar onLogout={onLogout} active={active} setActive={setActive} />

      <div className="dashboard-main">
        {active === 'dashboard' && (
          <>
            <header className="dash-header">
              <h2>Dashboard</h2>
            </header>

            <section className="stats-grid">
              <StatCard title="Total Complaints" value="127" subtitle="All time" />
              <StatCard title="Pending" value="23" subtitle="Awaiting assignment" />
              <StatCard title="In Progress" value="45" subtitle="Being resolved" />
              <StatCard title="Completed" value="59" subtitle="Successfully resolved" />
            </section>

            <section className="panels">
              <div style={{display:'flex',flexDirection:'column',gap:12}}>
                <div className="panel notifications-panel">
                  <div className="panel-title">Notifications</div>

                  <div className="notif-list-body">
                    {complaints && complaints.slice().sort((a,b)=> new Date(b.date) - new Date(a.date)).slice(0,5).map(c => (
                      <div key={c.id} className="notif-item">
                        {c.status === 'Pending' && <span className="notif-badge">NEW</span>}
                        <div className="notif-title">{c.title}</div>
                        <div className="notif-sub">{c.location} • {c.date}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{display:'flex',flexDirection:'column',gap:12}}>
                <div className="panel categories">
                  <div className="panel-title">Issues by Category</div>
                  <CategoryBar label="Pothole" value={32} percent={25} />
                  <CategoryBar label="Street Light" value={28} percent={22} />
                  <CategoryBar label="Garbage" value={25} percent={20} />
                </div>

                <div className="panel pending-panel">
                  <div className="panel-title" style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <span style={{fontSize:18}}>⚠️</span>
                      <div>Pending Complaints - Needs Immediate Action</div>
                    </div>

                    <div className="pending-count">{pendingCount} Pending</div>
                  </div>

                  <div className="pending-list">
                    {complaints && complaints.filter(c=>c.status === 'Pending').slice().sort((a,b)=> new Date(b.date) - new Date(a.date)).map((c, idx) => (
                      <div key={c.id} className={`pending-item ${idx===0? 'highlight':''}`}>
                        <img src={c.img || '/logo192.png'} alt="thumb" className="thumb" />

                        <div className="pending-body">
                          <div className="pending-title">{c.title}</div>
                          <div className="pending-sub">{c.location}</div>
                        </div>

                        <div className="pending-meta">
                          <div className="priority">Priority: Medium</div>
                          <div className="date">{c.date}</div>
                        </div>
                      </div>
                    ))}

                    {complaints && complaints.filter(c=>c.status === 'Pending').length === 0 && (
                      <div style={{ color: '#6b7280' }}>No pending complaints</div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {active === 'complaintDetail' && selected && (
          <div className="complaints-page">
            <ComplaintDetail complaint={selected} onBack={()=>{ setActive('complaints'); setSelected(null) }} onSave={(next)=>{ handleSave(next); setSelected(next) }} authorities={authorities} />
          </div>
        )}

        {active === 'complaints' && (
          <div className="complaints-page">
            <div className="complaints-head">
              <h2>Complaint Management</h2>
              <div className="complaints-controls">
                <input className="search" placeholder="Search complaints..." value={search} onChange={e=>setSearch(e.target.value)} />
                <div className="filter">
                  <button className={`tab ${filter==='all'?'active':''}`} onClick={()=>setFilter('all')}>All ({complaints.length})</button>
                  <button className={`tab ${filter==='pending'?'active':''}`} onClick={()=>setFilter('pending')}>Pending (2)</button>
                  <button className={`tab ${filter==='inprogress'?'active':''}`} onClick={()=>setFilter('inprogress')}>In Progress (2)</button>
                  <button className={`tab ${filter==='completed'?'active':''}`} onClick={()=>setFilter('completed')}>Completed (1)</button>
                </div>
              </div>
            </div>

            <div className="panel complaints-table">
              <div className="table-head">
                <div>ID</div>
                <div>Title</div>
                <div>Location</div>
                <div>Category</div>
                <div>Status</div>
                <div>Date</div>
                <div>Actions</div>
              </div>

                  {filtered.map(c=> (
                    <div key={c.id} className="table-row">
                      <div className="cell">#{c.id}</div>
                      <div className="cell title-cell">
                        <img src={c.img} className="thumb small" alt=""/>
                        <div>{c.title}</div>
                      </div>
                      <div className="cell">{c.location}</div>
                      <div className="cell">{c.category}</div>
                      <div className="cell"><span className={`badge ${c.status.toLowerCase().replace(' ','')}`}>{c.status}</span></div>
                      <div className="cell">{c.date}</div>
                      <div className="cell"><button className="btn" onClick={(e)=>{e.stopPropagation(); console.log('View clicked', c); setSelected(c); setActive('complaintDetail')}}>View</button></div>
                    </div>
                  ))}
            </div>
          </div>
        )}

        {active === 'authorities' && (
          <div className="authorities-page">
            <div className="panel-head">
              <h2>Authority Management</h2>
              <button className="btn primary" onClick={()=>setAuthModal({})} style={{background:'#16a34a',color:'#fff'}}>+ Add Authority</button>
            </div>

            <div className="authorities-grid" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:18,marginTop:12}}>
              {authorities.map(a=> (
                <div key={a.id} className="authority-card" style={{background:'#fff',padding:18,borderRadius:12,boxShadow:'0 6px 18px rgba(16,24,40,0.04)'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'start'}}>
                    <div>
                      <h3 style={{margin:0}}>{a.name}</h3>
                      <div style={{color:'#6b7280',marginTop:8}}>{a.category}</div>
                      <div style={{marginTop:12,color:'#374151'}}>Phone: {a.phone}</div>
                      <div style={{color:'#374151',marginTop:6}}>Email: {a.email}</div>
                    </div>
                    <div><span style={{background:'#ecfdf5', color:'#065f46', padding:'6px 10px', borderRadius:999, fontWeight:700}}>Active</span></div>
                  </div>

                  <hr style={{border:'none',borderTop:'1px solid #f1f5f9',margin:'14px 0'}} />

                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <div style={{textAlign:'center'}}>
                      <div style={{color:'#16a34a',fontSize:20,fontWeight:700}}>{a.assigned}</div>
                      <div style={{color:'#6b7280'}}>Assigned</div>
                    </div>
                    <div style={{textAlign:'center'}}>
                      <div style={{color:'#111827',fontSize:20,fontWeight:700}}>{a.resolved}</div>
                      <div style={{color:'#6b7280'}}>Resolved</div>
                    </div>
                  </div>

                  <div style={{display:'flex',gap:10,marginTop:12}}>
                    <button className="btn" onClick={()=>setAuthModal(a)}>Edit</button>
                    <button className="btn" style={{borderColor:'#fdecea',color:'#b91c1c'}} onClick={()=>{ if(window.confirm('Remove authority?')){ saveAuthorities(authorities.filter(x=>x.id!==a.id)) } }}>Remove</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        

        {/* ComplaintModal removed: view action no longer opens modal per user request */}
        <AuthorityModal authority={authModal} onClose={()=>setAuthModal(null)} onSave={(data)=>{
          const next = data.id ? authorities.map(a=> a.id===data.id ? data : a) : [...authorities, {...data, id: Date.now()}]
          saveAuthorities(next)
        }} />
      </div>
    </div>
  )
}
