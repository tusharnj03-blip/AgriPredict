import React, { useState, useEffect } from 'react'
import { predictionsAPI, riskAPI } from '../../services/api'
import { History as HistoryIcon, TrendingUp, AlertTriangle, Calendar, Sprout, Gauge } from 'lucide-react'
import Card from '../../components/ui/Card'
import Badge, { RiskBadge } from '../../components/ui/Badge'
import { TableSkeleton } from '../../components/ui/Skeleton'
import EmptyState from '../../components/ui/EmptyState'

const TABS = [
  { id: 'predictions', label: 'Yield Predictions', icon: TrendingUp },
  { id: 'risks', label: 'Risk Analyses', icon: AlertTriangle },
]

function getRiskLevel(score) {
  if (score >= 70) return 'High'
  if (score >= 40) return 'Medium'
  return 'Low'
}

export default function History() {
  const [tab, setTab] = useState('predictions')
  const [predictions, setPredictions] = useState([])
  const [risks, setRisks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [pr, rr] = await Promise.allSettled([
          predictionsAPI.history(),
          riskAPI.history(),
        ])
        if (pr.status === 'fulfilled') setPredictions(pr.value.data || [])
        if (rr.status === 'fulfilled') setRisks(rr.value.data || [])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="page-title">Analysis History</h1>
        <p className="page-subtitle">Complete record of your yield predictions and risk assessments</p>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 p-1 bg-white rounded-lg border border-[#E5E9E3] w-fit">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-medium transition-all ${
              tab === t.id
                ? 'bg-[#183D2B] text-white shadow-sm'
                : 'text-[#69766E] hover:text-[#202923] hover:bg-[#F7F8F4]'
            }`}
          >
            <t.icon size={14} />
            {t.label}
            <span
              className={`ml-0.5 text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                tab === t.id
                  ? 'bg-white/20 text-white'
                  : 'bg-[#EEF2EC] text-[#69766E]'
              }`}
            >
              {t.id === 'predictions' ? predictions.length : risks.length}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <TableSkeleton rows={5} />
      ) : (
        <>
          {/* Predictions Tab */}
          {tab === 'predictions' && (
            predictions.length === 0 ? (
              <EmptyState
                icon={TrendingUp}
                title="No yield predictions yet"
                description="Your yield forecast history will appear here once you run your first prediction."
              />
            ) : (
              <Card>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#E5E9E3]">
                      <th className="text-left py-3 pr-4 text-xs font-semibold text-[#69766E] uppercase tracking-wide">Crop</th>
                      <th className="text-left py-3 pr-4 text-xs font-semibold text-[#69766E] uppercase tracking-wide">Season</th>
                      <th className="text-left py-3 pr-4 text-xs font-semibold text-[#69766E] uppercase tracking-wide">Date</th>
                      <th className="text-right py-3 pr-4 text-xs font-semibold text-[#69766E] uppercase tracking-wide">Yield (t/ha)</th>
                      <th className="text-right py-3 text-xs font-semibold text-[#69766E] uppercase tracking-wide">Confidence</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0F3EF]">
                    {predictions.map((p, i) => (
                      <tr key={p.id || i} className="hover:bg-[#FAFBF9] transition-colors">
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded bg-[#EEF2EC] flex items-center justify-center">
                              <Sprout size={12} className="text-[#21865A]" />
                            </div>
                            <span className="font-medium text-[#202923]">{p.crop || 'Unknown'}</span>
                          </div>
                        </td>
                        <td className="py-3 pr-4">
                          {p.season ? (
                            <Badge variant="neutral" size="sm">{p.season}</Badge>
                          ) : (
                            <span className="text-[#69766E]">—</span>
                          )}
                        </td>
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-1.5 text-[#69766E] text-xs">
                            <Calendar size={12} />
                            {p.created_at
                              ? new Date(p.created_at).toLocaleString('en-IN', {
                                  day: '2-digit', month: 'short', year: 'numeric',
                                  hour: '2-digit', minute: '2-digit'
                                })
                              : 'Recent'}
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-right">
                          <span className="tabular-nums font-bold text-[#183D2B] text-base">
                            {p.predicted_yield != null ? p.predicted_yield.toFixed(2) : '—'}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          {p.confidence != null ? (
                            <div className="flex items-center justify-end gap-2">
                              <div className="w-16 h-1.5 bg-[#E5E9E3] rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-[#21865A] rounded-full"
                                  style={{ width: `${(p.confidence * 100).toFixed(0)}%` }}
                                />
                              </div>
                              <span className="tabular-nums text-xs text-[#69766E]">
                                {(p.confidence * 100).toFixed(0)}%
                              </span>
                            </div>
                          ) : (
                            <span className="text-[#69766E]">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            )
          )}

          {/* Risks Tab */}
          {tab === 'risks' && (
            risks.length === 0 ? (
              <EmptyState
                icon={AlertTriangle}
                title="No risk analyses yet"
                description="Your agricultural risk assessment history will appear here."
              />
            ) : (
              <Card>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#E5E9E3]">
                      <th className="text-left py-3 pr-4 text-xs font-semibold text-[#69766E] uppercase tracking-wide">Date</th>
                      <th className="text-left py-3 pr-4 text-xs font-semibold text-[#69766E] uppercase tracking-wide">Risk Level</th>
                      <th className="text-right py-3 text-xs font-semibold text-[#69766E] uppercase tracking-wide">Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0F3EF]">
                    {risks.map((r, i) => (
                      <tr key={r.id || i} className="hover:bg-[#FAFBF9] transition-colors">
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-1.5 text-[#69766E] text-xs">
                            <Calendar size={12} />
                            {r.created_at
                              ? new Date(r.created_at).toLocaleString('en-IN', {
                                  day: '2-digit', month: 'short', year: 'numeric',
                                  hour: '2-digit', minute: '2-digit'
                                })
                              : 'Recent'}
                          </div>
                        </td>
                        <td className="py-3 pr-4">
                          <RiskBadge level={getRiskLevel(r.overall_risk || 0)} />
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-20 h-1.5 bg-[#E5E9E3] rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  (r.overall_risk || 0) >= 70
                                    ? 'bg-[#D45B4C]'
                                    : (r.overall_risk || 0) >= 40
                                    ? 'bg-[#D69B35]'
                                    : 'bg-[#27865B]'
                                }`}
                                style={{ width: `${r.overall_risk || 0}%` }}
                              />
                            </div>
                            <span className="tabular-nums font-bold text-[#202923] text-base">
                              {r.overall_risk != null ? r.overall_risk : '—'}<span className="text-xs font-normal text-[#69766E]">/100</span>
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            )
          )}
        </>
      )}
    </div>
  )
}
