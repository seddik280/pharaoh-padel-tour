import { useEffect, useState } from 'react'
import axios from 'axios'

function catClass(cat) { if (cat === 'C') return 'badge-c'; if (cat === 'D') return 'badge-d'; return 'badge-beginner' }

export default function AdminTournaments() {
  const [tournaments, setTournaments] = useState([])
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ name: '', category: 'Beginner', date: '' })
  const [formErrors, setFormErrors] = useState({})
  const [creating, setCreating] = useState(false)
  const [actionLoading, setActionLoading] = useState(null)

  const load = async () => {
    setLoading(true)
    const [tr, rr] = await Promise.all([axios.get('/api/tournaments'), axios.get('/api/registrations')])
    setTournaments(tr.data)
    setRegistrations(rr.data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const validateForm = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Tournament name is required'
    if (!form.date) e.date = 'Date is required'
    return e
  }

  const handleCreate = async () => {
    const e2 = validateForm()
    if (Object.keys(e2).length) { setFormErrors(e2); return }
    setCreating(true)
    try {
      await axios.post('/api/tournaments', form)
      setShowCreate(false); setForm({ name: '', category: 'Beginner', date: '' })
      await load()
    } catch (err) {
      setFormErrors({ server: err.response?.data?.message || 'Creation failed' })
    } finally { setCreating(false) }
  }

  const updateStatus = async (id, status) => {
    setActionLoading(id + status)
    try {
      await axios.put(`/api/tournaments/${id}/status`, { status })
      await load()
    } catch {} finally { setActionLoading(null) }
  }

  const completeTournament = async id => {
    if (!window.confirm('Complete this tournament and award points to all match winners?')) return
    setActionLoading(id + 'complete')
    try {
      await axios.post(`/api/tournaments/${id}/complete`)
      await load()
    } catch (err) { alert(err.response?.data?.message || 'Error') } finally { setActionLoading(null) }
  }

  return (
    <div className="container-xl py-4">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <div>
          <h2 style={{ fontFamily: "'Barlow Condensed'", fontWeight: 800, fontSize: 38, marginBottom: 4 }}>
            Admin — <span className="accent-text">Tournaments</span>
          </h2>
          <p className="text-dim mb-0">Create and manage tournaments</p>
        </div>
        <button className="btn btn-acc" onClick={() => setShowCreate(true)}><i className="bi bi-plus-lg me-2" />New Tournament</button>
      </div>

      {/* Create Tournament Modal */}
      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          onClick={() => setShowCreate(false)}>
          <div className="pp-card" style={{ maxWidth: 440, width: '100%' }} onClick={e => e.stopPropagation()}>
            <h5 style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, marginBottom: 16 }}>Create New Tournament</h5>
            <div className="mb-3">
              <label className="form-label" style={{ fontSize: 13, color: 'var(--txt2)' }}>Tournament Name</label>
              <input className="form-control pp-input" placeholder="e.g. Summer Open"
                value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              {formErrors.name && <div style={{ color: '#f87171', fontSize: 12, marginTop: 4 }}>{formErrors.name}</div>}
            </div>
            <div className="mb-3">
              <label className="form-label" style={{ fontSize: 13, color: 'var(--txt2)' }}>Category</label>
              <select className="form-select pp-select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                <option value="Beginner">Beginner</option>
                <option value="D">D</option>
                <option value="C">C</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label" style={{ fontSize: 13, color: 'var(--txt2)' }}>Date</label>
              <input type="date" className="form-control pp-input"
                value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
              {formErrors.date && <div style={{ color: '#f87171', fontSize: 12, marginTop: 4 }}>{formErrors.date}</div>}
            </div>
            {formErrors.server && <div style={{ color: '#f87171', fontSize: 13, marginBottom: 8 }}>{formErrors.server}</div>}
            <div className="d-flex gap-2">
              <button className="btn btn-ghost flex-fill" onClick={() => setShowCreate(false)}>Cancel</button>
              <button className="btn btn-acc flex-fill" onClick={handleCreate} disabled={creating}>
                {creating ? <span className="spinner-border spinner-border-sm me-2" /> : null}Create
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-5"><div className="spinner-border" style={{ color: 'var(--acc)' }} /></div>
      ) : (
        <div className="pp-card">
          <div className="table-responsive">
            <table className="table pp-table mb-0">
              <thead>
                <tr><th>Name</th><th>Category</th><th>Date</th><th>Status</th><th>Players</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {tournaments.map(t => {
                  const regCount = registrations.filter(r => r.tournament?._id === t._id).length
                  return (
                    <tr key={t._id}>
                      <td style={{ fontWeight: 600 }}>{t.name}</td>
                      <td><span className={`badge ${catClass(t.category)} rounded-pill`} style={{ fontSize: 11 }}>{t.category}</span></td>
                      <td style={{ color: 'var(--txt2)', fontSize: 13 }}>{t.date}</td>
                      <td><span className={`badge badge-${t.status} rounded-pill`} style={{ fontSize: 11 }}>{t.status}</span></td>
                      <td style={{ color: 'var(--txt2)' }}>{regCount}</td>
                      <td>
                        <div className="d-flex gap-1 flex-wrap">
                          {t.status === 'upcoming' && (
                            <button className="btn btn-sm" style={{ background: 'rgba(245,158,11,.15)', border: '1px solid rgba(245,158,11,.3)', color: '#fbbf24', fontSize: 11 }}
                              disabled={actionLoading === t._id + 'active'} onClick={() => updateStatus(t._id, 'active')}>
                              Start
                            </button>
                          )}
                          {t.status === 'active' && (
                            <button className="btn btn-sm" style={{ background: 'rgba(26,158,92,.1)', border: '1px solid rgba(26,158,92,.2)', color: 'var(--acc2)', fontSize: 11 }}
                              disabled={actionLoading === t._id + 'complete'} onClick={() => completeTournament(t._id)}>
                              {actionLoading === t._id + 'complete' ? <span className="spinner-border spinner-border-sm" /> : 'Complete & Award'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
