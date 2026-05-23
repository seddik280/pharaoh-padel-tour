import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Home() {
  const { user } = useAuth()
  return (
    <div>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, #f4faf7 0%, #e8f5ef 60%, #d6f0e4 100%)', padding: '6rem 0 4rem', position: 'relative', overflow: 'hidden' }}>
        <div className="court-lines" />
        <div style={{ position: 'absolute', right: '-20px', top: '-20px', fontFamily: "'Barlow Condensed'", fontSize: 180, fontWeight: 800, color: 'rgba(26,158,92,.05)', lineHeight: 1, pointerEvents: 'none' }}>PADEL</div>
        <div className="container-xl">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <img src="/pharaoh-logo.svg" alt="Pharaoh Padel Tour" style={{ width: 48, height: 48 }} />
                <span className="badge badge-acc rounded-pill px-3 py-2" style={{ fontSize: 12, fontWeight: 700 }}>🏆 Official Tournament Platform</span>
              </div>
              <h1 style={{ fontFamily: "'Barlow Condensed'", fontSize: 'clamp(48px,8vw,80px)', fontWeight: 800, lineHeight: 1, marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--acc)' }}>PHARAOH</span><br />PADEL TOUR
              </h1>
              <p style={{ fontSize: 16, color: 'var(--txt2)', marginBottom: '0.5rem', fontFamily: "'Barlow Condensed'", letterSpacing: '.06em', fontWeight: 600 }}>COMPETE. RANK UP. DOMINATE.</p>
              <p style={{ fontSize: 17, color: 'var(--txt2)', marginBottom: '2rem', maxWidth: 480 }}>
                Join Pharaoh Padel Tour — the ultimate tournament management platform for padel players of all levels. Track your points, climb the leaderboard, and prove yourself.
              </p>
              <div className="d-flex gap-3 flex-wrap">
                {user
                  ? <Link to="/dashboard" className="btn btn-acc px-4 py-2" style={{ fontSize: 16 }}>Go to Dashboard</Link>
                  : <>
                    <Link to="/register" className="btn btn-acc px-4 py-2" style={{ fontSize: 16 }}>Get Started Free</Link>
                    <Link to="/tournaments" className="btn btn-ghost px-4 py-2" style={{ fontSize: 16 }}>Browse Tournaments</Link>
                  </>}
              </div>
            </div>
            <div className="col-lg-6 mt-4 mt-lg-0">
              <div className="row g-3">
                {[['🏆', '50+', 'Tournaments'],['👥', '200+', 'Players'],['🎯', '3', 'Categories'],['⚡', '1000', 'Max Points']].map(([icon, val, label]) => (
                  <div key={label} className="col-6">
                    <div className="pp-card text-center py-4">
                      <div style={{ fontSize: 36, marginBottom: 8 }}>{icon}</div>
                      <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 40, fontWeight: 800, color: 'var(--acc2)', lineHeight: 1 }}>{val}</div>
                      <div style={{ fontSize: 14, color: 'var(--txt2)', marginTop: 4 }}>{label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section style={{ padding: '4rem 0', background: 'var(--c1)' }}>
        <div className="container-xl">
          <h2 className="text-center mb-2" style={{ fontFamily: "'Barlow Condensed'", fontSize: 42, fontWeight: 800 }}>PLAYER <span className="accent-text">CATEGORIES</span></h2>
          <p className="text-center text-dim mb-4">Progress through the ranks as you earn points</p>
          <div className="row g-3">
            {[
              { cat: 'Beginner', cls: 'badge-beginner', pts: '0 – 499', icon: '🔵', desc: 'Starting your padel journey. Learn, compete, and earn your first points.', prizes: { Winner: 300, Finalist: 200, 'Semi-final': 120, 'Quarter-final': 60 } },
              { cat: 'D', cls: 'badge-d', pts: '500 – 1199', icon: '🟡', desc: 'Intermediate players with solid technique and competitive experience.', prizes: { Winner: 600, Finalist: 400, 'Semi-final': 240, 'Quarter-final': 120 } },
              { cat: 'C', cls: 'badge-c', pts: '1200+', icon: '🔴', desc: 'Elite-level players. The top tier of Pharaoh Padel Tour competition.', prizes: { Winner: 1000, Finalist: 600, 'Semi-final': 360, 'Quarter-final': 180 } },
            ].map(({ cat, cls, pts, icon, desc, prizes }) => (
              <div key={cat} className="col-md-4">
                <div className="pp-card h-100">
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <span style={{ fontSize: 28 }}>{icon}</span>
                    <span className={`badge ${cls} rounded-pill px-3 py-2`} style={{ fontSize: 14, fontFamily: "'Barlow Condensed'", fontWeight: 700 }}>{cat}</span>
                    <span style={{ fontSize: 13, color: 'var(--txt3)', marginLeft: 'auto' }}>{pts} pts</span>
                  </div>
                  <p style={{ fontSize: 14, color: 'var(--txt2)', marginBottom: '1rem' }}>{desc}</p>
                  <div style={{ fontSize: 12, color: 'var(--txt3)', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em' }}>Prize Points</div>
                  {Object.entries(prizes).map(([k, v]) => (
                    <div key={k} className="d-flex justify-content-between" style={{ fontSize: 13, padding: '4px 0', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ color: 'var(--txt2)' }}>{k}</span>
                      <span style={{ color: 'var(--acc)', fontWeight: 700, fontFamily: "'Barlow Condensed'", fontSize: 16 }}>+{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: '4rem 0' }}>
        <div className="container-xl">
          <h2 className="text-center mb-4" style={{ fontFamily: "'Barlow Condensed'", fontSize: 42, fontWeight: 800 }}>HOW IT <span className="accent-text">WORKS</span></h2>
          <div className="row g-4">
            {[
              ['1', 'Register', 'Create your account and join the platform as a Beginner player.', '📝'],
              ['2', 'Join Tournaments', 'Sign up for tournaments that match your skill category.', '🏆'],
              ['3', 'Compete & Win', 'Play matches, win rounds, and earn points for every result.', '🎾'],
              ['4', 'Rank Up', 'Accumulate points to advance from Beginner → D → C category.', '⚡'],
            ].map(([n, title, desc, icon]) => (
              <div key={n} className="col-sm-6 col-lg-3 text-center">
                <div className="pp-card-sm py-4 h-100">
                  <div style={{ fontSize: 40, marginBottom: 12 }}>{icon}</div>
                  <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 52, fontWeight: 800, color: 'rgba(26,158,92,.18)', lineHeight: 1, marginBottom: 4 }}>{n}</div>
                  <h5 style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 22 }}>{title}</h5>
                  <p style={{ fontSize: 14, color: 'var(--txt2)', marginBottom: 0 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      {!user && (
        <section style={{ padding: '4rem 0', background: 'linear-gradient(135deg, #e8f5ef, #d6f0e4)', position: 'relative', overflow: 'hidden' }}>
          <div className="container-xl text-center">
            <h2 style={{ fontFamily: "'Barlow Condensed'", fontSize: 52, fontWeight: 800, marginBottom: 16 }}>READY TO <span className="accent-text">REIGN?</span></h2>
            <p style={{ fontSize: 18, color: 'var(--txt2)', marginBottom: 32 }}>Join hundreds of players competing in Pharaoh Padel Tour tournaments.</p>
            <Link to="/register" className="btn btn-acc px-5 py-3" style={{ fontSize: 18 }}>Create Free Account</Link>
          </div>
        </section>
      )}
    </div>
  )
}
