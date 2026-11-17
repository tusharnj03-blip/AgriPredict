import React, { useState, useEffect } from 'react'
import { adminAPI } from '../../services/api'
import { BarChart3, Users, TrendingUp, Activity, Database, RefreshCw } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts'
import Card, { MetricCard } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { CardSkeleton } from '../../components/ui/Skeleton'

const BAR_COLORS = ['#183D2B', '#21865A', '#27865B', '#D69B35', '#A8B9A5', '#69766E']

export default function AdminAnalytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadData = () => {
    setLoading(true)
    Promise.all([adminAPI.analytics(), adminAPI.featureUsage()])
      .then(([ar, fr]) => setData({ ...ar.data, feature_usage: fr.data || ar.data?.feature_usage || [] }))
      .catch(() => {
        setData({
          total_users: 0, active_today: 0, new_this_week: 0, total_sessions: 0,
          feature_usage: [],
          user_trend: []
        })
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadData()
  }, [])

  const featureUsage = data?.feature_usage || []
  const userTrend = data?.user_trend || []

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-brand-border">
        <div>
          <h1 className="text-2xl font-semibold text-brand-text tracking-tight flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-brand-emerald" />
            Platform Analytics & Usage Telemetry
          </h1>
          <p className="text-sm text-brand-secondary mt-1">
            Quantitative analysis of feature adoption, user lifecycle events, and compute utilization.
          </p>
        </div>

        <Button
          variant="secondary"
          onClick={loadData}
          loading={loading}
          icon={RefreshCw}
        >
          Refresh
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {loading && !data ? (
          [1, 2, 3, 4].map(i => <CardSkeleton key={i} />)
        ) : (
          <>
            <MetricCard
              label="Registered Farmers"
              value={data?.total_users?.toLocaleString() || '0'}
              secondaryValue="Total active identities"
              icon={Users}
            />
            <MetricCard
              label="Active Sessions Today"
              value={data?.active_today?.toLocaleString() || '0'}
              secondaryValue="Unique authenticated users"
              icon={Activity}
            />
            <MetricCard
              label="New Signups This Week"
              value={data?.new_this_week?.toLocaleString() || '0'}
              secondaryValue="7-day acquisition rate"
              icon={TrendingUp}
            />
            <MetricCard
              label="Total User Sessions"
              value={data?.total_sessions?.toLocaleString() || '0'}
              secondaryValue="All-time platform visits"
              icon={Database}
            />
          </>
        )}
      </div>

      {/* Feature Usage Analysis */}
      <Card
        title="Feature Utilization Distribution"
        subtitle="Cumulative invocation volume across individual platform capabilities"
      >
        {featureUsage.length === 0 ? (
          <div className="text-center py-12 text-xs text-brand-secondary">
            No feature interactions recorded yet. Transactions will populate this chart.
          </div>
        ) : (
          <>
            <div className="h-64 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={featureUsage} margin={{ left: 10, right: 10, bottom: 25 }}>
                  <CartesianGrid stroke="#E5E9E3" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="feature" tick={{ fill: '#69766E', fontSize: 10 }} angle={-15} textAnchor="end" />
                  <YAxis tick={{ fill: '#69766E', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5E9E3', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {featureUsage.map((_, i) => (
                      <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 space-y-2 border-t border-brand-border pt-4">
              {featureUsage.map((f, i) => (
                <div key={i} className="flex items-center gap-3 text-xs">
                  <span className="font-mono text-brand-secondary w-5">#{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="font-medium text-brand-text capitalize">{f.feature.replace(/_/g, ' ')}</span>
                      <span className="font-mono text-brand-text font-semibold">{f.count.toLocaleString()} calls</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-brand-bg overflow-hidden border border-brand-border/60">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${featureUsage[0]?.count > 0 ? (f.count / featureUsage[0].count) * 100 : 0}%`,
                          backgroundColor: BAR_COLORS[i % BAR_COLORS.length]
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>
    </div>
  )
}
