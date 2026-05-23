import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

function getCategory(pts) {
  if (pts >= 1200) return 'C'
  if (pts >= 500) return 'D'
  return 'Beginner'
}
function catClass(cat) {
  if (cat === 'C') return 'badge-c'
  if (cat === 'D') return 'badge-d'
  return 'badge-beginner'
}
function initials(name) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export default function Dashboard() {
  const { user } = useAuth()
  const [history, setHistory] = useState([])
  const [myRegs, setMyRegs] = useState([])
  const [matches, setMatches] = useState([])

  useEffect(() => {
    if (!user) return
    axios.get(`/api/users/${user.id}/history`).then(r => setHistory(r.data)).catch(() => {})
    axios.get(`/api/registrations?player=${user.id}`).then(r => setMyRegs(r.data)).catch(() => {})
    axios.get('/api/matches').then(r => setMatches(r.data)).catch(() => {})
  }, [user])

  if (!user) return null
  if (user.role === 'admin') return <Navigate to="/admin" replace />

  const cat = getCategory(user.points)
  const myMatches = matches.filter(m => m.player1?._id === user.id || m.player2?._id === user.id)
  const wins = myMatches.filter(m => m.winner?._id === user.id).length

  const nextCat = cat === 'Beginner' ? 'D' : cat === 'D' ? 'C' : null
  const ptsNeeded = cat === 'Beginner' ? 500 : cat === 'D' ? 1200 : 1200
  const pct = cat === 'C' ? 100 : cat === 'Beginner' ? Math.min(100, (user.points / 500) * 100)
    : Math.min(100, ((user.points - 500) / 700) * 100)

  return (
    <div className="container-xl py-4">
      {/* Hero */}
      <div className="pp-card-acc mb-4 position-relative overflow-hidden">
        <span className="hero-bg-text">PADEL</span>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <div style={{ fontSize: 13, color: 'var(--txt2)', marginBottom: 4 }}>Welcome back,</div>
            <h2 style={{ fontFamily: "'Barlow Condensed'", fontSize: 'clamp(28px,5vw,42px)', fontWeight: 800, marginBottom: 8 }}>{user.name}</h2>
            {user.role === 'admin'
              ? <span className="badge rounded-pill px-3 py-2" style={{ fontSize: 13, fontFamily: "'Barlow Condensed'", fontWeight: 700, background: 'var(--acc)', color: '#fff' }}>ADMIN</span>
              : <span className={`badge ${catClass(cat)} rounded-pill px-3 py-2`} style={{ fontSize: 13, fontFamily: "'Barlow Condensed'", fontWeight: 700 }}>{cat} PLAYER</span>
            }
          </div>
          <div className="text-end">
            <div className="stat-label">Total Points</div>
            <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 56, fontWeight: 800, color: 'var(--acc)', lineHeight: 1 }}>{(user.points || 0).toLocaleString()}</div>
          </div>
        </div>
        {cat !== 'C' && user.role !== 'admin' && (
          <div className="mt-3">
            <div className="d-flex justify-content-between" style={{ fontSize: 12, color: 'var(--txt2)', marginBottom: 6 }}>
              <span>Progress to <strong style={{ color: 'var(--txt)' }}>{nextCat}</strong></span>
              <span>{user.points} / {ptsNeeded} pts ({Math.round(pct)}%)</span>
            </div>
            <div className="pp-progress"><div className="pp-progress-bar" style={{ width: `${pct}%` }} /></div>
            <div style={{ fontSize: 11, color: 'var(--txt3)', marginTop: 4 }}>{ptsNeeded - user.points} points needed</div>
          </div>
        )}
        {cat === 'C' && user.role !== 'admin' && <div style={{ marginTop: 12, fontSize: 14, color: 'var(--acc)' }}>🏆 You have reached the highest category!</div>}
      </div>

      {/* Stats row */}
      <div className="row g-3 mb-4">
        {[
          ['Points', (user.points || 0).toLocaleString(), 'bi-star-fill', 'var(--acc)'],
          ['Tournaments', myRegs.length, 'bi-trophy-fill', '#fbbf24'],
          ['Matches Won', wins, 'bi-check-circle-fill', '#34d399'],
          ['Win Rate', `${myMatches.length ? Math.round((wins / myMatches.length) * 100) : 0}%`, 'bi-graph-up-arrow', '#60a5fa'],
        ].map(([label, val, icon, color]) => (
          <div key={label} className="col-6 col-lg-3">
            <div className="pp-card-sm h-100">
              <div className="d-flex align-items-center gap-2 mb-2">
                <i className={`bi ${icon}`} style={{ color, fontSize: 18 }} />
                <span className="stat-label mb-0">{label}</span>
              </div>
              <div className="stat-val">{val}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-3">
        {/* Points history */}
        <div className="col-md-6">
          <div className="pp-card h-100">
            <h5 style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, marginBottom: 16 }}>Points <span className="accent-text">History</span></h5>
            {history.length ? (
              <>
                <div className="d-flex align-items-flex-end gap-1 mb-3" style={{ height: 80 }}>
                  {history.slice(0, 8).reverse().map((h, i) => {
                    const max = Math.max(...history.slice(0, 8).map(x => x.points))
                    const pct2 = Math.round((h.points / max) * 70)
                    return <div key={i} className="flex-fill d-flex flex-column align-items-center">
                      <div className="pts-chart-bar" style={{ height: Math.max(8, pct2) }} title={`+${h.points}`} />
                      <div style={{ fontSize: 9, color: 'var(--txt3)', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 40, textAlign: 'center' }}>
                        {h.tournament?.name?.split(' ')[0] || ''}
                      </div>
                    </div>
                  })}
                </div>
                {history.slice(0, 5).map(h => (
                  <div key={h._id} className="d-flex justify-content-between align-items-center py-2" style={{ borderBottom: '1px solid var(--border)' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{h.reason}</div>
                      <div style={{ fontSize: 11, color: 'var(--txt3)' }}>{h.date}</div>
                    </div>
                    <span style={{ color: 'var(--acc)', fontWeight: 700, fontFamily: "'Barlow Condensed'", fontSize: 18 }}>+{h.points}</span>
                  </div>
                ))}
              </>
            ) : (
              <div className="empty-state"><div className="icon">📊</div><p>No points earned yet</p></div>
            )}
          </div>
        </div>

        {/* My tournaments */}
        <div className="col-md-6">
          <div className="pp-card h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, marginBottom: 0 }}>My <span className="accent-text">Tournaments</span></h5>
              <Link to="/tournaments" className="btn btn-ghost btn-sm" style={{ fontSize: 12 }}>Browse →</Link>
            </div>
            {myRegs.length ? myRegs.map(r => (
              <div key={r._id} className="d-flex justify-content-between align-items-center p-2 mb-2 rounded" style={{ background: 'var(--c3)', border: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{r.tournament?.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--txt3)', marginTop: 2 }}>
                    {r.tournament?.date} · <span className={`badge ${catClass(r.tournament?.category)} rounded-pill`} style={{ fontSize: 10 }}>{r.tournament?.category}</span>
                  </div>
                </div>
                <span className={`badge badge-${r.tournament?.status} rounded-pill`} style={{ fontSize: 11, fontFamily: "'Barlow Condensed'", fontWeight: 700, textTransform: 'uppercase' }}>{r.tournament?.status}</span>
              </div>
            )) : (
              <div className="empty-state"><div className="icon">🎾</div><p>Not registered in any tournament</p></div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
