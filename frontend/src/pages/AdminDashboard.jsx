import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

function getCategory(pts) { if (pts >= 1200) return 'C'; if (pts >= 500) return 'D'; return 'Beginner' }
function catClass(cat) { if (cat === 'C') return 'badge-c'; if (cat === 'D') return 'badge-d'; return 'badge-beginner' }

export default function AdminDashboard() {
  const [players, setPlayers] = useState([])
  const [tournaments, setTournaments] = useState([])
  const [matches, setMatches] = useState([])
  const [history, setHistory] = useState([])

  useEffect(() => {
    axios.get('/api/users').then(r => setPlayers(r.data))
    axios.get('/api/tournaments').then(r => setTournaments(r.data))
    axios.get('/api/matches').then(r => setMatches(r.data))
    axios.get('/api/users/me').then(() => {}).catch(() => {})
    // load some history via registrations
  }, [])

  const cats = ['Beginner', 'D', 'C'].map(c => ({
    cat: c, count: players.filter(p => getCategory(p.points) === c).length
  }))
  const totalPts = players.reduce((s, p) => s + p.points, 0)

  const adminLinks = [
    { to: '/admin/players', label: 'Manage Players', icon: 'bi-people-fill', color: '#60a5fa', desc: 'View all players, award points manually' },
    { to: '/admin/tournaments', label: 'Manage Tournaments', icon: 'bi-trophy-fill', color: '#fbbf24', desc: 'Create tournaments, update status, complete with points' },
    { to: '/admin/matches', label: 'Manage Matches', icon: 'bi-journal-text', color: '#34d399', desc: 'View all match results across tournaments' },
  ]

  return (
    <div className="container-xl py-4">
      <h2 style={{ fontFamily: "'Barlow Condensed'", fontWeight: 800, fontSize: 38, marginBottom: 4 }}>
        Admin <span className="accent-text">Dashboard</span>
      </h2>
      <p className="text-dim mb-4">Platform overview and management tools</p>

      {/* Stats */}
      <div className="row g-3 mb-4">
        {[
          ['Players', players.length, 'bi-people-fill', '#60a5fa'],
          ['Tournaments', tournaments.length, 'bi-trophy-fill', '#fbbf24'],
          ['Matches', matches.length, 'bi-journal-text', '#34d399'],
          ['Total Points Awarded', totalPts.toLocaleString(), 'bi-star-fill', 'var(--acc)'],
        ].map(([l, v, i, c]) => (
          <div key={l} className="col-6 col-lg-3">
            <div className="pp-card-sm">
              <div className="d-flex align-items-center gap-2 mb-2">
                <i className={`bi ${i}`} style={{ color: c, fontSize: 20 }} />
                <span className="stat-label mb-0">{l}</span>
              </div>
              <div className="stat-val">{v}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-3 mb-4">
        {/* Category breakdown */}
        <div className="col-md-6">
          <div className="pp-card h-100">
            <h5 style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, marginBottom: 16 }}>Category <span className="accent-text">Breakdown</span></h5>
            {cats.map(({ cat, count }) => {
              const pct = players.length ? Math.round((count / players.length) * 100) : 0
              return (
                <div key={cat} className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className={`badge ${catClass(cat)} rounded-pill px-3 py-2`} style={{ fontSize: 12 }}>{cat}</span>
                    <span style={{ fontSize: 13, color: 'var(--txt2)' }}>{count} players ({pct}%)</span>
                  </div>
                  <div className="pp-progress"><div className="pp-progress-bar" style={{ width: `${pct}%` }} /></div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Quick actions */}
        <div className="col-md-6">
          <div className="pp-card h-100">
            <h5 style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, marginBottom: 16 }}>Quick <span className="accent-text">Actions</span></h5>
            {adminLinks.map(({ to, label, icon, color, desc }) => (
              <Link key={to} to={to} style={{ textDecoration: 'none' }}>
                <div className="d-flex align-items-center gap-3 p-2 mb-2 rounded" style={{ background: 'var(--c3)', border: '1px solid var(--border)', transition: '.2s', cursor: 'pointer' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 8, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <i className={`bi ${icon}`} style={{ color, fontSize: 18 }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--txt)' }}>{label}</div>
                    <div style={{ fontSize: 12, color: 'var(--txt3)' }}>{desc}</div>
                  </div>
                  <i className="bi bi-chevron-right ms-auto" style={{ color: 'var(--txt3)' }} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent tournaments */}
      <div className="pp-card">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, marginBottom: 0 }}>Recent <span className="accent-text">Tournaments</span></h5>
          <Link to="/admin/tournaments" className="btn btn-ghost btn-sm" style={{ fontSize: 12 }}>Manage →</Link>
        </div>
        {tournaments.length ? (
          <div className="table-responsive">
            <table className="table pp-table mb-0">
              <thead><tr><th>Name</th><th>Category</th><th>Date</th><th>Status</th></tr></thead>
              <tbody>
                {tournaments.slice(0, 5).map(t => (
                  <tr key={t._id}>
                    <td style={{ fontWeight: 600 }}>{t.name}</td>
                    <td><span className={`badge ${catClass(t.category)} rounded-pill`} style={{ fontSize: 11 }}>{t.category}</span></td>
                    <td style={{ color: 'var(--txt2)', fontSize: 13 }}>{t.date}</td>
                    <td><span className={`badge badge-${t.status} rounded-pill`} style={{ fontSize: 11 }}>{t.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <div className="empty-state"><div className="icon">🏆</div><p>No tournaments yet</p></div>}
      </div>
    </div>
  )
}
