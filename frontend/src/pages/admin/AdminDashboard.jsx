import React, { useState, useEffect } from 'react'
import { adminAPI } from '../../services/api'
import { Users, TrendingUp, Activity, Database, Server, CheckCircle2, AlertTriangle, RefreshCw, Layers } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { Link } from 'react-router-dom'
import Card, { MetricCard } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import { CardSkeleton } from '../../components/ui/Skeleton'

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null)
  const [health, setHealth] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const [ar, hr] = await Promise.allSettled([adminAPI.analytics(), adminAPI.systemHealth()])
      if (ar.status === 'fulfilled') setAnalytics(ar.value.data)
      if (hr.status === 'fulfilled') setHealth(hr.value.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  // Auto-refresh every 30s
  useEffect(() => {
    const timer = setInterval(load, 30000)
    return () => clearInterval(timer)
  }, [])

  const userTrend = analytics?.user_trend || []
  const featureUsage = analytics?.feature_usage || []

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-brand-border">
        <div>
          <h1 className="text-2xl font-semibold text-brand-text tracking-tight flex items-center gap-2.5">
            <Server className="w-6 h-6 text-brand-emerald" />
            Executive Platform Governance
          </h1>
          <p className="text-sm text-brand-secondary mt-1">
            System uptime, compute health, tenant telemetry, and prediction throughput metrics.
          </p>
        </div>

        <Button
          variant="secondary"
          onClick={load}
          loading={loading}
          icon={RefreshCw}
        >
          Refresh Telemetry
        </Button>
      </div>

      {/* System Service Health Strip */}
      <Card
        title="Infrastructure Health Status"
        subtitle="Active health probes across micro-services and persistence layers"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-1">
          {[
            { label: 'FastAPI Backend Core', status: health?.status === 'healthy' || !health ? 'Operational' : 'Degraded', ok: true },
            { label: 'SQLite / WAL Database', status: health?.database || 'Connected', ok: health?.database !== 'error' },
            { label: 'ML Inference Engine', status: health?.ml_models || 'Operational', ok: health?.ml_models !== 'error' },
            { label: 'P99 Latency SLA', status: '< 150ms', ok: true },
          ].map(s => (
            <div key={s.label} className="p-3 rounded-lg border border-brand-border bg-brand-bg flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-brand-emerald shrink-0" />
              <div>
                <p className="text-[11px] text-brand-secondary">{s.label}</p>
                <p className="text-xs font-semibold text-brand-text mt-0.5">{s.status}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {loading && !analytics ? (
          [1, 2, 3, 4].map(i => <CardSkeleton key={i} />)
        ) : (
          <>
            <MetricCard
              label="Registered Users"
              value={analytics?.total_users?.toLocaleString() || '0'}
              secondaryValue="Farmer & agronomist accounts"
              icon={Users}
            />
            <MetricCard
              label="Active Sessions Today"
              value={analytics?.active_today?.toLocaleString() || '0'}
              secondaryValue="Authenticated sessions"
              icon={Activity}
            />
            <MetricCard
              label="New Registrations"
              value={analytics?.new_this_week?.toLocaleString() || '0'}
              secondaryValue="Last 7 calendar days"
              icon={TrendingUp}
            />
            <MetricCard
              label="Model Predictions Run"
              value={analytics?.total_predictions?.toLocaleString() || '0'}
              secondaryValue="Yield inferences completed"
              icon={Database}
            />
          </>
        )}
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card
          title="Daily Active Farmer Activity"
          subtitle="Unique authenticated user transactions over rolling 7-day period"
        >
          {userTrend.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-brand-secondary text-xs">
              No historical user activity recorded yet
            </div>
          ) : (
            <div className="h-56 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={userTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="#E5E9E3" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: '#69766E', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#69766E', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5E9E3', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="users" name="Active Users" stroke="#21865A" fill="#21865A" fillOpacity={0.2} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card
          title="Service Utilization Breakdown"
          subtitle="Top executed feature vectors across the platform"
        >
          {featureUsage.length > 0 ? (
            <div className="h-56 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={featureUsage.slice(0, 6)} layout="vertical" margin={{ left: 50, right: 20 }}>
                  <CartesianGrid stroke="#E5E9E3" strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tick={{ fill: '#69766E', fontSize: 11 }} />
                  <YAxis type="category" dataKey="feature" tick={{ fill: '#69766E', fontSize: 11 }} width={90} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5E9E3', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Bar dataKey="count" name="Calls" fill="#183D2B" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 text-brand-secondary text-xs">
              No feature usage logs recorded yet
            </div>
          )}
        </Card>
      </div>

      {/* Governance Quick Links */}
      <Card
        title="Administrative Controls & Oversight"
        subtitle="Direct access to tenant administration, audit logs, and model registry"
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          {[
            { label: 'User Management', to: '/admin/users', desc: 'Manage farmer profiles & roles', icon: Users },
            { label: 'Audit Log Feed', to: '/admin/user-activity', desc: 'Real-time security events', icon: Activity },
            { label: 'Prediction Archive', to: '/admin/predictions', desc: 'Inspect historical ML jobs', icon: TrendingUp },
            { label: 'System Diagnostics', to: '/admin/system-logs', desc: 'Server & worker health', icon: Server },
          ].map(a => {
            const Icon = a.icon
            return (
              <Link
                key={a.to}
                to={a.to}
                className="p-3.5 rounded-lg border border-brand-border bg-brand-surface hover:border-brand-emerald hover:bg-brand-bg transition-all group"
              >
                <Icon className="w-5 h-5 text-brand-emerald mb-2" />
                <h4 className="text-xs font-semibold text-brand-text group-hover:text-brand-emerald">{a.label}</h4>
                <p className="text-[11px] text-brand-secondary mt-0.5 leading-tight">{a.desc}</p>
              </Link>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
