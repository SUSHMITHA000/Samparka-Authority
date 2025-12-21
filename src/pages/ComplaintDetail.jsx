
import React from "react";
import { useState, useEffect } from "react";


export default function ComplaintDetail({ complaint, onBack, onSave, authorities=[] }){
  const [draft, setDraft] = useState(complaint)
  const [message, setMessage] = useState('')
  const [proof, setProof] = useState(null)

  useEffect(()=>{
    setDraft(complaint)
  },[complaint])

  if(!draft) return (
    <div className="complaints-page">
      <div className="panel">No complaint selected</div>
      <div style={{marginTop:12}}><button className="btn" onClick={onBack}>Back to complaints</button></div>
    </div>
  )

  const handleChange = (k,v) => setDraft({...draft, [k]: v})
  const handleUpdateStatus = () => { if(onSave) onSave({...draft}) }
  const handleAssign = (name) => { const next = {...draft, authority: name}; setDraft(next); if(onSave) onSave(next) }
  const handleSendMessage = () => { console.log('Send message:', message); setMessage(''); alert('Message sent (demo)') }
  const handleFile = (files) => { if(files && files.length) setProof(files[0]) }
  const handleMarkResolved = () => { const next = {...draft, status: 'Completed'}; if(onSave) onSave(next); alert('Marked as resolved (demo)') }

  return (
    <div className="complaint-detail">
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:12}}>
        <button className="btn" onClick={onBack} style={{background:'transparent',border:'0',padding:0}}>← Back to Complaints</button>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:18}}>
        <div>
          <div className="panel detail-card">
            <img src={draft.img || '/logo192.png'} alt="detail" style={{width:'100%',height:260,objectFit:'cover',borderRadius:8}} />
            <h3 style={{marginTop:12}}>{draft.title}</h3>
            <div style={{color:'#6b7280',marginTop:8}}>{draft.desc}</div>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginTop:14}}>
              <div style={{background:'#fbfdff',padding:12,borderRadius:8}}>
                <div style={{fontWeight:700}}>Location</div>
                <div style={{color:'#6b7280',marginTop:8}}>{draft.location}</div>
              </div>
              <div style={{background:'#fbfdff',padding:12,borderRadius:8}}>
                <div style={{fontWeight:700}}>Submitted</div>
                <div style={{color:'#6b7280',marginTop:8}}>{draft.date}</div>
              </div>
            </div>

            <div style={{marginTop:18}} className="panel">
              <div className="panel-title">Location Map</div>
              <div style={{height:220,background:'linear-gradient(180deg,#e8f6ea,#e6f8ee)',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',color:'#14532d'}}>Map showing complaint location</div>
            </div>

            <div style={{marginTop:12}} className="panel">
              <div className="panel-title">Upload Resolution Proof</div>
              {(draft.status === 'Pending' || draft.status === 'In Progress') ? (
                <>
                  <div style={{border:'2px dashed #e5e7eb',borderRadius:8,padding:22,display:'flex',flexDirection:'column',alignItems:'center',gap:8}}>
                    <input type="file" id="proof-file" style={{display:'none'}} onChange={e=>handleFile(e.target.files)} />
                    <label htmlFor="proof-file" style={{cursor:'pointer',color:'#6b7280'}}>Upload resolution photo</label>
                    {proof && <div style={{marginTop:8}}>{proof.name}</div>}
                  </div>
                  <div style={{marginTop:12}}>
                    <button className="btn" style={{background:'#16a34a',color:'#fff',width:'100%'}} onClick={handleMarkResolved}>Mark as Resolved</button>
                  </div>
                </>
              ) : (
                <div style={{marginTop:12}}>
                  <div className="panel-title">Resolution</div>
                  <div style={{color:'#6b7280',padding:12}}>This complaint is completed. No further uploads are needed.</div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <div className="panel">
            <div className="panel-title">Update Status</div>
            <select value={draft.status} onChange={e=>handleChange('status', e.target.value)} style={{width:'100%',padding:10,borderRadius:8,border:'1px solid #eef2f7'}}>
              <option>Pending</option>
              <option>In Progress</option>
              <option>Completed</option>
            </select>
            <button className="btn" style={{background:'#16a34a',color:'#fff',width:'100%',marginTop:12}} onClick={handleUpdateStatus}>Update Status</button>
          </div>

          <div className="panel" style={{marginTop:12}}>
            <div className="panel-title">Assign to Team Member</div>
            <select value={draft.authority || ''} onChange={e=>handleAssign(e.target.value)} style={{width:'100%',padding:10,borderRadius:8,border:'1px solid #eef2f7'}}>
              <option value="">Unassigned</option>
              {authorities.map(a=> <option key={a.id} value={a.name}>{a.name}</option>)}
            </select>
            <button className="btn" style={{width:'100%',marginTop:12}}>Assign Team Member</button>
          </div>

          <div className="panel" style={{marginTop:12}}>
            <div className="panel-title">Send Update to Citizen</div>
            <textarea placeholder="Type message to send to citizen..." value={message} onChange={e=>setMessage(e.target.value)} style={{width:'100%',minHeight:100,padding:12,borderRadius:8,border:'1px solid #eef2f7'}} />
            <button className="btn" style={{marginTop:12,width:'100%'}} onClick={handleSendMessage}>Send Notification</button>
          </div>
        </div>
      </div>
    </div>
  )
}
