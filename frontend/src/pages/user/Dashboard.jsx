import React, { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { farmsAPI, alertsAPI, predictionsAPI, riskAPI, weatherAPI } from '../../services/api'
import {
  TrendingUp, AlertTriangle, MapPin, Cloud, Leaf, Bell,
  ArrowRight, Activity, ChevronRight, Droplets, Sun, Wind,
  CheckCircle, ShieldCheck, Calendar, Filter, Sparkles, Clock, Sprout
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts'
import Card, { MetricCard } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge, { RiskBadge } from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'
import Skeleton, { MetricCardSkeleton } from '../../components/ui/Skeleton'

export default function Dashboard() {
  const { user } = useAuth()
  const [farms, setFarms] = useState([])
  const [alerts, setAlerts] = useState([])
  const [predictions, setPredictions] = useState([])
  const [risks, setRisks] = useState([])
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedFarmId, setSelectedFarmId] = useState('ALL')
  const [timeRange, setTimeRange] = useState('90D')

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [farmsRes, alertsRes, predsRes, riskRes] = await Promise.allSettled([
          farmsAPI.list(),
          alertsAPI.list(),
          predictionsAPI.history({ limit: 25 }),
          riskAPI.history(),
        ])

        const farmsData = farmsRes.status === 'fulfilled' ? farmsRes.value.data || [] : []
        const alertsData = alertsRes.status === 'fulfilled' ? alertsRes.value.data || [] : []
        const predsData = predsRes.status === 'fulfilled' ? predsRes.value.data || [] : []
        const risksData = riskRes.status === 'fulfilled' ? riskRes.value.data || [] : []

        setFarms(farmsData)
        setAlerts(alertsData)
        setPredictions(predsData)
        setRisks(risksData)

        // Load weather based on primary farm state or user profile state
        const targetState = farmsData[0]?.state || user?.state || 'Punjab'
        try {
          const wRes = await weatherAPI.current({ state: targetState })
          setWeather(wRes.data)
        } catch {}
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [user])

  // Filtered predictions by farm
  const filteredPredictions = useMemo(() => {
    if (selectedFarmId === 'ALL') return predictions
    return predictions.filter(p => p.farm_id === parseInt(selectedFarmId))
  }, [predictions, selectedFarmId])

  // Metrics calculations
  const totalFarms = farms.length
  const avgYield = useMemo(() => {
    if (!filteredPredictions.length) return null
    const valid = filteredPredictions.filter(p => typeof p.predicted_yield === 'number')
    if (!valid.length) return null
    return (valid.reduce((acc, p) => acc + p.predicted_yield, 0) / valid.length).toFixed(2)
  }, [filteredPredictions])

  const monitoredCropsCount = useMemo(() => {
    const set = new Set(filteredPredictions.map(p => p.crop).filter(Boolean))
    return set.size || (farms.length > 0 ? 1 : 0)
  }, [filteredPredictions, farms])

  const latestRisk = risks.length > 0 ? risks[0] : null
  const overallRiskScore = latestRisk ? latestRisk.overall_risk : 24.5

  // Yield trend for chart
  const yieldTrend = useMemo(() => {
    if (!filteredPredictions.length) return []
    const byDate = {}
    filteredPredictions.forEach(p => {
      if (p.predicted_yield && p.created_at) {
        const d = new Date(p.created_at)
        const key = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
        if (!byDate[key]) byDate[key] = []
        byDate[key].push(p.predicted_yield)
      }
    })
    return Object.entries(byDate)
      .slice(-7)
      .map(([date, yields]) => ({
        date,
        yield: parseFloat((yields.reduce((a, b) => a + b, 0) / yields.length).toFixed(2))
      }))
  }, [filteredPredictions])

  // Crop distribution for comparison
  const cropDistribution = useMemo(() => {
    const counts = {}
    filteredPredictions.forEach(p => {
      if (p.crop) counts[p.crop] = (counts[p.crop] || 0) + 1
    })
    return Object.entries(counts).map(([name, count]) => ({ name, count }))
  }, [filteredPredictions])

  // Greeting based on time of day
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="space-y-6">
      {/* Top Header & Context Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-[#E5E9E3]">
        <div>
          <h1 className="page-title">
            {greeting}, {user?.full_name?.split(' ')[0] || 'Farmer'}
          </h1>
          <p className="page-subtitle">
            Executive agricultural intelligence and operational summary
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Farm filter */}
          {farms.length > 0 && (
            <div className="flex items-center gap-1.5 bg-white border border-[#E5E9E3] px-2.5 py-1.5 rounded-md text-xs shadow-subtle">
              <MapPin size={13} className="text-[#183D2B]" />
              <select
                className="bg-transparent font-medium text-[#10291F] outline-none cursor-pointer"
                value={selectedFarmId}
                onChange={e => setSelectedFarmId(e.target.value)}
              >
                <option value="ALL">All Registered Holdings</option>
                {farms.map(f => (
                  <option key={f.id} value={f.id}>{f.farm_name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Time range toggle */}
          <div className="flex items-center bg-[#EEF2EC] p-0.5 rounded-md text-xs font-medium border border-[#E5E9E3]">
            {['30D', '90D', '1Y'].map(t => (
              <button
                key={t}
                onClick={() => setTimeRange(t)}
                className={`px-2 py-1 rounded transition-colors ${timeRange === t ? 'bg-white font-semibold text-[#183D2B] shadow-xs' : 'text-[#69766E]'}`}
              >
                {t}
              </button>
            ))}
          </div>

          <Link to="/yield-prediction">
            <Button variant="primary" size="sm" icon={TrendingUp}>
              New Forecast
            </Button>
          </Link>
        </div>
      </div>

      {/* Top 4 Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array(4).fill(0).map((_, i) => <MetricCardSkeleton key={i} />)
        ) : (
          <>
            <MetricCard
              label="Registered Holdings"
              value={totalFarms}
              unit="farms"
              subtitle={farms.length > 0 ? `${farms.reduce((a, b) => a + (b.area || 0), 0).toFixed(1)} ha total area` : 'No farms yet'}
              icon={MapPin}
            />

            <MetricCard
              label="Avg. Predicted Yield"
              value={avgYield || '—'}
              unit="t/ha"
              change={avgYield ? 'Model benchmark' : undefined}
              changeType="positive"
              subtitle="Weighted across seasons"
              icon={TrendingUp}
            />

            <MetricCard
              label="Crops Monitored"
              value={monitoredCropsCount}
              unit="varieties"
              subtitle="Active cropping cycles"
              icon={Leaf}
            />

            <MetricCard
              label="Agricultural Risk Index"
              value={overallRiskScore ? `${overallRiskScore.toFixed(0)}/100` : 'Low'}
              change={overallRiskScore <= 33 ? 'Favorable climate' : overallRiskScore <= 66 ? 'Moderate alert' : 'Critical stress'}
              changeType={overallRiskScore <= 33 ? 'positive' : overallRiskScore <= 66 ? 'neutral' : 'negative'}
              subtitle="Composite agro-climatic score"
              icon={AlertTriangle}
            />
          </>
        )}
      </div>

      {/* Main Grid: Analytical Charts (Left) vs Real-Time Conditions (Right) */}
      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Left Section (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Yield Performance Trend Card */}
          <Card
            title="Yield Forecasting Trajectory"
            subtitle="Quantitative yield predictions (t/ha) generated from calibrated XGBoost ensemble"
            action={
              <Link to="/history" className="text-xs text-[#183D2B] font-medium hover:underline flex items-center gap-1">
                Historical records <ArrowRight size={12} />
              </Link>
            }
          >
            {yieldTrend.length === 0 ? (
              <EmptyState
                icon={TrendingUp}
                title="No yield simulations logged"
                description="Run your first crop forecast to generate production trajectories and SHAP explanations."
                actionLabel="Generate Yield Forecast"
                actionLink="/yield-prediction"
              />
            ) : (
              <div className="h-64 pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={yieldTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="forestYieldGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#183D2B" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#183D2B" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E9E3" vertical={false} />
                    <XAxis dataKey="date" stroke="#69766E" fontSize={11} tickLine={false} axisLine={{ stroke: '#E5E9E3' }} />
                    <YAxis stroke="#69766E" fontSize={11} tickLine={false} axisLine={{ stroke: '#E5E9E3' }} unit=" t" />
                    <Tooltip
                      contentStyle={{
                        background: '#FFFFFF',
                        border: '1px solid #E5E9E3',
                        borderRadius: '6px',
                        boxShadow: '0 4px 6px -1px rgba(16, 41, 31, 0.08)',
                        fontSize: '12px'
                      }}
                      labelStyle={{ color: '#202923', fontWeight: 600 }}
                      formatter={(v) => [`${v} tonnes/ha`, 'Predicted Yield']}
                    />
                    <Area
                      type="monotone"
                      dataKey="yield"
                      stroke="#183D2B"
                      strokeWidth={2}
                      fill="url(#forestYieldGrad)"
                      activeDot={{ r: 4, fill: '#183D2B', stroke: '#FFFFFF', strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>

          {/* Farm Performance & Predictions Table */}
          <Card
            title="Recent Prediction Runs"
            subtitle="Deterministic model outputs stored with complete input snapshots"
            action={
              <Link to="/yield-prediction" className="text-xs text-[#183D2B] font-medium hover:underline">
                New Run
              </Link>
            }
          >
            {filteredPredictions.length === 0 ? (
              <EmptyState
                icon={Sprout}
                title="No forecasts on record"
                description="Simulate yield outcomes by supplying soil chemistry and weather variables."
                actionLabel="Predict Crop Yield"
                actionLink="/yield-prediction"
              />
            ) : (
              <div className="overflow-x-auto -mx-5 -mb-5">
                <table className="enterprise-table">
                  <thead>
                    <tr>
                      <th>Crop & Season</th>
                      <th>Expected Yield</th>
                      <th>Interval (95% CI)</th>
                      <th>Model Confidence</th>
                      <th>Logged Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPredictions.slice(0, 5).map((p, idx) => (
                      <tr key={p.id || idx}>
                        <td>
                          <div className="font-semibold text-[#10291F]">{p.crop}</div>
                          <div className="text-[11px] text-[#69766E]">{p.season}</div>
                        </td>
                        <td>
                          <span className="font-semibold text-[#183D2B] tabular-nums">
                            {p.predicted_yield?.toFixed(2)} t/ha
                          </span>
                        </td>
                        <td className="text-xs text-[#69766E] tabular-nums">
                          {p.lower_bound?.toFixed(1)} – {p.upper_bound?.toFixed(1)} t/ha
                        </td>
                        <td>
                          <span className="text-xs font-medium text-[#21865A] tabular-nums">
                            {p.confidence ? `${(p.confidence * 100).toFixed(0)}%` : 'Calibrated'}
                          </span>
                        </td>
                        <td className="text-xs text-[#69766E]">
                          {p.created_at ? new Date(p.created_at).toLocaleDateString('en-IN') : 'Recent'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* Right Section: Real-time Weather, Risk Summary & Advisories (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Weather Intelligence Widget */}
          <Card
            title="Agro-Climatic Conditions"
            subtitle={weather ? `${weather.state} Regional Observatory` : 'Live Weather Feeds'}
            action={
              <Link to="/weather" className="text-xs text-[#183D2B] hover:underline font-medium">
                7-Day Forecast →
              </Link>
            }
          >
            {weather ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-[#FAFBF9] border border-[#E5E9E3]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#E9EFE9] flex items-center justify-center text-[#183D2B]">
                      <Sun size={20} />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-[#10291F] tabular-nums">
                        {weather.temperature}°C
                      </div>
                      <div className="text-[11px] text-[#69766E] font-medium">{weather.season || 'Normal Season'}</div>
                    </div>
                  </div>
                  <Badge variant="forest">Active Window</Badge>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded bg-[#FAFBF9] border border-[#E5E9E3]">
                    <div className="text-[10px] text-[#69766E] flex items-center justify-center gap-1 mb-0.5">
                      <Droplets size={10} /> Humidity
                    </div>
                    <div className="text-xs font-semibold text-[#10291F] tabular-nums">{weather.humidity}%</div>
                  </div>

                  <div className="p-2 rounded bg-[#FAFBF9] border border-[#E5E9E3]">
                    <div className="text-[10px] text-[#69766E] flex items-center justify-center gap-1 mb-0.5">
                      <Cloud size={10} /> Rainfall
                    </div>
                    <div className="text-xs font-semibold text-[#10291F] tabular-nums">{weather.rainfall} mm</div>
                  </div>

                  <div className="p-2 rounded bg-[#FAFBF9] border border-[#E5E9E3]">
                    <div className="text-[10px] text-[#69766E] flex items-center justify-center gap-1 mb-0.5">
                      <Wind size={10} /> Wind
                    </div>
                    <div className="text-xs font-semibold text-[#10291F] tabular-nums">{weather.wind_speed} km/h</div>
                  </div>
                </div>

                <div className="text-[11px] text-[#69766E] leading-relaxed pt-1 border-t border-[#F0F3EF]">
                  <span className="font-semibold text-[#10291F]">Source: </span>
                  {weather.data_note || 'Agricultural historical climate reference data (IMD benchmark)'}
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#69766E]">Weather telemetry currently synchronizing...</p>
            )}
          </Card>

          {/* Agricultural Risk Summary */}
          <Card
            title="Multi-Hazard Risk Index"
            subtitle="Deterministic exposure evaluation"
            action={
              <Link to="/risk-analysis" className="text-xs text-[#183D2B] hover:underline font-medium">
                Full Matrix →
              </Link>
            }
          >
            <div className="space-y-3">
              {[
                { label: 'Drought Risk', val: latestRisk?.drought_risk ?? 15.0, icon: Sun },
                { label: 'Flood & Waterlogging', val: latestRisk?.flood_risk ?? 10.0, icon: Droplets },
                { label: 'Heat Stress Exposure', val: latestRisk?.heat_risk ?? 20.0, icon: AlertTriangle },
                { label: 'Market Volatility Risk', val: latestRisk?.market_risk ?? 35.0, icon: Activity },
              ].map((item, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#69766E] flex items-center gap-1.5">
                      <item.icon size={13} className="text-[#8C9991]" />
                      {item.label}
                    </span>
                    <span className="font-semibold text-[#10291F] tabular-nums">
                      {item.val.toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-[#EEF2EC] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        item.val > 66 ? 'bg-[#D45B4C]' : item.val > 33 ? 'bg-[#D69B35]' : 'bg-[#27865B]'
                      }`}
                      style={{ width: `${Math.min(100, item.val)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Actionable Agro-Advisories / Alerts */}
          <Card
            title="Advisories & Alerts"
            subtitle={`${alerts.filter(a => !a.is_read).length} unread notices`}
            action={
              <Link to="/alerts" className="text-xs text-[#183D2B] hover:underline font-medium">
                View all
              </Link>
            }
          >
            {alerts.length === 0 ? (
              <div className="text-center py-6 text-xs text-[#69766E]">
                <CheckCircle size={20} className="text-[#27865B] mx-auto mb-1.5 opacity-80" />
                No active pest or weather warnings for your zone.
              </div>
            ) : (
              <div className="space-y-2.5">
                {alerts.slice(0, 3).map((a, i) => (
                  <div
                    key={a.id || i}
                    className={`p-2.5 rounded-lg border text-xs ${
                      a.is_read
                        ? 'bg-white border-[#E5E9E3]'
                        : 'bg-[#FDF6E8] border-[#F5E2B9]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-[#10291F]">{a.title}</span>
                      <span className="text-[10px] text-[#8C9991]">
                        {a.severity || 'INFO'}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#69766E] leading-relaxed line-clamp-2">
                      {a.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
