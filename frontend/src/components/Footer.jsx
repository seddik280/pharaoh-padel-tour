import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer style={{ background: 'var(--c2)', borderTop: '1px solid var(--border)', padding: '1.5rem 0', marginTop: 'auto' }}>
      <div className="container-xl">
        <div className="row align-items-center">
          <div className="col-md-4 mb-2 mb-md-0">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <img src="/pharaoh-logo.svg" alt="Pharaoh Padel Tour" style={{ width: 32, height: 32 }} />
              <span style={{ fontFamily: "'Barlow Condensed'", fontWeight: 800, lineHeight: 1.1 }}>
                <span style={{ display: 'block', fontSize: 18, color: 'var(--acc)' }}>PHARAOH</span>
                <span style={{ display: 'block', fontSize: 11, color: 'var(--txt2)', fontWeight: 400, letterSpacing: '.08em' }}>PADEL TOUR</span>
              </span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--txt3)', marginTop: 4, marginBottom: 0 }}>
              Tournament Management Platform
            </p>
          </div>
          <div className="col-md-4 text-md-center mb-2 mb-md-0">
            <div className="d-flex justify-content-center gap-3">
              <Link to="/" style={{ fontSize: 13, color: 'var(--txt3)', textDecoration: 'none' }}>Home</Link>
              <Link to="/tournaments" style={{ fontSize: 13, color: 'var(--txt3)', textDecoration: 'none' }}>Tournaments</Link>
              <Link to="/leaderboard" style={{ fontSize: 13, color: 'var(--txt3)', textDecoration: 'none' }}>Leaderboard</Link>
            </div>
          </div>
          <div className="col-md-4 text-md-end">
            <span style={{ fontSize: 12, color: 'var(--txt3)' }}>
              © {new Date().getFullYear()} Pharaoh Padel Tour. All rights reserved.
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
