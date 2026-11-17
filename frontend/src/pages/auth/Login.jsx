import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Leaf, Eye, EyeOff, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/dashboard'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(email, password)
      toast.success(`Welcome back, ${user.full_name}!`)
      navigate(user.role === 'ADMIN' ? '/admin' : from, { replace: true })
    } catch (err) {
      setError(err.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#fbfaf8] flex items-center justify-center px-4 py-12 text-[#292524]">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-[#1b4332] rounded flex items-center justify-center">
              <Leaf size={16} className="text-white" />
            </div>
            <span className="font-serif font-bold text-[#1c1917] text-xl">AgriPredict</span>
          </Link>
          <h1 className="text-2xl font-serif font-bold text-[#1c1917] mb-1">Sign In</h1>
          <p className="text-[#57534e] text-xs">Access agricultural prediction tools and farm records</p>
        </div>

        <div className="card">
          {error && (
            <div className="flex items-center gap-2 p-3 mb-4 rounded bg-[#fee2e2] border border-[#fecaca] text-[#991b1b] text-xs">
              <AlertCircle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email Address</label>
              <input
                type="email"
                className="input-field"
                placeholder="farmer@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input-field pr-10"
                  placeholder="Enter password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#78716c] hover:text-[#1c1917]"
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-xs text-[#1b4332] hover:underline font-medium">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="btn-primary w-full justify-center py-2.5 text-xs font-semibold"
              disabled={loading}
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-[#e2ddd4] text-center">
            <p className="text-[#57534e] text-xs">
              Don't have an account?{' '}
              <Link to="/register" className="text-[#1b4332] hover:underline font-semibold">
                Register account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
