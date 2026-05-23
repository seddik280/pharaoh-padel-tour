import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Full name is required'
    else if (form.name.trim().length < 2) e.name = 'Name must be at least 2 characters'
    if (!form.email.trim()) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.password) e.password = 'Password is required'
    else if (form.password.length < 3) e.password = 'Password must be at least 3 characters'
    if (!form.confirm) e.confirm = 'Please confirm your password'
    else if (form.password !== form.confirm) e.confirm = 'Passwords do not match'
    return e
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const e2 = validate()
    if (Object.keys(e2).length) { setErrors(e2); return }
    setLoading(true); setServerError('')
    try {
      await register(form.name, form.email, form.password)
      navigate('/dashboard')
    } catch (err) {
      setServerError(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const field = (key, label, type = 'text', placeholder = '') => (
    <div className="mb-3">
      <label className="form-label" style={{ fontSize: 13, color: 'var(--txt2)', fontWeight: 500 }}>{label}</label>
      <input type={type} className="form-control pp-input" placeholder={placeholder}
        value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} />
      {errors[key] && <div style={{ color: '#f87171', fontSize: 12, marginTop: 4 }}>{errors[key]}</div>}
    </div>
  )

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div className="pp-card">
          <div className="text-center mb-4">
            <img src="/pharaoh-logo.svg" alt="Pharaoh Padel Tour" style={{ width: 60, height: 60, marginBottom: 8 }} />
            <h1 style={{ fontFamily: "'Barlow Condensed'", fontSize: 36, fontWeight: 800, color: 'var(--acc)', lineHeight: 1, marginBottom: 4 }}>PHARAOH PADEL TOUR</h1>
            <p style={{ color: 'var(--txt2)', fontSize: 14 }}>Create your free account</p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {field('name', 'Full Name', 'text', 'Your full name')}
            {field('email', 'Email Address', 'email', 'your@email.com')}
            {field('password', 'Password', 'password', 'Min 3 characters')}
            {field('confirm', 'Confirm Password', 'password', 'Repeat your password')}

            {serverError && <div className="alert mb-3" style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.25)', color: '#b91c1c', fontSize: 13, padding: '8px 12px', borderRadius: 8 }}>{serverError}</div>}

            <button type="submit" className="btn btn-acc w-100" disabled={loading}>
              {loading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
              Create Account
            </button>
          </form>

          <p className="text-center mt-3" style={{ fontSize: 14, color: 'var(--txt2)' }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--acc)', textDecoration: 'none' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
