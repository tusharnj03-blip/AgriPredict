import React, { useState, useEffect, useCallback } from 'react'
import { adminAPI } from '../../services/api'
import { MapPin, Search, RefreshCw, ChevronLeft, ChevronRight, Droplets, Sprout, User } from 'lucide-react'
import Card, { MetricCard } from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import { TableSkeleton } from '../../components/ui/Skeleton'

export default function AdminFarms() {
  const [farms, setFarms] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const perPage = 15

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await adminAPI.farms({ search: search || undefined, page, per_page: perPage })
      setFarms(data.farms || [])
      setTotal(data.total || 0)
    } catch {
      setFarms([])
    } finally {
      setLoading(false)
    }
  }, [search, page])

  useEffect(() => {
    const t = setTimeout(load, search ? 400 : 0)
    return () => clearTimeout(t)
  }, [load, search])

  const totalPages = Math.ceil(total / perPage)
  const totalArea = farms.reduce((s, f) => s + (f.area || 0), 0)

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-brand-border">
        <div>
          <h1 className="text-2xl font-semibold text-brand-text tracking-tight flex items-center gap-2.5">
            <MapPin className="w-6 h-6 text-brand-emerald" />
            Cadastral Farm Registry & GIS Holdings
          </h1>
          <p className="text-sm text-brand-secondary mt-1">
            Centrally cataloged farm boundaries, soil types, and irrigation infrastructure ({total} total holdings).
          </p>
        </div>

        <Button
          variant="secondary"
          onClick={load}
          loading={loading}
          icon={RefreshCw}
        >
          Refresh
        </Button>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          label="Total Registered Parcels"
          value={total}
          secondaryValue="Across all Indian states"
          icon={MapPin}
        />
        <MetricCard
          label="Active Acreage"
          value={`${totalArea.toFixed(1)} ha`}
          secondaryValue="Acreage under intelligence"
          icon={Sprout}
        />
        <MetricCard
          label="Holdings on Active Page"
          value={farms.length}
          secondaryValue={`Page ${page} of ${Math.max(1, totalPages)}`}
          icon={Droplets}
        />
      </div>

      <Card>
        <div className="mb-4 max-w-md">
          <Input
            icon={Search}
            placeholder="Search by farm name, district, or owner..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
          />
        </div>

        {loading ? (
          <TableSkeleton rows={8} cols={7} />
        ) : farms.length === 0 ? (
          <EmptyState
            icon={MapPin}
            title="No Farm Holdings Found"
            description={search ? 'No farms match the current filter.' : 'No agricultural land parcels have been registered yet.'}
          />
        ) : (
          <div className="overflow-x-auto -mx-5 -mb-5">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-brand-border bg-brand-bg/50">
                  <th className="text-left py-2.5 px-4 font-semibold text-brand-secondary uppercase">Holding Name</th>
                  <th className="text-left py-2.5 px-4 font-semibold text-brand-secondary uppercase">Registered Owner</th>
                  <th className="text-left py-2.5 px-4 font-semibold text-brand-secondary uppercase">Location</th>
                  <th className="text-right py-2.5 px-4 font-semibold text-brand-secondary uppercase">Area (ha)</th>
                  <th className="text-left py-2.5 px-4 font-semibold text-brand-secondary uppercase">Soil Class</th>
                  <th className="text-left py-2.5 px-4 font-semibold text-brand-secondary uppercase">Irrigation</th>
                  <th className="text-right py-2.5 px-4 font-semibold text-brand-secondary uppercase">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {farms.map((f, i) => (
                  <tr key={f.id || i} className="hover:bg-brand-bg/60 transition-colors">
                    <td className="py-2.5 px-4">
                      <p className="font-medium text-brand-text">{f.farm_name || f.name}</p>
                      {f.village && <p className="text-[10px] text-brand-secondary font-mono">Village: {f.village}</p>}
                    </td>
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-brand-forest text-white font-semibold text-[10px] flex items-center justify-center shrink-0">
                          {f.owner_name?.[0]?.toUpperCase() || 'O'}
                        </div>
                        <div>
                          <p className="text-brand-text font-medium text-xs">{f.owner_name || 'Farmer'}</p>
                          <p className="text-brand-secondary font-mono text-[10px]">{f.owner_email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-4 text-brand-secondary">
                      {f.district ? `${f.district}, ` : ''}{f.state}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-semibold text-brand-text tabular-nums">
                      {f.area?.toFixed(2) || '—'}
                    </td>
                    <td className="py-2.5 px-4">
                      <Badge variant="default" size="sm">{f.soil_type || 'Alluvial'}</Badge>
                    </td>
                    <td className="py-2.5 px-4 text-brand-secondary">{f.irrigation_type || 'Canal'}</td>
                    <td className="py-2.5 px-4 text-right font-mono text-brand-secondary">
                      {f.created_at ? new Date(f.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-brand-border text-xs text-brand-secondary">
            <span>Showing {((page - 1) * perPage) + 1}–{Math.min(page * perPage, total)} of {total} holdings</span>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
