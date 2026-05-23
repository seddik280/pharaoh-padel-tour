import { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

function getCategory(pts) { if (pts >= 1200) return 'C'; if (pts >= 500) return 'D'; return 'Beginner' }
function catClass(cat) { if (cat === 'C') return 'badge-c'; if (cat === 'D') return 'badge-d'; return 'badge-beginner' }
function initials(name) { return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) }

export default function Leaderboard() {
  const { user } = useAuth()
  const [players, setPlayers] = useState([])
  const [matches, setMatches] = useState([])
  const [catFilter, setCatFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([axios.get('/api/users'), axios.get('/api/matches')])
      .then(([ur, mr]) => { setPlayers(ur.data); setMatches(mr.data) })
      .finally(() => setLoading(false))
  }, [])

  const filtered = catFilter === 'all' ? players : players.filter(p => getCategory(p.points) === catFilter)

  const rankIcon = i => i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`

  return (
    <div className="container-xl py-4">
      <h2 style={{ fontFamily: "'Barlow Condensed'", fontWeight: 800, fontSize: 38, marginBottom: 4 }}>
        Global <span className="accent-text">Leaderboard</span>
      </h2>
      <p className="text-dim mb-4" style={{ fontSize: 14 }}>Rankings across all Pharaoh Padel Tour players</p>

      <div className="d-flex gap-2 mb-4 flex-wrap">
        {['all', 'Beginner', 'D', 'C'].map(c => (
          <button key={c} onClick={() => setCatFilter(c)}
            className={`btn btn-sm ${catFilter === c ? 'btn-acc' : 'btn-ghost'}`}
            style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 14 }}>
            {c === 'all' ? 'All Categories' : c}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-5"><div className="spinner-border" style={{ color: 'var(--acc)' }} /></div>
      ) : !filtered.length ? (
        <div className="empty-state"><div className="icon">🏅</div><p>No players found</p></div>
      ) : (
        <>
          {/* Top 3 podium */}
          {catFilter === 'all' && filtered.length >= 3 && (
            <div className="row g-3 mb-4 justify-content-center">
              {[filtered[1], filtered[0], filtered[2]].map((p, podiumI) => {
                const rank = podiumI === 1 ? 1 : podiumI === 0 ? 2 : 3
                const height = rank === 1 ? 120 : rank === 2 ? 90 : 70
                return (
                  <div key={p._id} className="col-4 col-sm-3 text-center">
                    <div className="pp-card py-3">
                      <div className="pp-avatar mx-auto mb-2" style={{ width: 48, height: 48, fontSize: 18 }}>{initials(p.name)}</div>
                      <div style={{ fontFamily: "'Barlow Condensed'", fontSize: rank === 1 ? 32 : 24 }}>{rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}</div>
                      <div style={{ fontWeight: 600, fontSize: 13, marginTop: 4 }}>{p.name}</div>
                      <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 20, fontWeight: 700, color: 'var(--acc)' }}>{p.points.toLocaleString()}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <div className="pp-card">
            <div className="table-responsive">
              <table className="table pp-table mb-0">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Player</th>
                    <th>Category</th>
                    <th>Points</th>
                    <th className="d-none d-sm-table-cell">Matches</th>
                    <th className="d-none d-sm-table-cell">Wins</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p, i) => {
                    const pMatches = matches.filter(m => m.player1?._id === p._id || m.player2?._id === p._id)
                    const wins = pMatches.filter(m => m.winner?._id === p._id).length
                    const isMe = user && p._id === user.id
                    return (
                      <tr key={p._id} style={{ background: isMe ? 'rgba(26,158,92,.06)' : '' }}>
                        <td style={{ fontFamily: "'Barlow Condensed'", fontSize: 20, fontWeight: 700, width: 60 }}>
                          {typeof rankIcon(i) === 'string' && rankIcon(i).startsWith('#')
                            ? <span style={{ color: 'var(--txt2)' }}>{rankIcon(i)}</span>
                            : rankIcon(i)}
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <div className="pp-avatar" style={{ width: 32, height: 32, fontSize: 12 }}>{initials(p.name)}</div>
                            <span style={{ fontWeight: isMe ? 600 : 400 }}>{p.name}{isMe ? ' (you)' : ''}</span>
                          </div>
                        </td>
                        <td><span className={`badge ${catClass(getCategory(p.points))} rounded-pill`} style={{ fontSize: 11 }}>{getCategory(p.points)}</span></td>
                        <td style={{ fontFamily: "'Barlow Condensed'", fontSize: 22, fontWeight: 700, color: 'var(--acc)' }}>{p.points.toLocaleString()}</td>
                        <td className="d-none d-sm-table-cell text-dim">{pMatches.length}</td>
                        <td className="d-none d-sm-table-cell text-dim">{wins}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
