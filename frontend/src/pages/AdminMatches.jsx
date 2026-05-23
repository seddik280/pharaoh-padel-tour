import { useEffect, useState } from 'react'
import axios from 'axios'

function catClass(cat) { if (cat === 'C') return 'badge-c'; if (cat === 'D') return 'badge-d'; return 'badge-beginner' }
function initials(name) { return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?' }

export default function AdminMatches() {
  const [matches, setMatches] = useState([])
  const [tournaments, setTournaments] = useState([])
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ tournament: '', player1: '', player2: '', winner: '', round: 'quarter' })
  const [formErrors, setFormErrors] = useState({})
  const [adding, setAdding] = useState(false)
  const [tournamentFilter, setTournamentFilter] = useState('all')

  const load = async () => {
    setLoading(true)
    const [mr, tr, rr] = await Promise.all([
      axios.get('/api/matches'),
      axios.get('/api/tournaments'),
      axios.get('/api/registrations')
    ])
    setMatches(mr.data)
    setTournaments(tr.data)
    setRegistrations(rr.data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const playersForTournament = tid => {
    const regs = registrations.filter(r => r.tournament?._id === tid || r.tournament === tid)
    const seen = new Set()
    const players = []
    regs.forEach(r => {
      [r.player, r.partner].filter(Boolean).forEach(p => {
        if (!seen.has(p._id)) { seen.add(p._id); players.push(p) }
      })
    })
    return players
  }

  const validateForm = () => {
    const e = {}
    if (!form.tournament) e.tournament = 'Select a tournament'
    if (!form.player1) e.player1 = 'Select player 1'
    if (!form.player2) e.player2 = 'Select player 2'
    else if (form.player1 === form.player2) e.player2 = 'Players must be different'
    if (!form.winner) e.winner = 'Select a winner'
    return e
  }

  const handleAdd = async () => {
    const e2 = validateForm()
    if (Object.keys(e2).length) { setFormErrors(e2); return }
    setAdding(true)
    try {
      await axios.post('/api/matches', form)
      setShowAdd(false); setForm({ tournament: '', player1: '', player2: '', winner: '', round: 'quarter' })
      await load()
    } catch (err) {
      setFormErrors({ server: err.response?.data?.message || 'Failed to add match' })
    } finally { setAdding(false) }
  }

  const filteredMatches = tournamentFilter === 'all'
    ? matches
    : matches.filter(m => m.tournament?._id === tournamentFilter)

  const roundLabel = r => r === 'quarter' ? 'Quarter-final' : r === 'semi' ? 'Semi-final' : 'Final'
  const roundCls = r => r === 'final' ? 'rgba(26,158,92,.12)' : r === 'semi' ? 'rgba(245,158,11,.15)' : 'rgba(59,130,246,.15)'
  const roundCol = r => r === 'final' ? 'var(--acc)' : r === 'semi' ? '#fbbf24' : '#60a5fa'

  const currentPlayers = form.tournament ? playersForTournament(form.tournament) : []

  // build team label: "Player Name (w/ Partner Name)"
  const teamLabel = (playerId, tid) => {
    const player = currentPlayers.find(p => p._id === playerId)
    if (!player) return ''
    const reg = registrations.find(r =>
      (r.tournament?._id === tid || r.tournament === tid) &&
      (r.player?._id === playerId || r.partner?._id === playerId)
    )
    if (!reg) return player.name
    const partnerObj = reg.player?._id === playerId ? reg.partner : reg.player
    return partnerObj ? `${player.name} (w/ ${partnerObj.name})` : player.name
  }

  return (
    <div className="container-xl py-4">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <div>
          <h2 style={{ fontFamily: "'Barlow Condensed'", fontWeight: 800, fontSize: 38, marginBottom: 4 }}>
            Admin — <span className="accent-text">Matches</span>
          </h2>
          <p className="text-dim mb-0">Record and view all match results</p>
        </div>
        <button className="btn btn-acc" onClick={() => setShowAdd(true)}><i className="bi bi-plus-lg me-2" />Add Match Result</button>
      </div>

      {/* Filter by tournament */}
      <div className="pp-card mb-3">
        <select className="form-select pp-select" value={tournamentFilter} onChange={e => setTournamentFilter(e.target.value)}>
          <option value="all">All Tournaments</option>
          {tournaments.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
        </select>
      </div>

      {/* Add Match Modal */}
      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          onClick={() => setShowAdd(false)}>
          <div className="pp-card" style={{ maxWidth: 480, width: '100%', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <h5 style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, marginBottom: 16 }}>Add Match Result</h5>

            <div className="mb-3">
              <label className="form-label" style={{ fontSize: 13, color: 'var(--txt2)' }}>Tournament</label>
              <select className="form-select pp-select" value={form.tournament}
                onChange={e => setForm({ ...form, tournament: e.target.value, player1: '', player2: '', winner: '' })}>
                <option value="">Select tournament...</option>
                {tournaments.filter(t => t.status === 'active').map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
              </select>
              {formErrors.tournament && <div style={{ color: '#f87171', fontSize: 12, marginTop: 4 }}>{formErrors.tournament}</div>}
            </div>

            <div className="mb-3">
              <label className="form-label" style={{ fontSize: 13, color: 'var(--txt2)' }}>Round</label>
              <select className="form-select pp-select" value={form.round} onChange={e => setForm({ ...form, round: e.target.value })}>
                <option value="quarter">Quarter-final</option>
                <option value="semi">Semi-final</option>
                <option value="final">Final</option>
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label" style={{ fontSize: 13, color: 'var(--txt2)' }}>Team 1</label>
              <select className="form-select pp-select" value={form.player1}
                onChange={e => setForm({ ...form, player1: e.target.value, winner: '' })}>
                <option value="">Select player...</option>
                {currentPlayers.map(p => <option key={p._id} value={p._id}>{teamLabel(p._id, form.tournament)}</option>)}
              </select>
              {formErrors.player1 && <div style={{ color: '#f87171', fontSize: 12, marginTop: 4 }}>{formErrors.player1}</div>}
            </div>

            <div className="mb-3">
              <label className="form-label" style={{ fontSize: 13, color: 'var(--txt2)' }}>Team 2</label>
              <select className="form-select pp-select" value={form.player2}
                onChange={e => setForm({ ...form, player2: e.target.value, winner: '' })}>
                <option value="">Select team...</option>
                {currentPlayers.filter(p => p._id !== form.player1).map(p => <option key={p._id} value={p._id}>{teamLabel(p._id, form.tournament)}</option>)}
              </select>
              {formErrors.player2 && <div style={{ color: '#f87171', fontSize: 12, marginTop: 4 }}>{formErrors.player2}</div>}
            </div>

            <div className="mb-3">
              <label className="form-label" style={{ fontSize: 13, color: 'var(--txt2)' }}>Winner</label>
              <select className="form-select pp-select" value={form.winner} onChange={e => setForm({ ...form, winner: e.target.value })}>
                <option value="">Select winner...</option>
                {[form.player1, form.player2].filter(Boolean).map(pid => {
                  const label = teamLabel(pid, form.tournament)
                  return label ? <option key={pid} value={pid}>{label}</option> : null
                })}
              </select>
              {formErrors.winner && <div style={{ color: '#f87171', fontSize: 12, marginTop: 4 }}>{formErrors.winner}</div>}
            </div>

            {formErrors.server && <div style={{ color: '#f87171', fontSize: 13, marginBottom: 8 }}>{formErrors.server}</div>}
            <div className="d-flex gap-2">
              <button className="btn btn-ghost flex-fill" onClick={() => setShowAdd(false)}>Cancel</button>
              <button className="btn btn-acc flex-fill" onClick={handleAdd} disabled={adding}>
                {adding ? <span className="spinner-border spinner-border-sm me-2" /> : null}Save Match
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-5"><div className="spinner-border" style={{ color: 'var(--acc)' }} /></div>
      ) : !filteredMatches.length ? (
        <div className="empty-state"><div className="icon">🎾</div><p>No matches recorded</p></div>
      ) : (
        <div className="pp-card">
          <div className="table-responsive">
            <table className="table pp-table mb-0">
              <thead>
                <tr><th>Tournament</th><th>Round</th><th>Team 1</th><th>Team 2</th><th>Winner</th></tr>
              </thead>
              <tbody>
                {filteredMatches.map(m => (
                  <tr key={m._id}>
                    <td style={{ fontWeight: 500, fontSize: 13 }}>
                      {m.tournament?.name}
                      {m.tournament?.category && <span className={`badge ${catClass(m.tournament.category)} rounded-pill ms-2`} style={{ fontSize: 10 }}>{m.tournament.category}</span>}
                    </td>
                    <td>
                      <span className="rounded-pill px-2 py-1" style={{ fontSize: 11, fontWeight: 700, background: roundCls(m.round), color: roundCol(m.round) }}>
                        {roundLabel(m.round)}
                      </span>
                    </td>
                    <td style={{ color: m.winner?._id === m.player1?._id ? 'var(--acc)' : 'var(--txt2)', fontWeight: m.winner?._id === m.player1?._id ? 600 : 400, fontSize: 13 }}>
                      <div className="d-flex align-items-center gap-2">
                        <div className="pp-avatar" style={{ width: 24, height: 24, fontSize: 9 }}>{initials(m.player1?.name)}</div>
                        {m.player1?.name}
                        {m.winner?._id === m.player1?._id && <i className="bi bi-trophy-fill" style={{ color: '#fbbf24', fontSize: 12 }} />}
                      </div>
                    </td>
                    <td style={{ color: m.winner?._id === m.player2?._id ? 'var(--acc)' : 'var(--txt2)', fontWeight: m.winner?._id === m.player2?._id ? 600 : 400, fontSize: 13 }}>
                      <div className="d-flex align-items-center gap-2">
                        <div className="pp-avatar" style={{ width: 24, height: 24, fontSize: 9 }}>{initials(m.player2?.name)}</div>
                        {m.player2?.name}
                        {m.winner?._id === m.player2?._id && <i className="bi bi-trophy-fill" style={{ color: '#fbbf24', fontSize: 12 }} />}
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div className="pp-avatar" style={{ width: 26, height: 26, fontSize: 10 }}>{initials(m.winner?.name)}</div>
                        <span style={{ color: 'var(--acc)', fontWeight: 600, fontSize: 13 }}>{m.winner?.name}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
