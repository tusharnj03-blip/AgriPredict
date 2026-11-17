import React, { useEffect, useState } from 'react'
import { alertsAPI } from '../../services/api'
import { Bell, CheckCheck, AlertTriangle, ShieldAlert, Info, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge, { RiskBadge } from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'
import { CardSkeleton } from '../../components/ui/Skeleton'

export default function Alerts() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    alertsAPI.list()
      .then(r => setAlerts(r.data || []))
      .catch(() => setAlerts([]))
      .finally(() => setLoading(false))
  }, [])

  const markRead = async (id) => {
    try {
      await alertsAPI.markRead(id)
      setAlerts(a => a.map(x => x.id === id ? { ...x, is_read: true } : x))
      toast.success('Alert marked as acknowledged')
    } catch {}
  }

  const markAllRead = async () => {
    try {
      await alertsAPI.markAllRead()
      setAlerts(a => a.map(x => ({ ...x, is_read: true })))
      toast.success('All notifications marked as read')
    } catch {}
  }

  const unread = alerts.filter(a => !a.is_read).length

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-brand-border">
        <div>
          <h1 className="text-2xl font-semibold text-brand-text tracking-tight flex items-center gap-2.5">
            <Bell className="w-6 h-6 text-brand-emerald" />
            Field Alerts & Telemetry Notifications
          </h1>
          <p className="text-sm text-brand-secondary mt-1">
            {unread} unacknowledged hazard {unread === 1 ? 'alert' : 'alerts'} across registered landholdings.
          </p>
        </div>

        {unread > 0 && (
          <Button
            variant="secondary"
            onClick={markAllRead}
            icon={CheckCheck}
          >
            Acknowledge All
          </Button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <CardSkeleton key={i} />)}
        </div>
      ) : alerts.length === 0 ? (
        <Card>
          <EmptyState
            icon={Bell}
            title="All Clear — No Active Alerts"
            description="Your farm parcels have no pending weather alerts, disease warnings, or market price deviation notices."
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {alerts.map((a, i) => {
            const severityLevel = a.severity?.toLowerCase() === 'high' ? 'high' : a.severity?.toLowerCase() === 'medium' ? 'medium' : 'low'
            return (
              <div
                key={a.id || i}
                className={`p-4 rounded-lg border transition-all flex items-start gap-4 ${
                  a.is_read
                    ? 'border-brand-border bg-brand-surface opacity-75'
                    : 'border-brand-emerald/40 bg-brand-bg shadow-sm'
                }`}
              >
                <div className="pt-0.5">
                  <RiskBadge level={severityLevel} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-brand-text uppercase tracking-wider">
                      {a.type || 'System Alert'}
                    </span>
                    {!a.is_read && (
                      <Badge variant="success" size="sm">New</Badge>
                    )}
                  </div>

                  <h3 className="text-sm font-semibold text-brand-text">{a.title}</h3>
                  <p className="text-xs text-brand-secondary mt-1 leading-relaxed">{a.message}</p>
                  <p className="text-[11px] text-brand-secondary font-mono mt-2">
                    {a.created_at ? new Date(a.created_at).toLocaleString('en-IN') : 'Recent Activity'}
                  </p>
                </div>

                {!a.is_read && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markRead(a.id)}
                  >
                    Acknowledge
                  </Button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
