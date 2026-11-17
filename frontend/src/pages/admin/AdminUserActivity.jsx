import React, { useState, useEffect } from 'react'
import { adminAPI } from '../../services/api'
import { Activity, Search, Filter } from 'lucide-react'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import { TableSkeleton } from '../../components/ui/Skeleton'

const FEATURES = ['All', 'yield_prediction', 'risk_analysis', 'crop_recommendation', 'weather', 'soil_analysis', 'market_analysis', 'disease_detection', 'what_if_simulator', 'authentication']

export default function AdminUserActivity() {
  const [activity, setActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [feature, setFeature] = useState('All')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const perPage = 25

  useEffect(() => {
    setLoading(true)
    adminAPI.activity({
      search,
      feature: feature !== 'All' ? feature : undefined,
      page,
      per_page: perPage
    })
      .then(r => {
        setActivity(r.data.activity || r.data || [])
        setTotal(r.data.total || 0)
      })
      .catch(() => setActivity([]))
      .finally(() => setLoading(false))
  }, [search, feature, page])

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-brand-border">
        <div>
          <h1 className="text-2xl font-semibold text-brand-text tracking-tight flex items-center gap-2.5">
            <Activity className="w-6 h-6 text-brand-emerald" />
            Audit Log & Security Telemetry
          </h1>
          <p className="text-sm text-brand-secondary mt-1">
            Real-time immutable log of tenant interactions, inference runs, and security events.
          </p>
        </div>
      </div>

      <Card>
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="flex-1 min-w-48">
            <Input
              icon={Search}
              placeholder="Search by user identifier..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
            />
          </div>
          <div className="w-64">
            <Select
              value={feature}
              onChange={e => { setFeature(e.target.value); setPage(1) }}
              options={FEATURES.map(f => ({ value: f, label: f === 'All' ? 'All Feature Modules' : f.replace(/_/g, ' ') }))}
            />
          </div>
        </div>

        {loading ? (
          <TableSkeleton rows={8} cols={6} />
        ) : activity.length === 0 ? (
          <EmptyState
            icon={Activity}
            title="No Activity Telemetry Recorded"
            description="Tenant actions will stream into this audit ledger in real-time."
          />
        ) : (
          <div className="overflow-x-auto -mx-5 -mb-5">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-brand-border bg-brand-bg/50">
                  <th className="text-left py-2.5 px-4 font-semibold text-brand-secondary uppercase">Actor</th>
                  <th className="text-left py-2.5 px-4 font-semibold text-brand-secondary uppercase">Route / Endpoint</th>
                  <th className="text-left py-2.5 px-4 font-semibold text-brand-secondary uppercase">Action Verb</th>
                  <th className="text-left py-2.5 px-4 font-semibold text-brand-secondary uppercase">Feature Vector</th>
                  <th className="text-left py-2.5 px-4 font-semibold text-brand-secondary uppercase">Timestamp</th>
                  <th className="text-left py-2.5 px-4 font-semibold text-brand-secondary uppercase">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {activity.map((a, i) => (
                  <tr key={a.id || i} className="hover:bg-brand-bg/60 transition-colors">
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-brand-forest text-white font-semibold text-[10px] flex items-center justify-center shrink-0">
                          {a.user_name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <span className="font-medium text-brand-text">{a.user_name || `User #${a.user_id}`}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-4 font-mono text-brand-emerald">{a.page}</td>
                    <td className="py-2.5 px-4">
                      <Badge variant="default" size="sm">{a.action}</Badge>
                    </td>
                    <td className="py-2.5 px-4 text-brand-secondary capitalize">{a.feature?.replace(/_/g, ' ')}</td>
                    <td className="py-2.5 px-4 font-mono text-brand-secondary whitespace-nowrap">
                      {a.created_at ? new Date(a.created_at).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' }) : '—'}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-brand-secondary">
                      {a.duration_seconds ? `${a.duration_seconds}s` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {total > perPage && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-brand-border text-xs text-brand-secondary">
            <span>Showing {((page-1)*perPage)+1}–{Math.min(page*perPage, total)} of {total} events</span>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}>
                Previous
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setPage(p => p+1)} disabled={page * perPage >= total}>
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
