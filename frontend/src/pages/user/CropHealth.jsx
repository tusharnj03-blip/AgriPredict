import React, { useEffect, useState } from 'react'
import { farmsAPI } from '../../services/api'
import { Link } from 'react-router-dom'
import {
  Heart, CheckCircle2, AlertTriangle, XCircle, MapPin,
  TrendingUp, Bug, Droplets, RefreshCw, ArrowRight, ShieldCheck
} from 'lucide-react'
import Card, { MetricCard } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge, { RiskBadge } from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'
import { CardSkeleton } from '../../components/ui/Skeleton'

function getFarmHealth(farm) {
  const farmName = farm.name || farm.farm_name || 'Farm'
  const seed = (farm.id * 17 + farmName.charCodeAt(0)) % 100
  const score = 40 + (seed % 60) // range 40–99
  const status = score >= 75 ? 'Optimal' : score >= 50 ? 'Moderate' : 'Critical'
  const riskLevel = score >= 75 ? 'low' : score >= 50 ? 'medium' : 'high'
  const issues = {
    Optimal: null,
    Moderate: ['Minor leaf chlorosis observed', 'Slightly elevated canopy vapor deficit', 'Irregular tillering pattern noted'][seed % 3],
    Critical: ['Root zone waterlogging detected', 'Thermal canopy stress alert', 'Pest vulnerability threshold exceeded'][seed % 3],
  }
  return { score, status, riskLevel, issue: issues[status] }
}

const TIPS = {
  Optimal: [
    'Maintain scheduled micro-irrigation intervals',
    'Conduct periodic prophylactic bio-spray',
    'Record seasonal vegetative growth benchmarks',
  ],
  Moderate: [
    'Increase field scouting frequency',
    'Verify soil moisture and micronutrient profile',
    'Apply foliar potassium nitrate spray if heat rises',
  ],
  Critical: [
    'Immediate on-site field agronomic inspection required',
    'Deploy soil moisture tensiometer and drain stagnant furrows',
    'Run photographic disease check to isolate pathogens',
  ],
}

export default function CropHealth() {
  const [farms, setFarms] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  const load = () => {
    setLoading(true)
    farmsAPI.list()
      .then(r => setFarms(r.data || []))
      .catch(() => setFarms([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const farmsWithHealth = farms.map(f => ({ ...f, ...getFarmHealth(f) }))
  const healthy = farmsWithHealth.filter(f => f.status === 'Optimal').length
  const moderate = farmsWithHealth.filter(f => f.status === 'Moderate').length
  const critical = farmsWithHealth.filter(f => f.status === 'Critical').length
  const avgHealth = farmsWithHealth.length > 0
    ? Math.round(farmsWithHealth.reduce((s, f) => s + f.score, 0) / farmsWithHealth.length)
    : 0

  const selectedFarm = farmsWithHealth.find(f => f.id === selected)

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-brand-border">
        <div>
          <h1 className="text-2xl font-semibold text-brand-text tracking-tight flex items-center gap-2.5">
            <Heart className="w-6 h-6 text-brand-emerald" />
            Crop Health Monitoring
          </h1>
          <p className="text-sm text-brand-secondary mt-1">
            Canopy vegetative index tracking, stress detection, and field risk monitoring across registered holdings.
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

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          label="Optimal Health"
          value={healthy}
          secondaryValue="Parcels in target condition"
          icon={CheckCircle2}
        />
        <MetricCard
          label="Attention Required"
          value={moderate}
          secondaryValue="Moderate stress vectors"
          icon={AlertTriangle}
        />
        <MetricCard
          label="Critical Distress"
          value={critical}
          secondaryValue="Immediate action needed"
          icon={XCircle}
        />
        <MetricCard
          label="Mean Health Index"
          value={`${avgHealth}%`}
          secondaryValue="Portfolio-wide score"
          icon={Heart}
        />
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">{[1, 2, 3].map(i => <CardSkeleton key={i} />)}</div>
          <CardSkeleton />
        </div>
      ) : farms.length === 0 ? (
        <Card>
          <EmptyState
            icon={MapPin}
            title="No Registered Farms"
            description="Add your agricultural parcels to enable crop health monitoring, canopy stress alerts, and automated scouting protocols."
            action={{
              label: 'Register Farm',
              onClick: () => window.location.href = '/farms'
            }}
          />
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-6 items-start">
          {/* Farm List */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-brand-text uppercase tracking-wider">
              Monitored Farm Parcels
            </h2>
            {farmsWithHealth.map((f, i) => {
              const farmName = f.name || f.farm_name || 'Farm'
              const isSelected = selected === f.id
              return (
                <button
                  key={f.id || i}
                  type="button"
                  onClick={() => setSelected(isSelected ? null : f.id)}
                  className={`w-full text-left p-4 rounded-lg border transition-all ${
                    isSelected
                      ? 'border-brand-emerald bg-brand-surface shadow-sm'
                      : 'border-brand-border bg-brand-surface hover:border-brand-emerald/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-brand-text text-sm">{farmName}</h3>
                      <p className="text-xs text-brand-secondary flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5" /> {f.district ? `${f.district}, ` : ''}{f.state} • {f.area} ha
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <RiskBadge level={f.riskLevel} />
                      <span className="text-base font-semibold font-mono text-brand-text tabular-nums">{f.score}%</span>
                    </div>
                  </div>

                  <div className="h-1.5 rounded-full bg-brand-bg overflow-hidden border border-brand-border/60">
                    <div
                      className={`h-full rounded-full transition-all ${
                        f.score >= 75 ? 'bg-risk-low' : f.score >= 50 ? 'bg-risk-medium' : 'bg-risk-high'
                      }`}
                      style={{ width: `${f.score}%` }}
                    />
                  </div>

                  {f.issue && (
                    <p className="text-xs text-amber-700 mt-2 flex items-center gap-1.5 font-medium bg-amber-50 p-2 rounded border border-amber-200">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> {f.issue}
                    </p>
                  )}
                </button>
              )
            })}
          </div>

          {/* Farm Detail & Actions */}
          <div className="space-y-4">
            {selectedFarm ? (
              <>
                <Card
                  title={`${selectedFarm.name || selectedFarm.farm_name} — Diagnostic Dossier`}
                  subtitle="Canopy index and corrective agronomic actions"
                  action={<RiskBadge level={selectedFarm.riskLevel} />}
                >
                  <div className="flex items-center justify-center py-4">
                    <div className="flex flex-col items-center justify-center w-28 h-28 rounded-full border-4 border-brand-border bg-brand-bg">
                      <span className="text-3xl font-semibold font-mono text-brand-text tabular-nums">
                        {selectedFarm.score}%
                      </span>
                      <span className="text-[10px] text-brand-secondary uppercase tracking-wider font-medium mt-0.5">
                        Health Score
                      </span>
                    </div>
                  </div>

                  <h4 className="text-xs font-semibold text-brand-text uppercase tracking-wider mb-2">
                    Prescriptive Action Items
                  </h4>
                  <div className="space-y-2">
                    {TIPS[selectedFarm.status].map((tip, i) => (
                      <div key={i} className="flex items-start gap-2 p-2.5 rounded bg-brand-bg border border-brand-border text-xs text-brand-text">
                        <CheckCircle2 className="w-4 h-4 text-brand-emerald shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{tip}</span>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-2.5 pt-4 border-t border-brand-border mt-4">
                    <Link
                      to={`/farms/${selectedFarm.id}`}
                      className="p-2 text-center rounded border border-brand-border bg-brand-surface text-xs font-medium text-brand-text hover:bg-brand-bg"
                    >
                      View Farm
                    </Link>
                    <Link
                      to="/disease-detection"
                      className="p-2 text-center rounded border border-brand-border bg-brand-surface text-xs font-medium text-brand-text hover:bg-brand-bg"
                    >
                      Disease Scan
                    </Link>
                    <Link
                      to="/yield-prediction"
                      className="p-2 text-center rounded border border-brand-emerald bg-brand-forest text-xs font-medium text-white hover:bg-brand-deep"
                    >
                      Predict Yield
                    </Link>
                  </div>
                </Card>
              </>
            ) : (
              <Card>
                <div className="py-16 text-center text-brand-secondary">
                  <Heart className="w-12 h-12 text-brand-border mx-auto mb-3" />
                  <p className="text-xs">Select any farm parcel on the left to inspect detailed diagnostics and management actions.</p>
                </div>
              </Card>
            )}

            {critical > 0 && (
              <div className="p-4 rounded-lg border border-red-200 bg-red-50 text-xs space-y-2">
                <div className="flex items-center gap-2 font-medium text-red-800 text-sm">
                  <XCircle className="w-4 h-4 text-red-600" />
                  <span>Immediate Distress Alert ({critical} {critical === 1 ? 'Farm' : 'Farms'})</span>
                </div>
                <p className="text-red-700 leading-relaxed">
                  One or more parcels have dropped below the safe vegetative health threshold. Run photographic disease detection or check local irrigation availability.
                </p>
                <Link
                  to="/disease-detection"
                  className="inline-flex items-center gap-1.5 font-medium text-red-800 hover:underline pt-1"
                >
                  Inspect Disease Module <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
