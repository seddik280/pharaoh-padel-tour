import { Link, NavLink, useNavigate } from 'react-router-dom'
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

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <nav className="navbar navbar-expand-lg pp-navbar sticky-top" style={{ padding: '0 1rem', height: '58px' }}>
      <div className="container-xl d-flex align-items-center">
        {/* Brand */}
        <Link to="/" className="navbar-brand me-4" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <img src="/pharaoh-logo.svg" alt="Pharaoh Padel Tour" style={{ width: 36, height: 36 }} />
          <span style={{ fontFamily: "'Barlow Condensed'", fontSize: 20, fontWeight: 800, letterSpacing: '.04em', lineHeight: 1 }}>
            <span style={{ color: 'var(--acc)' }}>PHARAOH</span><br />
            <span style={{ color: 'var(--txt)', fontWeight: 400, fontSize: 13, letterSpacing: '.08em' }}>PADEL TOUR</span>
          </span>
        </Link>

        {/* Toggler */}
        <button className="navbar-toggler border-0 ms-auto me-2" type="button" data-bs-toggle="collapse" data-bs-target="#ppNav" style={{ color: 'var(--txt2)' }}>
          <i className="bi bi-list" style={{ fontSize: 24 }} />
        </button>

        <div className="collapse navbar-collapse" id="ppNav">
          <ul className="navbar-nav me-auto gap-1">
            {user && <li className="nav-item"><NavLink to="/dashboard" className={({ isActive }) => `nav-link pp-nav-link${isActive ? ' active-link' : ''}`}>Dashboard</NavLink></li>}
            <li className="nav-item"><NavLink to="/tournaments" className={({ isActive }) => `nav-link pp-nav-link${isActive ? ' active-link' : ''}`}>Tournaments</NavLink></li>
            <li className="nav-item"><NavLink to="/leaderboard" className={({ isActive }) => `nav-link pp-nav-link${isActive ? ' active-link' : ''}`}>Leaderboard</NavLink></li>
            {user?.role === 'admin' && (
              <li className="nav-item dropdown">
                <a className="nav-link pp-nav-link dropdown-toggle" data-bs-toggle="dropdown" href="#">Admin</a>
                <ul className="dropdown-menu pp-navbar">
                  <li><Link className="dropdown-item" to="/admin">Dashboard</Link></li>
                  <li><Link className="dropdown-item" to="/admin/players">Players</Link></li>
                  <li><Link className="dropdown-item" to="/admin/tournaments">Tournaments</Link></li>
                  <li><Link className="dropdown-item" to="/admin/matches">Matches</Link></li>
                </ul>
              </li>
            )}
          </ul>

          <div className="d-flex align-items-center gap-2">
            {user ? (
              <>
                <div className="d-flex align-items-center gap-2">
                  <div className="pp-avatar" style={{ width: 34, height: 34, fontSize: 13 }}>{initials(user.name)}</div>
                  <div className="d-none d-md-flex flex-column align-items-start" style={{ lineHeight: 1.2 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{user.name}</span>
                    {user.role !== 'admin'
                      ? <span className={`badge rounded-pill ${catClass(getCategory(user.points))}`} style={{ fontSize: 10 }}>{getCategory(user.points)}</span>
                      : <span style={{ fontSize: 11, color: 'var(--acc)' }}>ADMIN</span>}
                  </div>
                </div>
                <NavLink to="/profile" className={({ isActive }) => `nav-link pp-nav-link${isActive ? ' active-link' : ''}`} style={{ fontSize: 13 }}>Profile</NavLink>
                <button className="btn btn-ghost btn-sm" onClick={handleLogout} style={{ fontSize: 12 }}>Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
                <Link to="/register" className="btn btn-acc btn-sm">Register</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
