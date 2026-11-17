import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { authAPI } from '../../services/api'
import { User, Save, ShieldCheck, Mail, Phone, MapPin } from 'lucide-react'
import toast from 'react-hot-toast'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Badge from '../../components/ui/Badge'

const STATES = [
  'Punjab', 'Haryana', 'Uttar Pradesh', 'Madhya Pradesh',
  'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Andhra Pradesh',
  'Gujarat', 'Rajasthan', 'West Bengal', 'Bihar', 'Telangana', 'Odisha', 'Kerala'
]

export default function Profile() {
  const { user, refreshUser } = useAuth()
  const [form, setForm] = useState({ full_name: '', phone: '', state: '', district: '' })
  const [loading, setLoading] = useState(false)
  const u = (k, v) => setForm(f => ({ ...f, [k]: v }))

  useEffect(() => {
    if (user) {
      setForm({
        full_name: user.full_name || '',
        phone: user.phone || '',
        state: user.state || 'Punjab',
        district: user.district || ''
      })
    }
  }, [user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await authAPI.updateProfile(form)
      await refreshUser()
      toast.success('Profile updated successfully')
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const initial = user?.full_name ? user.full_name[0].toUpperCase() : 'U'

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-brand-border">
        <div>
          <h1 className="text-2xl font-semibold text-brand-text tracking-tight flex items-center gap-2.5">
            <User className="w-6 h-6 text-brand-emerald" />
            User Identity & Profile
          </h1>
          <p className="text-sm text-brand-secondary mt-1">
            Manage your personal contact information, regional state affiliation, and account status.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-12 gap-6 items-start">
        {/* Left Badge Card */}
        <div className="md:col-span-4 space-y-4">
          <Card>
            <div className="flex flex-col items-center text-center py-4">
              <div className="w-20 h-20 rounded-full bg-brand-forest text-white font-semibold text-2xl flex items-center justify-center border-2 border-brand-emerald">
                {initial}
              </div>
              <h2 className="text-base font-semibold text-brand-text mt-3">{user?.full_name || 'Farmer'}</h2>
              <p className="text-xs text-brand-secondary font-mono mt-0.5">{user?.email}</p>

              <div className="mt-3">
                <Badge variant={user?.role === 'admin' ? 'danger' : 'success'}>
                  {user?.role?.toUpperCase() || 'FARMER'}
                </Badge>
              </div>

              <div className="w-full pt-4 mt-4 border-t border-brand-border text-left space-y-2 text-xs">
                <div className="flex justify-between text-brand-secondary">
                  <span>Account Status</span>
                  <span className="text-brand-emerald font-medium">Verified Active</span>
                </div>
                <div className="flex justify-between text-brand-secondary">
                  <span>Registered</span>
                  <span className="font-mono text-brand-text">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-IN') : 'Member'}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Form Card */}
        <div className="md:col-span-8">
          <Card
            title="Personal Information"
            subtitle="Keep your contact and regional jurisdiction details up to date"
          >
            <form onSubmit={handleSubmit} className="space-y-4 pt-1">
              <Input
                label="Full Name"
                value={form.full_name}
                onChange={e => u('full_name', e.target.value)}
                required
              />

              <Input
                label="Email Address (System Identifier)"
                value={user?.email || ''}
                readOnly
                disabled
              />

              <Input
                label="Phone Number"
                placeholder="+91 98765 43210"
                value={form.phone}
                onChange={e => u('phone', e.target.value)}
              />

              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="Primary State"
                  value={form.state}
                  onChange={e => u('state', e.target.value)}
                  options={STATES.map(s => ({ value: s, label: s }))}
                />
                <Input
                  label="Home District"
                  placeholder="District"
                  value={form.district}
                  onChange={e => u('district', e.target.value)}
                />
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  loading={loading}
                  icon={Save}
                >
                  Save Profile Changes
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
}
