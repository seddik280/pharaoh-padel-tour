import { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

function getCategory(pts) { if (pts >= 1200) return 'C'; if (pts >= 500) return 'D'; return 'Beginner' }
function catClass(cat) { if (cat === 'C') return 'badge-c'; if (cat === 'D') return 'badge-d'; return 'badge-beginner' }
function initials(name) { return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) }

export default function Profile() {
  const { user, refreshUser } = useAuth()
  const [history, setHistory] = useState([])
  const [matches, setMatches] = useState([])
  const [allUsers, setAllUsers] = useState([])
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!user) return
    setForm({ name: user.name, email: user.email, password: '' })
    axios.get(`/api/users/${user.id}/history`).then(r => setHistory(r.data)).catch(() => {})
    axios.get('/api/matches').then(r => setMatches(r.data)).catch(() => {})
    axios.get('/api/users').then(r => setAllUsers(r.data)).catch(() => {})
  }, [user])

  if (!user) return null
  if (user.role === 'admin') return <div className="container py-5 empty-state"><div className="icon">👤</div><p>Admin accounts do not have player profiles</p></div>

  const cat = getCategory(user.points)
  const myMatches = matches.filter(m => m.player1?._id === user.id || m.player2?._id === user.id)
  const wins = myMatches.filter(m => m.winner?._id === user.id).length
  const rank = allUsers.sort((a, b) => b.points - a.points).findIndex(p => p._id === user.id) + 1

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.email.trim()) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email'
    if (form.password && form.password.length < 3) e.password = 'Password must be at least 3 characters'
    return e
  }

  const handleSave = async e => {
    e.preventDefault()
    const e2 = validate()
    if (Object.keys(e2).length) { setErrors(e2); return }
    setSaving(true)
    try {
      await axios.put('/api/users/me', form)
      await refreshUser()
      setSaved(true); setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      setErrors({ server: err.response?.data?.message || 'Update failed' })
    } finally { setSaving(false) }
  }

  const nextCat = cat === 'Beginner' ? 'D' : cat === 'D' ? 'C' : null
  const ptsNeeded = cat === 'Beginner' ? 500 : 1200
  const pct = cat === 'C' ? 100 : cat === 'Beginner' ? Math.min(100, (user.points / 500) * 100) : Math.min(100, ((user.points - 500) / 700) * 100)

  return (
    <div className="container-xl py-4">
      <h2 style={{ fontFamily: "'Barlow Condensed'", fontWeight: 800, fontSize: 38, marginBottom: 24 }}>My <span className="accent-text">Profile</span></h2>

      <div className="row g-4 mb-4">
        {/* Profile card */}
        <div className="col-md-6">
          <div className="pp-card-acc h-100">
            <div className="d-flex align-items-center gap-3 mb-3">
              <div className="pp-avatar" style={{ width: 60, height: 60, fontSize: 22 }}>{initials(user.name)}</div>
              <div>
                <h4 style={{ fontFamily: "'Barlow Condensed'", fontWeight: 800, fontSize: 28, marginBottom: 4 }}>{user.name}</h4>
                <span className={`badge ${catClass(cat)} rounded-pill px-3 py-2`} style={{ fontSize: 13 }}>{cat}</span>
              </div>
            </div>
            <hr style={{ borderColor: 'var(--border)' }} />
            <div className="row g-3 mt-1">
              {[['Total Points', (user.points || 0).toLocaleString(), 'accent-text'], ['Global Rank', `#${rank}`, ''], ['Matches', myMatches.length, ''], ['Win Rate', `${myMatches.length ? Math.round((wins / myMatches.length) * 100) : 0}%`, '']].map(([l, v, cls]) => (
                <div key={l} className="col-6">
                  <div className="stat-label">{l}</div>
                  <div className={`stat-val ${cls}`}>{v}</div>
                </div>
              ))}
            </div>
            {cat !== 'C' && (
              <div className="mt-3">
                <div className="d-flex justify-content-between" style={{ fontSize: 12, color: 'var(--txt2)', marginBottom: 4 }}>
                  <span>Progress to <strong>{nextCat}</strong></span>
                  <span>{Math.round(pct)}%</span>
                </div>
                <div className="pp-progress"><div className="pp-progress-bar" style={{ width: `${pct}%` }} /></div>
              </div>
            )}
          </div>
        </div>

        {/* Edit form */}
        <div className="col-md-6">
          <div className="pp-card h-100">
            <h5 style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, marginBottom: 16 }}>Update <span className="accent-text">Profile</span></h5>
            <form onSubmit={handleSave} noValidate>
              <div className="mb-3">
                <label className="form-label" style={{ fontSize: 13, color: 'var(--txt2)' }}>Display Name</label>
                <input className="form-control pp-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                {errors.name && <div style={{ color: '#f87171', fontSize: 12, marginTop: 4 }}>{errors.name}</div>}
              </div>
              <div className="mb-3">
                <label className="form-label" style={{ fontSize: 13, color: 'var(--txt2)' }}>Email Address</label>
                <input className="form-control pp-input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                {errors.email && <div style={{ color: '#f87171', fontSize: 12, marginTop: 4 }}>{errors.email}</div>}
              </div>
              <div className="mb-3">
                <label className="form-label" style={{ fontSize: 13, color: 'var(--txt2)' }}>New Password <span style={{ color: 'var(--txt3)' }}>(leave blank to keep current)</span></label>
                <input type="password" className="form-control pp-input" placeholder="Min 3 characters" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                {errors.password && <div style={{ color: '#f87171', fontSize: 12, marginTop: 4 }}>{errors.password}</div>}
              </div>
              {errors.server && <div style={{ color: '#f87171', fontSize: 13, marginBottom: 8 }}>{errors.server}</div>}
              <button type="submit" className="btn btn-acc btn-sm" disabled={saving}>
                {saving ? <span className="spinner-border spinner-border-sm me-2" /> : null}
                {saved ? '✓ Saved!' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Points history table */}
      <div className="pp-card">
        <h5 style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, marginBottom: 16 }}>Points <span className="accent-text">History</span></h5>
        {history.length ? (
          <div className="table-responsive">
            <table className="table pp-table mb-0">
              <thead><tr><th>Date</th><th>Event</th><th>Points</th></tr></thead>
              <tbody>
                {history.map(h => (
                  <tr key={h._id}>
                    <td style={{ color: 'var(--txt2)', fontSize: 13 }}>{h.date}</td>
                    <td style={{ fontSize: 13 }}>{h.reason}</td>
                    <td style={{ fontFamily: "'Barlow Condensed'", fontSize: 20, fontWeight: 700, color: 'var(--acc)' }}>+{h.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state"><div className="icon">📊</div><p>No points history yet. Join a tournament to get started!</p></div>
        )}
      </div>
    </div>
  )
}
