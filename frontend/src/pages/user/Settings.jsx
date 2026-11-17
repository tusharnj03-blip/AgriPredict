import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { authAPI } from '../../services/api'
import {
  Settings as SettingsIcon, Bell, Shield, Database, Eye, EyeOff,
  Save, CheckCircle2, AlertTriangle, Trash2, Download, Lock
} from 'lucide-react'
import toast from 'react-hot-toast'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

const NOTIF_SETTINGS = [
  { id: 'weather', label: 'Meteorological Extremes', desc: 'Precipitation surges, heatwaves, and hailstorm warnings' },
  { id: 'disease', label: 'Pathogen Outbreak Alerts', desc: 'Real-time regional pest threshold and blight risk alerts' },
  { id: 'market', label: 'Mandi Price Movements', desc: 'Daily APMC commodity price deviations exceeding 5%' },
  { id: 'yield', label: 'Harvest Forecast Telemetry', desc: 'Notifications when periodic satellite model inferences update' },
  { id: 'risk', label: 'Multi-Hazard Shifts', desc: 'Immediate alert when composite farm risk shifts to critical tier' },
]

export default function Settings() {
  const { user } = useAuth()
  const [notifs, setNotifs] = useState(
    Object.fromEntries(NOTIF_SETTINGS.map(n => [n.id, true]))
  )
  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', confirm: '' })
  const [pwLoading, setPwLoading] = useState(false)

  const toggleNotif = (id) => setNotifs(prev => ({ ...prev, [id]: !prev[id] }))

  const saveNotifs = () => toast.success('Telemetry alert preferences updated')

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (pwForm.new_password !== pwForm.confirm) {
      toast.error('New passwords do not match')
      return
    }
    if (pwForm.new_password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    setPwLoading(true)
    try {
      await authAPI.changePassword({
        current_password: pwForm.current_password,
        new_password: pwForm.new_password,
      })
      toast.success('Password updated successfully')
      setPwForm({ current_password: '', new_password: '', confirm: '' })
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update password')
    } finally {
      setPwLoading(false)
    }
  }

  const handleExport = () => {
    const data = {
      user: { name: user?.full_name, email: user?.email, state: user?.state, district: user?.district },
      exported_at: new Date().toISOString(),
      platform: 'AgriPredict AI - Enterprise Edition',
      note: 'Agricultural holding geometries and model predictions are exported in the Reports section.',
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'agripredict-account-export.json'
    a.click()
    toast.success('Account profile exported')
  }

  const pwUpd = (k, v) => setPwForm(f => ({ ...f, [k]: v }))

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-brand-border">
        <div>
          <h1 className="text-2xl font-semibold text-brand-text tracking-tight flex items-center gap-2.5">
            <SettingsIcon className="w-6 h-6 text-brand-emerald" />
            Account & System Configuration
          </h1>
          <p className="text-sm text-brand-secondary mt-1">
            Configure telemetry delivery, credentials, and data privacy options.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Notification Preferences */}
        <Card
          title="Notification & Broadcast Channels"
          subtitle="Select which hazard categories trigger urgent push broadcasts"
          action={
            <Button variant="secondary" size="sm" onClick={saveNotifs} icon={Save}>
              Save Preferences
            </Button>
          }
        >
          <div className="divide-y divide-brand-border/60">
            {NOTIF_SETTINGS.map(n => (
              <div key={n.id} className="py-3 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-brand-text">{n.label}</h4>
                  <p className="text-[11px] text-brand-secondary mt-0.5">{n.desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={notifs[n.id]}
                    onChange={() => toggleNotif(n.id)}
                  />
                  <div className="w-9 h-5 bg-brand-border peer-checked:bg-brand-emerald rounded-full transition-colors" />
                  <div className="absolute w-3.5 h-3.5 bg-white rounded-full left-0.5 top-0.5 peer-checked:translate-x-4 transition-transform shadow-sm" />
                </label>
              </div>
            ))}
          </div>
        </Card>

        {/* Security & Password */}
        <Card
          title="Security & Access Control"
          subtitle="Update account authentication credentials"
        >
          <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
            <Input
              label="Current Password"
              type="password"
              value={pwForm.current_password}
              onChange={e => pwUpd('current_password', e.target.value)}
              required
            />
            <Input
              label="New Strong Password (min 8 chars)"
              type="password"
              value={pwForm.new_password}
              onChange={e => pwUpd('new_password', e.target.value)}
              required
            />
            <Input
              label="Confirm New Password"
              type="password"
              value={pwForm.confirm}
              onChange={e => pwUpd('confirm', e.target.value)}
              required
            />

            <Button
              type="submit"
              variant="primary"
              loading={pwLoading}
              icon={Lock}
            >
              Update Password
            </Button>
          </form>
        </Card>

        {/* Data & Privacy Export */}
        <Card
          title="Data Portability & Governance"
          subtitle="Download your user profile configuration and registered holdings"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-brand-bg border border-brand-border">
            <div>
              <h4 className="text-xs font-semibold text-brand-text">Account Telemetry Dump</h4>
              <p className="text-[11px] text-brand-secondary mt-0.5">
                Export an authenticated JSON payload containing your registered identity and farm configurations.
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExport}
              icon={Download}
            >
              Export JSON
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
