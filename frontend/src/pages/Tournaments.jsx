import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

function getCategory(pts) { if (pts >= 1200) return 'C'; if (pts >= 500) return 'D'; return 'Beginner' }
function catClass(cat) { if (cat === 'C') return 'badge-c'; if (cat === 'D') return 'badge-d'; return 'badge-beginner' }

export default function Tournaments() {
  const { user } = useAuth()
  const [tournaments, setTournaments] = useState([])
  const [registrations, setRegistrations] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [regLoading, setRegLoading] = useState(null)

  const load = async () => {
    setLoading(true)
    const [tr, rr] = await Promise.all([
      axios.get('/api/tournaments'),
      user ? axios.get(`/api/registrations?player=${user.id}`) : Promise.resolve({ data: [] })
    ])
    setTournaments(tr.data)
    setRegistrations(rr.data)
    setLoading(false)
  }

  useEffect(() => { load() }, [user])

  const isRegistered = tid => registrations.some(r => r.tournament?._id === tid || r.tournament === tid)

  const canRegister = t => {
    if (!user || user.role === 'admin' || t.status !== 'upcoming' || isRegistered(t._id)) return null
    const cat = getCategory(user.points)
    const order = ['Beginner', 'D', 'C']
    if (order.indexOf(cat) > order.indexOf(t.category)) return { ok: false, reason: `${cat} players cannot join ${t.category}` }
    return { ok: true }
  }

  const handleRegister = async tid => {
    setRegLoading(tid)
    try {
      await axios.post('/api/registrations', { tournamentId: tid })
      await load()
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed')
    } finally {
      setRegLoading(null)
    }
  }

  const filtered = filter === 'all' ? tournaments : tournaments.filter(t => t.status === filter)

  return (
    <div className="container-xl py-4">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <h2 style={{ fontFamily: "'Barlow Condensed'", fontWeight: 800, fontSize: 38, marginBottom: 0 }}>
          <span className="accent-text">Tournaments</span>
        </h2>
        {user?.role === 'admin' && <Link to="/admin/tournaments" className="btn btn-acc btn-sm">+ New Tournament</Link>}
      </div>

      {/* Filter tabs */}
      <div className="d-flex gap-2 mb-4 flex-wrap">
        {['all', 'upcoming', 'active', 'completed'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`btn btn-sm ${filter === s ? 'btn-acc' : 'btn-ghost'}`}
            style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, textTransform: 'capitalize', fontSize: 14 }}>{s}</button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-5"><div className="spinner-border" style={{ color: 'var(--acc)' }} /></div>
      ) : !filtered.length ? (
        <div className="empty-state"><div className="icon">🏆</div><p>No tournaments found</p></div>
      ) : (
        <div className="row g-3">
          {filtered.map(t => {
            const reg = canRegister(t)
            const already = isRegistered(t._id)
            return (
              <div key={t._id} className="col-sm-6 col-xl-4">
                <div className="pp-card h-100 d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <span className={`badge ${catClass(t.category)} rounded-pill px-3 py-2`} style={{ fontSize: 12, fontFamily: "'Barlow Condensed'", fontWeight: 700 }}>{t.category}</span>
                    <span className={`badge badge-${t.status} rounded-pill px-3 py-1`} style={{ fontSize: 11 }}>{t.status}</span>
                  </div>
                  <h4 style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 24, flex: 1 }}>{t.name}</h4>
                  <div style={{ color: 'var(--txt2)', fontSize: 13, marginBottom: 4 }}><i className="bi bi-calendar3 me-2" />{t.date}</div>
                  <div className="d-flex gap-2 mt-3">
                    <Link to={`/tournaments/${t._id}`} className="btn btn-ghost btn-sm flex-fill">View Details</Link>
                    {already ? (
                      <span className="btn btn-sm flex-fill" style={{ background: 'rgba(26,158,92,.08)', border: '1px solid rgba(26,158,92,.2)', color: 'var(--acc2)', pointerEvents: 'none' }}>✓ Registered</span>
                    ) : reg ? (
                      <button
                        className={`btn btn-sm flex-fill ${reg.ok ? 'btn-acc' : 'btn-ghost'}`}
                        disabled={!reg.ok || regLoading === t._id}
                        onClick={() => reg.ok && handleRegister(t._id)}
                        title={!reg.ok ? reg.reason : ''}
                      >
                        {regLoading === t._id ? <span className="spinner-border spinner-border-sm" /> : reg.ok ? 'Register' : 'Ineligible'}
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
