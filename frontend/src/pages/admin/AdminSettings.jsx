import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { adminAPI } from '../../services/api'
import { Settings, Shield, Eye, EyeOff, CheckCircle2, AlertTriangle, Key, UserCheck } from 'lucide-react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Input from '../../components/ui/Input'
import toast from 'react-hot-toast'

export default function AdminSettings() {
  const { user } = useAuth()
  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', confirm: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const pwUpd = (k, v) => setPwForm(f => ({ ...f, [k]: v }))

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (pwForm.new_password !== pwForm.confirm) {
      toast.error('New passwords do not match')
      return
    }
    if (pwForm.new_password.length < 8) {
      toast.error('New password must be at least 8 characters')
      return
    }
    if (!/[A-Z]/.test(pwForm.new_password)) {
      toast.error('Password must contain at least one uppercase letter')
      return
    }
    if (!/[0-9]/.test(pwForm.new_password)) {
      toast.error('Password must contain at least one digit')
      return
    }
    setLoading(true)
    try {
      await adminAPI.changePassword({
        current_password: pwForm.current_password,
        new_password: pwForm.new_password,
      })
      toast.success('Admin password updated successfully!')
      setPwForm({ current_password: '', new_password: '', confirm: '' })
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update password')
    } finally {
      setLoading(false)
    }
  }

  const passwordsMatch = pwForm.new_password && pwForm.confirm && pwForm.new_password === pwForm.confirm
  const passwordsMismatch = pwForm.new_password && pwForm.confirm && pwForm.new_password !== pwForm.confirm

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="page-title flex items-center gap-2">
          <Settings size={22} className="text-[#183D2B]" /> Admin Settings
        </h1>
        <p className="page-subtitle">Security parameters, cryptographic credentials, and administrator access profile</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 items-start">
        {/* Account Info */}
        <Card title="Administrator Profile" subtitle="Active authority and access attributes">
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#FAFBF9] border border-[#E5E9E3]">
              <span className="text-xs font-medium text-[#69766E]">Admin Name</span>
              <span className="text-xs font-semibold text-[#10291F]">{user?.full_name || 'System Administrator'}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#FAFBF9] border border-[#E5E9E3]">
              <span className="text-xs font-medium text-[#69766E]">Email Address</span>
              <span className="text-xs font-mono text-[#10291F]">{user?.email || 'admin@agripredict.com'}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#FAFBF9] border border-[#E5E9E3]">
              <span className="text-xs font-medium text-[#69766E]">System Role</span>
              <Badge variant="forest">Super Administrator</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#FAFBF9] border border-[#E5E9E3]">
              <span className="text-xs font-medium text-[#69766E]">Security Status</span>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#27865B]">
                <UserCheck size={14} /> Active & Verified
              </span>
            </div>
          </div>
        </Card>

        {/* Change Password */}
        <Card title="Update Password" subtitle="Cryptographically re-hash administrator access key">
          <form onSubmit={handlePasswordChange} className="space-y-4 pt-1">
            <div>
              <label className="label">Current Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  className="input-field pr-10 text-xs"
                  placeholder="Enter current password"
                  value={pwForm.current_password}
                  onChange={e => pwUpd('current_password', e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#69766E] hover:text-[#10291F] transition-colors"
                  onClick={() => setShowPw(!showPw)}
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div>
              <label className="label">New Password</label>
              <input
                type={showPw ? 'text' : 'password'}
                className="input-field text-xs"
                placeholder="Min. 8 chars, 1 uppercase, 1 digit"
                value={pwForm.new_password}
                onChange={e => pwUpd('new_password', e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>

            <div>
              <label className="label">Confirm New Password</label>
              <input
                type={showPw ? 'text' : 'password'}
                className="input-field text-xs"
                placeholder="Repeat new password"
                value={pwForm.confirm}
                onChange={e => pwUpd('confirm', e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>

            {/* Password strength feedback */}
            {pwForm.new_password && (
              <div className="p-3 rounded-lg bg-[#FAFBF9] border border-[#E5E9E3] space-y-1.5">
                <div className={`flex items-center gap-1.5 text-[11px] ${pwForm.new_password.length >= 8 ? 'text-[#27865B] font-medium' : 'text-[#69766E]'}`}>
                  <CheckCircle2 size={13} /> At least 8 characters
                </div>
                <div className={`flex items-center gap-1.5 text-[11px] ${/[A-Z]/.test(pwForm.new_password) ? 'text-[#27865B] font-medium' : 'text-[#69766E]'}`}>
                  <CheckCircle2 size={13} /> Contains uppercase letter
                </div>
                <div className={`flex items-center gap-1.5 text-[11px] ${/[0-9]/.test(pwForm.new_password) ? 'text-[#27865B] font-medium' : 'text-[#69766E]'}`}>
                  <CheckCircle2 size={13} /> Contains a digit
                </div>
              </div>
            )}

            {passwordsMismatch && (
              <div className="flex items-center gap-2 text-[#D45B4C] text-xs font-medium">
                <AlertTriangle size={13} /> Passwords do not match
              </div>
            )}
            {passwordsMatch && pwForm.new_password.length >= 8 && (
              <div className="flex items-center gap-2 text-[#27865B] text-xs font-medium">
                <CheckCircle2 size={13} /> Passwords match and satisfy security policy
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={loading || passwordsMismatch}
              icon={Key}
              loading={loading}
            >
              Update Admin Password
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}
