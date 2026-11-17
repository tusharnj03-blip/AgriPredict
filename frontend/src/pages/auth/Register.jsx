import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Leaf, Eye, EyeOff, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const INDIAN_STATES = [
  'Andhra Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Odisha', 'Punjab', 'Rajasthan', 'Tamil Nadu',
  'Telangana', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
]

export default function Register() {
  const [form, setForm] = useState({
    full_name: '', email: '', phone: '', password: '',
    confirm_password: '', role: 'USER', state: '', district: ''
  })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { register, login } = useAuth()
  const navigate = useNavigate()

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm_password) {
      setError('Passwords do not match')
      return
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    setLoading(true)
    try {
      const { confirm_password, ...data } = form
      await register(data)
      await login(form.email, form.password)
      toast.success('Account created successfully!')
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#fbfaf8] flex items-center justify-center px-4 py-12 text-[#292524]">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-[#1b4332] rounded flex items-center justify-center">
              <Leaf size={16} className="text-white" />
            </div>
            <span className="font-serif font-bold text-[#1c1917] text-xl">AgriPredict</span>
          </Link>
          <h1 className="text-2xl font-serif font-bold text-[#1c1917] mb-1">Create Account</h1>
          <p className="text-[#57534e] text-xs">Set up access to decision support models and farm records</p>
        </div>

        <div className="card">
          {error && (
            <div className="flex items-center gap-2 p-3 mb-4 rounded bg-[#fee2e2] border border-[#fecaca] text-[#991b1b] text-xs">
              <AlertCircle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3.5">
              <div className="col-span-2">
                <label className="label">Full Name *</label>
                <input className="input-field" placeholder="Enter full name" value={form.full_name} onChange={e => update('full_name', e.target.value)} required />
              </div>

              <div>
                <label className="label">Email Address *</label>
                <input type="email" className="input-field" placeholder="farmer@example.com" value={form.email} onChange={e => update('email', e.target.value)} required />
              </div>

              <div>
                <label className="label">Mobile Phone</label>
                <input type="tel" className="input-field" placeholder="+91 98765 43210" value={form.phone} onChange={e => update('phone', e.target.value)} />
              </div>

              <div>
                <label className="label">Agricultural State *</label>
                <select className="input-field" value={form.state} onChange={e => update('state', e.target.value)} required>
                  <option value="">Select State</option>
                  {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="label">District</label>
                <input className="input-field" placeholder="District name" value={form.district} onChange={e => update('district', e.target.value)} />
              </div>

              <div className="col-span-2">
                <label className="label">Account Role</label>
                <select className="input-field" value={form.role} onChange={e => update('role', e.target.value)}>
                  <option value="USER">Farmer / Field User</option>
                  <option value="ADMIN">System Administrator</option>
                </select>
              </div>

              <div>
                <label className="label">Password (Min. 8 chars) *</label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} className="input-field pr-9" placeholder="Password" value={form.password} onChange={e => update('password', e.target.value)} required />
                  <button type="button" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#78716c] hover:text-[#1c1917]" onClick={() => setShowPass(!showPass)}>
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="label">Confirm Password *</label>
                <input type="password" className="input-field" placeholder="Repeat password" value={form.confirm_password} onChange={e => update('confirm_password', e.target.value)} required />
              </div>
            </div>

            <button type="submit" className="btn-primary w-full justify-center py-2.5 text-xs font-semibold mt-2" disabled={loading}>
              {loading ? 'Processing Registration...' : 'Complete Registration'}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-[#e2ddd4] text-center">
            <p className="text-[#57534e] text-xs">
              Already registered?{' '}
              <Link to="/login" className="text-[#1b4332] hover:underline font-semibold">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
