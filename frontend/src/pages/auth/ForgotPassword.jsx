import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Leaf, ArrowLeft, Mail } from 'lucide-react'
import { authAPI } from '../../services/api'
import toast from 'react-hot-toast'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await authAPI.forgotPassword(email)
      setSent(true)
      toast.success('Reset instructions sent!')
    } catch {
      toast.error('Email not found')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#fbfaf8] flex items-center justify-center px-4 text-[#292524]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-[#1b4332] rounded flex items-center justify-center">
              <Leaf size={16} className="text-white" />
            </div>
          </Link>
          <h1 className="text-2xl font-serif font-bold text-[#1c1917] mb-1">Reset Password</h1>
          <p className="text-[#57534e] text-xs">Enter your registered email to receive recovery instructions</p>
        </div>

        <div className="card">
          {sent ? (
            <div className="text-center py-6">
              <div className="w-10 h-10 bg-[#e3eee6] rounded border border-[#c7ddce] flex items-center justify-center text-[#1b4332] mx-auto mb-3">
                <Mail size={20} />
              </div>
              <h2 className="text-lg font-serif font-bold text-[#1c1917] mb-1">Instructions Dispatched</h2>
              <p className="text-[#57534e] text-xs mb-6 max-w-xs mx-auto">
                If an account exists for {email}, password recovery steps have been sent.
              </p>
              <Link to="/login" className="btn-primary justify-center w-full py-2.5 text-xs font-semibold">
                Return to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Registered Email</label>
                <input
                  type="email"
                  className="input-field"
                  placeholder="farmer@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn-primary w-full justify-center py-2.5 text-xs font-semibold"
                disabled={loading}
              >
                {loading ? 'Dispatching...' : 'Send Recovery Link'}
              </button>

              <div className="pt-2 text-center">
                <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-[#57534e] hover:text-[#1c1917]">
                  <ArrowLeft size={13} /> Return to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
