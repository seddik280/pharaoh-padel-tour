import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

function getCategory(pts) { if (pts >= 1200) return 'C'; if (pts >= 500) return 'D'; return 'Beginner' }
function catClass(cat) { if (cat === 'C') return 'badge-c'; if (cat === 'D') return 'badge-d'; return 'badge-beginner' }
function initials(name) { return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?' }

const POINTS = { Beginner: { winner: 300, finalist: 200, semi: 120, quarter: 60 }, D: { winner: 600, finalist: 400, semi: 240, quarter: 120 }, C: { winner: 1000, finalist: 600, semi: 360, quarter: 180 } }

export default function TournamentDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const [tournament, setTournament] = useState(null)
  const [teams, setTeams] = useState([])
  const [allPlayers, setAllPlayers] = useState([])
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [isReg, setIsReg] = useState(false)
  const [myRegId, setMyRegId] = useState(null)
  const [regLoading, setRegLoading] = useState(false)
  const [showPartnerModal, setShowPartnerModal] = useState(false)
  const [partnerId, setPartnerId] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const [tr, mr, rr, ur] = await Promise.all([
        axios.get(`/api/tournaments/${id}`),
        axios.get(`/api/matches?tournament=${id}`),
        axios.get(`/api/registrations?tournament=${id}`),
        axios.get('/api/users')
      ])
      setTournament(tr.data)
      setMatches(mr.data)
      setTeams(rr.data)
      setAllPlayers(ur.data)
      if (user) {
        const myReg = rr.data.find(r => r.player?._id === user.id || r.partner?._id === user.id)
        setIsReg(!!myReg)
        setMyRegId(myReg?._id || null)
      }
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [id, user])

  // players already registered (as player or partner)
  const registeredIds = new Set(teams.flatMap(r => [r.player?._id, r.partner?._id].filter(Boolean)))
  // available partners: not already registered, not the current user
  const availablePartners = allPlayers.filter(p => p._id !== user?.id && !registeredIds.has(p._id))

  const handleRegister = async () => {
    if (!partnerId) { alert('Please select a partner'); return }
    setRegLoading(true)
    try {
      await axios.post('/api/registrations', { tournamentId: id, partnerId })
      setShowPartnerModal(false)
      setPartnerId('')
      await load()
    } catch (err) { alert(err.response?.data?.message || 'Registration failed') }
    setRegLoading(false)
  }

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel your registration?')) return
    setRegLoading(true)
    try {
      await axios.delete(`/api/registrations/${myRegId}`)
      await load()
    } catch (err) { alert(err.response?.data?.message || 'Could not cancel registration') }
    setRegLoading(false)
  }

  if (loading) return <div className="text-center py-5"><div className="spinner-border" style={{ color: 'var(--acc)' }} /></div>
  if (!tournament) return <div className="container py-5 text-center text-dim">Tournament not found</div>

  const pts = POINTS[tournament.category] || {}

  return (
    <div className="container-xl py-4">
      <Link to="/tournaments" className="btn btn-ghost btn-sm mb-3"><i className="bi bi-arrow-left me-2" />Back to Tournaments</Link>

      <div className="row g-4">
        <div className="col-lg-8">
          {/* Header */}
          <div className="pp-card mb-4">
            <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-3">
              <div>
                <h2 style={{ fontFamily: "'Barlow Condensed'", fontWeight: 800, fontSize: 36, marginBottom: 8 }}>{tournament.name}</h2>
                <div className="d-flex gap-2 align-items-center flex-wrap">
                  <span className={`badge ${catClass(tournament.category)} rounded-pill px-3 py-2`} style={{ fontSize: 13 }}>{tournament.category}</span>
                  <span className={`badge badge-${tournament.status} rounded-pill px-3 py-1`} style={{ fontSize: 12 }}>{tournament.status}</span>
                  <span style={{ fontSize: 13, color: 'var(--txt2)' }}><i className="bi bi-calendar3 me-1" />{tournament.date}</span>
                </div>
              </div>
              {user && user.role !== 'admin' && tournament.status === 'upcoming' && (
                isReg
                  ? <button className="btn btn-sm" style={{ background: 'rgba(220,53,69,.08)', border: '1px solid rgba(220,53,69,.25)', color: '#dc3545' }} onClick={handleCancel} disabled={regLoading}>
                      {regLoading ? <span className="spinner-border spinner-border-sm me-1" /> : <i className="bi bi-x-circle me-1" />}
                      Cancel Registration
                    </button>
                  : <button className="btn btn-acc btn-sm" onClick={() => setShowPartnerModal(true)} disabled={regLoading}>
                      <i className="bi bi-people-fill me-1" /> Register with Partner
                    </button>
              )}

              {/* Partner selection modal */}
              {showPartnerModal && (
                <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.6)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <div className="pp-card" style={{ width:'100%', maxWidth:420, margin:'1rem' }}>
                    <h5 style={{ fontFamily:"'Barlow Condensed'", fontWeight:700, marginBottom:16 }}>Select Your <span className="accent-text">Partner</span></h5>
                    <p style={{ fontSize:13, color:'var(--txt2)', marginBottom:12 }}>Your team category will be based on the average points of both players.</p>
                    <select className="form-select pp-input mb-3" value={partnerId} onChange={e => setPartnerId(e.target.value)}>
                      <option value="">-- Choose a partner --</option>
                      {availablePartners.map(p => (
                        <option key={p._id} value={p._id}>
                          {p.name} ({p.points} pts)
                        </option>
                      ))}
                    </select>
                    {partnerId && user && (
                      <div className="mb-3 p-2 rounded" style={{ background:'var(--c3)', fontSize:13 }}>
                        Team avg: <strong style={{ color:'var(--acc)' }}>
                          {Math.round((user.points + (allPlayers.find(p=>p._id===partnerId)?.points||0)) / 2)} pts
                        </strong>
                      </div>
                    )}
                    <div className="d-flex gap-2">
                      <button className="btn btn-acc flex-fill" onClick={handleRegister} disabled={regLoading}>
                        {regLoading ? <span className="spinner-border spinner-border-sm me-1" /> : null} Confirm
                      </button>
                      <button className="btn btn-ghost flex-fill" onClick={() => { setShowPartnerModal(false); setPartnerId('') }}>Cancel</button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="row g-3">
              {[['Teams', teams.length, 'bi-people-fill', '#60a5fa'], ['Matches', matches.length, 'bi-trophy-fill', '#fbbf24']].map(([l, v, i, c]) => (
                <div key={l} className="col-6 col-sm-3">
                  <div className="pp-card-sm text-center py-3">
                    <i className={`bi ${i} mb-2 d-block`} style={{ fontSize: 22, color: c }} />
                    <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 28, fontWeight: 700, color: 'var(--txt)' }}>{v}</div>
                    <div style={{ fontSize: 12, color: 'var(--txt3)' }}>{l}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Match Results */}
          <div className="pp-card">
            <h5 style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, marginBottom: 16 }}>Bracket / <span className="accent-text">Results</span></h5>
            {['quarter', 'semi', 'final'].map(round => {
              const roundMatches = matches.filter(m => m.round === round)
              if (!roundMatches.length) return null
              const label = round === 'quarter' ? 'Quarter-finals' : round === 'semi' ? 'Semi-finals' : 'Final'
              return (
                <div key={round} className="mb-4">
                  <div style={{ fontSize: 13, color: 'var(--txt3)', fontFamily: "'Barlow Condensed'", fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 12 }}>{label}</div>
                  {roundMatches.map(m => (
                    <div key={m._id} className="mb-2 rounded overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                      {[{ p: m.player1, w: m.winner?._id === m.player1?._id }, { p: m.player2, w: m.winner?._id === m.player2?._id }].map(({ p, w }, i) => (
                        <div key={i} className="d-flex justify-content-between align-items-center px-3 py-2" style={{
                          background: w ? 'rgba(26,158,92,.07)' : 'transparent',
                          borderBottom: i === 0 ? '1px solid var(--border)' : 'none',
                          color: w ? 'var(--acc)' : 'var(--txt2)'
                        }}>
                          <div className="d-flex align-items-center gap-2">
                            <div className="pp-avatar" style={{ width: 26, height: 26, fontSize: 10 }}>{initials(p?.name)}</div>
                            <span style={{ fontSize: 13, fontWeight: w ? 600 : 400 }}>{p?.name || 'TBD'}</span>
                          </div>
                          {w && <span style={{ fontFamily: "'Barlow Condensed'", fontWeight: 800, fontSize: 16 }}>W</span>}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )
            })}
            {!matches.length && <div className="empty-state"><div className="icon">🎾</div><p>No matches recorded yet</p></div>}
          </div>
        </div>

        <div className="col-lg-4">
          {/* Prize Points */}
          <div className="pp-card mb-4">
            <h6 style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, color: 'var(--txt2)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '.06em', fontSize: 13 }}>Prize Points</h6>
            {Object.entries({ Winner: pts.winner, Finalist: pts.finalist, 'Semi-final': pts.semi, 'Quarter-final': pts.quarter }).map(([k, v]) => (
              <div key={k} className="d-flex justify-content-between align-items-center py-2" style={{ borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                <span style={{ color: 'var(--txt2)' }}>{k}</span>
                <span style={{ color: 'var(--acc)', fontWeight: 700, fontFamily: "'Barlow Condensed'", fontSize: 18 }}>+{v}</span>
              </div>
            ))}
          </div>

          {/* Registered Teams */}
          <div className="pp-card">
            <h6 style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, color: 'var(--txt2)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '.06em', fontSize: 13 }}>
              Registered Teams ({teams.length})
            </h6>
            {teams.length ? teams.map((t, i) => (
              <div key={t._id} className="mb-2 p-2 rounded" style={{ background: 'var(--c3)', border: '1px solid var(--border)' }}>
                <div className="d-flex align-items-center justify-content-between mb-1">
                  <span style={{ fontSize: 11, color: 'var(--txt3)' }}>Team {i + 1}</span>
                  <span style={{ fontSize: 11, color: 'var(--acc)', fontFamily: "'Barlow Condensed'", fontWeight: 700 }}>avg {t.avgPoints} pts</span>
                </div>
                {[t.player, t.partner].filter(Boolean).map(p => (
                  <div key={p._id} className="d-flex align-items-center gap-2 py-1">
                    <div className="pp-avatar" style={{ width: 24, height: 24, fontSize: 9 }}>{initials(p.name)}</div>
                    <span style={{ fontSize: 12, fontWeight: 500, flex: 1 }}>{p.name}</span>
                    <span style={{ fontSize: 11, color: 'var(--txt3)' }}>{p.points} pts</span>
                  </div>
                ))}
              </div>
            )) : <div style={{ fontSize: 13, color: 'var(--txt3)' }}>No teams registered yet</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
