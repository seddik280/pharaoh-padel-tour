import { useEffect, useState } from 'react'
import axios from 'axios'

function getCategory(pts) { if (pts >= 1200) return 'C'; if (pts >= 500) return 'D'; return 'Beginner' }
function catClass(cat) { if (cat === 'C') return 'badge-c'; if (cat === 'D') return 'badge-d'; return 'badge-beginner' }
function initials(name) { return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) }

export default function AdminPlayers() {
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [awardForm, setAwardForm] = useState({ points: '', reason: '' })
  const [awardErrors, setAwardErrors] = useState({})
  const [awarding, setAwarding] = useState(false)
  const [showModal, setShowModal] = useState(false)

  const load = async () => {
    setLoading(true)
    const r = await axios.get('/api/users')
    setPlayers(r.data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const filtered = players.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase())
  )

  const openAward = p => { setSelected(p); setAwardForm({ points: '', reason: '' }); setAwardErrors({}); setShowModal(true) }

  const validateAward = () => {
    const e = {}
    if (!awardForm.points || isNaN(awardForm.points) || Number(awardForm.points) <= 0) e.points = 'Enter a valid positive number'
    if (!awardForm.reason.trim()) e.reason = 'Reason is required'
    return e
  }

  const handleAward = async () => {
    const e2 = validateAward()
    if (Object.keys(e2).length) { setAwardErrors(e2); return }
    setAwarding(true)
    try {
      await axios.post(`/api/users/${selected._id}/award`, { points: Number(awardForm.points), reason: awardForm.reason })
      setShowModal(false)
      await load()
    } catch (err) {
      setAwardErrors({ server: err.response?.data?.message || 'Failed to award points' })
    } finally { setAwarding(false) }
  }

  return (
    <div className="container-xl py-4">
      <h2 style={{ fontFamily: "'Barlow Condensed'", fontWeight: 800, fontSize: 38, marginBottom: 4 }}>
        Admin — <span className="accent-text">Players</span>
      </h2>
      <p className="text-dim mb-4">Manage all registered players and award points manually</p>

      <div className="pp-card mb-3">
        <input className="form-control pp-input" placeholder="🔍  Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="text-center py-5"><div className="spinner-border" style={{ color: 'var(--acc)' }} /></div>
      ) : (
        <div className="pp-card">
          <div className="table-responsive">
            <table className="table pp-table mb-0">
              <thead>
                <tr><th>Player</th><th>Email</th><th>Category</th><th>Points</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p._id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div className="pp-avatar" style={{ width: 32, height: 32, fontSize: 12 }}>{initials(p.name)}</div>
                        <span style={{ fontWeight: 500 }}>{p.name}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--txt2)', fontSize: 13 }}>{p.email}</td>
                    <td><span className={`badge ${catClass(getCategory(p.points))} rounded-pill`} style={{ fontSize: 11 }}>{getCategory(p.points)}</span></td>
                    <td style={{ fontFamily: "'Barlow Condensed'", fontSize: 20, fontWeight: 700, color: 'var(--acc)' }}>{p.points}</td>
                    <td>
                      <button className="btn btn-sm" style={{ background: 'rgba(59,130,246,.15)', border: '1px solid rgba(59,130,246,.3)', color: '#60a5fa', fontSize: 12 }} onClick={() => openAward(p)}>
                        <i className="bi bi-plus-circle me-1" />Award Pts
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Award Points Modal */}
      {showModal && selected && (
        <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          onClick={() => setShowModal(false)}>
          <div className="pp-card" style={{ maxWidth: 440, width: '100%' }} onClick={e => e.stopPropagation()}>
            <h5 style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, marginBottom: 16 }}>Award Points — {selected.name}</h5>
            <div className="mb-3 p-2 rounded d-flex justify-content-between" style={{ background: 'var(--c3)' }}>
              <span style={{ color: 'var(--txt2)', fontSize: 13 }}>Current points</span>
              <span style={{ fontFamily: "'Barlow Condensed'", fontSize: 22, fontWeight: 700, color: 'var(--acc)' }}>{selected.points}</span>
            </div>
            <div className="mb-3">
              <label className="form-label" style={{ fontSize: 13, color: 'var(--txt2)' }}>Points to Award</label>
              <input type="number" className="form-control pp-input" placeholder="e.g. 300" min="1"
                value={awardForm.points} onChange={e => setAwardForm({ ...awardForm, points: e.target.value })} />
              {awardErrors.points && <div style={{ color: '#f87171', fontSize: 12, marginTop: 4 }}>{awardErrors.points}</div>}
            </div>
            <div className="mb-3">
              <label className="form-label" style={{ fontSize: 13, color: 'var(--txt2)' }}>Reason</label>
              <input className="form-control pp-input" placeholder="e.g. Special achievement"
                value={awardForm.reason} onChange={e => setAwardForm({ ...awardForm, reason: e.target.value })} />
              {awardErrors.reason && <div style={{ color: '#f87171', fontSize: 12, marginTop: 4 }}>{awardErrors.reason}</div>}
            </div>
            {awardErrors.server && <div style={{ color: '#f87171', fontSize: 13, marginBottom: 8 }}>{awardErrors.server}</div>}
            <div className="d-flex gap-2">
              <button className="btn btn-ghost flex-fill" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-acc flex-fill" onClick={handleAward} disabled={awarding}>
                {awarding ? <span className="spinner-border spinner-border-sm me-2" /> : null}Award
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
