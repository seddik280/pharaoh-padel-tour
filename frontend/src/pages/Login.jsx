import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')

  const validate = () => {
    const e = {}
    if (!form.email.trim()) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.password) e.password = 'Password is required'
    return e
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const e2 = validate()
    if (Object.keys(e2).length) { setErrors(e2); return }
    setLoading(true); setServerError('')
    try {
      await login(form.email, form.password)
      navigate('/dashboard')
    } catch (err) {
      setServerError(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div className="pp-card">
          <div className="text-center mb-4">
            <img src="/pharaoh-logo.svg" alt="Pharaoh Padel Tour" style={{ width: 60, height: 60, marginBottom: 8 }} />
            <h1 style={{ fontFamily: "'Barlow Condensed'", fontSize: 36, fontWeight: 800, color: 'var(--acc)', lineHeight: 1, marginBottom: 4 }}>PHARAOH PADEL TOUR</h1>
            <p style={{ color: 'var(--txt2)', fontSize: 14 }}>Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-3">
              <label className="form-label" style={{ fontSize: 13, color: 'var(--txt2)', fontWeight: 500 }}>Email address</label>
              <input type="email" className="form-control pp-input" placeholder="your@email.com"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              {errors.email && <div style={{ color: '#f87171', fontSize: 12, marginTop: 4 }}>{errors.email}</div>}
            </div>
            <div className="mb-3">
              <label className="form-label" style={{ fontSize: 13, color: 'var(--txt2)', fontWeight: 500 }}>Password</label>
              <input type="password" className="form-control pp-input" placeholder="••••••••"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
              {errors.password && <div style={{ color: '#f87171', fontSize: 12, marginTop: 4 }}>{errors.password}</div>}
            </div>
            {serverError && <div className="alert" style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.25)', color: '#b91c1c', fontSize: 13, padding: '8px 12px', borderRadius: 8 }}>{serverError}</div>}
            <button type="submit" className="btn btn-acc w-100 mt-2" disabled={loading}>
              {loading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
              Sign In
            </button>
          </form>

          <div className="mt-4 p-3 rounded" style={{ background: 'var(--c3)', fontSize: 12, color: 'var(--txt2)' }}>
            <div style={{ fontWeight: 600, color: 'var(--txt)', marginBottom: 6 }}>Demo accounts:</div>
            <div>Admin: admin@padel.com / admin</div>
            <div>Rank 1 (Abdelrahman Seddik): seddik@padel.com / 123</div>
            <div>Player C (Mohamed Badea): badea@padel.com / 123</div>
            <div>Player D (Mahmoud Yakout): yakout@padel.com / 123</div>
            <div>Beginner (Mohamed Nader): nader@padel.com / 123</div>
          </div>

          <p className="text-center mt-3" style={{ fontSize: 14, color: 'var(--txt2)' }}>
            No account? <Link to="/register" style={{ color: 'var(--acc)', textDecoration: 'none' }}>Register here</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
