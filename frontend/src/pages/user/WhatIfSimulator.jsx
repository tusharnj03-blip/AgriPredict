import React, { useState, useEffect } from 'react'
import { simulationAPI, farmsAPI } from '../../services/api'
import {
  Zap, TrendingUp, TrendingDown, RefreshCw, Sparkles,
  Sliders, ShieldAlert, ArrowRight, Sun, CloudRain,
  Flame, Droplets, DollarSign, Layers, CheckCircle2
} from 'lucide-react'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ReferenceLine
} from 'recharts'
import toast from 'react-hot-toast'
import Card, { MetricCard } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Badge, { RiskBadge } from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'

const PRESET_SCENARIOS = [
  {
    name: 'El Niño Severe Drought',
    icon: Flame,
    color: 'text-amber-600',
    changes: { rainfall_change: -35, temperature_change: 2.5, irrigation_change: -20, fertilizer_change: 0, moisture_change: -30 },
    desc: 'Low monsoon precipitation, elevated canopy heat, and depleted soil moisture.'
  },
  {
    name: 'Excess Monsoon / Inundation',
    icon: CloudRain,
    color: 'text-sky-600',
    changes: { rainfall_change: 45, temperature_change: -1.0, irrigation_change: 0, fertilizer_change: -10, moisture_change: 40 },
    desc: 'Heavy continuous precipitation, waterlogging risks, and root zone nutrient leaching.'
  },
  {
    name: 'Precision Drip & Fertigation',
    icon: Droplets,
    color: 'text-brand-emerald',
    changes: { rainfall_change: 0, temperature_change: 0, irrigation_change: 30, fertilizer_change: 20, moisture_change: 15 },
    desc: 'Micro-irrigation scheduling and fertigation boosting input use efficiency.'
  },
  {
    name: 'Terminal Heatwave Shock',
    icon: Sun,
    color: 'text-rose-600',
    changes: { rainfall_change: -15, temperature_change: 3.5, irrigation_change: 10, fertilizer_change: 0, moisture_change: -20 },
    desc: 'Premature terminal heat shock during grain filling and ripening.'
  }
]

const CROPS = ['Rice', 'Wheat', 'Maize', 'Cotton', 'Soybean', 'Groundnut', 'Sugarcane']
const STATES = ['Punjab', 'Haryana', 'Uttar Pradesh', 'Madhya Pradesh', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Gujarat', 'Rajasthan']

const CROP_PRICES_PER_TON = {
  Rice: 22030,
  Wheat: 22750,
  Maize: 20900,
  Cotton: 70200,
  Soybean: 46000,
  Groundnut: 63770,
  Sugarcane: 3150
}

export default function WhatIfSimulator() {
  const [farms, setFarms] = useState([])
  const [selectedFarm, setSelectedFarm] = useState('')
  const [activePreset, setActivePreset] = useState(null)

  const [base, setBase] = useState({
    crop: 'Rice',
    state: 'Punjab',
    season: 'Kharif',
    area: 2.5,
    baseline_yield: 4.5
  })

  const [changes, setChanges] = useState({
    rainfall_change: 0,
    temperature_change: 0,
    irrigation_change: 0,
    fertilizer_change: 0,
    moisture_change: 0
  })

  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  // Load farms
  useEffect(() => {
    farmsAPI.list()
      .then(res => setFarms(res.data || []))
      .catch(() => setFarms([]))
  }, [])

  const handleFarmSelect = (farmId) => {
    setSelectedFarm(farmId)
    if (!farmId) return
    const f = farms.find(farm => String(farm.id) === String(farmId))
    if (!f) return

    setBase(prev => ({
      ...prev,
      crop: f.current_crop || prev.crop,
      state: f.state || prev.state,
      area: f.area || prev.area,
      baseline_yield: f.current_crop === 'Wheat' ? 4.6 : f.current_crop === 'Cotton' ? 2.3 : 4.4
    }))
    toast.success(`Loaded parameters from ${f.name}`)
  }

  const applyPreset = (preset) => {
    setActivePreset(preset.name)
    setChanges({ ...preset.changes })
    toast.success(`Preset applied: ${preset.name}`)
  }

  const handleSliderChange = (k, v) => {
    setActivePreset(null)
    setChanges(c => ({ ...c, [k]: parseFloat(v) }))
  }

  const handleSimulate = async (e) => {
    if (e) e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        crop: base.crop,
        state: base.state,
        baseline_yield: base.baseline_yield,
        area: base.area,
        rainfall_pct_change: changes.rainfall_change,
        temperature_delta_c: changes.temperature_change,
        irrigation_pct_change: changes.irrigation_change,
        fertilizer_pct_change: changes.fertilizer_change,
        moisture_pct_change: changes.moisture_change
      }
      const { data } = await simulationAPI.simulate(payload)
      setResult(data)
      toast.success('Simulation executed')
    } catch {
      // Deterministic simulation model
      const baseYield = parseFloat(base.baseline_yield) || 4.5
      const rainDelta = (changes.rainfall_change / 100) * 0.35
      const tempDelta = -(changes.temperature_change * 0.08)
      const irrDelta = (changes.irrigation_change / 100) * 0.25
      const fertDelta = (changes.fertilizer_change / 100) * 0.20
      const moistDelta = (changes.moisture_change / 100) * 0.15

      const totalImpactFactor = rainDelta + tempDelta + irrDelta + fertDelta + moistDelta
      const simYield = Math.max(0.8, Number((baseYield * (1 + totalImpactFactor)).toFixed(2)))
      const deltaYield = Number((simYield - baseYield).toFixed(2))
      const pctYield = Number(((deltaYield / baseYield) * 100).toFixed(1))

      const pricePerTon = CROP_PRICES_PER_TON[base.crop] || 22000
      const baseRevenue = Math.round(baseYield * base.area * pricePerTon)
      const simRevenue = Math.round(simYield * base.area * pricePerTon)
      const deltaRevenue = simRevenue - baseRevenue

      const baseRisk = 30
      let simRisk = baseRisk
      if (changes.rainfall_change < -20 || changes.temperature_change > 2) simRisk += 30
      if (changes.rainfall_change > 35) simRisk += 25
      if (changes.irrigation_change > 20) simRisk -= 10
      simRisk = Math.max(10, Math.min(95, simRisk))

      setResult({
        baseline_yield: baseYield,
        simulated_yield: simYield,
        yield_delta: deltaYield,
        yield_pct_change: pctYield,
        base_revenue: baseRevenue,
        simulated_revenue: simRevenue,
        revenue_delta: deltaRevenue,
        simulated_risk_score: simRisk,
        risk_category: simRisk >= 65 ? 'high' : simRisk >= 40 ? 'medium' : 'low'
      })
      toast.success('Simulation results computed')
    } finally {
      setLoading(false)
    }
  }

  const comparisonData = result ? [
    {
      metric: 'Yield (t/ha)',
      Baseline: result.baseline_yield,
      Simulated: result.simulated_yield
    }
  ] : []

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-brand-border">
        <div>
          <h1 className="text-2xl font-semibold text-brand-text tracking-tight flex items-center gap-2.5">
            <Zap className="w-6 h-6 text-brand-emerald" />
            What-If Scenario Simulator
          </h1>
          <p className="text-sm text-brand-secondary mt-1">
            Simulate environmental anomalies, input interventions, and financial sensitivity analysis.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {farms.length > 0 && (
            <div className="w-56">
              <Select
                value={selectedFarm}
                onChange={e => handleFarmSelect(e.target.value)}
                options={[
                  { value: '', label: 'Load registered farm...' },
                  ...farms.map(f => ({ value: String(f.id), label: `${f.name} (${f.current_crop || 'Farm'})` }))
                ]}
              />
            </div>
          )}

          <Button
            variant="secondary"
            onClick={() => {
              setChanges({ rainfall_change: 0, temperature_change: 0, irrigation_change: 0, fertilizer_change: 0, moisture_change: 0 })
              setActivePreset(null)
              toast.success('Parameters reset to neutral')
            }}
            icon={RefreshCw}
          >
            Reset
          </Button>
        </div>
      </div>

      {/* Preset Scenarios Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {PRESET_SCENARIOS.map(p => {
          const Icon = p.icon
          const isSelected = activePreset === p.name
          return (
            <button
              key={p.name}
              type="button"
              onClick={() => applyPreset(p)}
              className={`p-3.5 rounded-lg border text-left transition-all ${
                isSelected
                  ? 'border-brand-emerald bg-brand-bg shadow-sm'
                  : 'border-brand-border bg-brand-surface hover:border-brand-emerald/60'
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-semibold text-brand-text">
                <Icon className={`w-4 h-4 ${p.color}`} />
                <span>{p.name}</span>
              </div>
              <p className="text-[11px] text-brand-secondary mt-1 line-clamp-2 leading-relaxed">
                {p.desc}
              </p>
            </button>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Left Parameter Tuning Column */}
        <div className="lg:col-span-5 space-y-5">
          <Card
            title="Baseline Profile"
            subtitle="Crop variety and standard historical yield benchmark"
          >
            <div className="grid grid-cols-2 gap-3 mb-4">
              <Select
                label="Crop"
                value={base.crop}
                onChange={e => setBase(b => ({ ...b, crop: e.target.value }))}
                options={CROPS.map(c => ({ value: c, label: c }))}
              />
              <Select
                label="State"
                value={base.state}
                onChange={e => setBase(b => ({ ...b, state: e.target.value }))}
                options={STATES.map(s => ({ value: s, label: s }))}
              />
              <Input
                label="Farm Area"
                type="number"
                step="0.5"
                unit="ha"
                value={base.area}
                onChange={e => setBase(b => ({ ...b, area: parseFloat(e.target.value) || 1 }))}
              />
              <Input
                label="Baseline Yield"
                type="number"
                step="0.1"
                unit="t/ha"
                value={base.baseline_yield}
                onChange={e => setBase(b => ({ ...b, baseline_yield: parseFloat(e.target.value) || 0 }))}
              />
            </div>
          </Card>

          <Card
            title="Intervention & Anomaly Sliders"
            subtitle="Simulate deviations from standard seasonal norms"
          >
            <div className="space-y-4 pt-1">
              <div>
                <div className="flex justify-between text-xs font-medium text-brand-text mb-1">
                  <span>Precipitation Deviation</span>
                  <span className="font-mono font-semibold">{changes.rainfall_change > 0 ? `+${changes.rainfall_change}%` : `${changes.rainfall_change}%`}</span>
                </div>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  step="5"
                  value={changes.rainfall_change}
                  onChange={e => handleSliderChange('rainfall_change', e.target.value)}
                  className="w-full h-1.5 bg-brand-bg rounded-lg appearance-none cursor-pointer accent-brand-emerald border border-brand-border"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-brand-text mb-1">
                  <span>Temperature Delta</span>
                  <span className="font-mono font-semibold">{changes.temperature_change > 0 ? `+${changes.temperature_change}°C` : `${changes.temperature_change}°C`}</span>
                </div>
                <input
                  type="range"
                  min="-5"
                  max="5"
                  step="0.5"
                  value={changes.temperature_change}
                  onChange={e => handleSliderChange('temperature_change', e.target.value)}
                  className="w-full h-1.5 bg-brand-bg rounded-lg appearance-none cursor-pointer accent-brand-emerald border border-brand-border"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-brand-text mb-1">
                  <span>Irrigation Availability</span>
                  <span className="font-mono font-semibold">{changes.irrigation_change > 0 ? `+${changes.irrigation_change}%` : `${changes.irrigation_change}%`}</span>
                </div>
                <input
                  type="range"
                  min="-40"
                  max="50"
                  step="5"
                  value={changes.irrigation_change}
                  onChange={e => handleSliderChange('irrigation_change', e.target.value)}
                  className="w-full h-1.5 bg-brand-bg rounded-lg appearance-none cursor-pointer accent-brand-emerald border border-brand-border"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-brand-text mb-1">
                  <span>Fertilizer / Nutrient Input</span>
                  <span className="font-mono font-semibold">{changes.fertilizer_change > 0 ? `+${changes.fertilizer_change}%` : `${changes.fertilizer_change}%`}</span>
                </div>
                <input
                  type="range"
                  min="-30"
                  max="40"
                  step="5"
                  value={changes.fertilizer_change}
                  onChange={e => handleSliderChange('fertilizer_change', e.target.value)}
                  className="w-full h-1.5 bg-brand-bg rounded-lg appearance-none cursor-pointer accent-brand-emerald border border-brand-border"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-brand-text mb-1">
                  <span>Soil Moisture Deviation</span>
                  <span className="font-mono font-semibold">{changes.moisture_change > 0 ? `+${changes.moisture_change}%` : `${changes.moisture_change}%`}</span>
                </div>
                <input
                  type="range"
                  min="-40"
                  max="40"
                  step="5"
                  value={changes.moisture_change}
                  onChange={e => handleSliderChange('moisture_change', e.target.value)}
                  className="w-full h-1.5 bg-brand-bg rounded-lg appearance-none cursor-pointer accent-brand-emerald border border-brand-border"
                />
              </div>

              <div className="pt-2">
                <Button
                  type="button"
                  variant="primary"
                  className="w-full"
                  loading={loading}
                  onClick={handleSimulate}
                  icon={Zap}
                >
                  Run Simulation
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Output Column */}
        <div className="lg:col-span-7 space-y-5">
          {result ? (
            <>
              {/* Top Delta Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg border border-brand-border bg-brand-surface space-y-1">
                  <div className="text-xs text-brand-secondary font-medium">Simulated Yield</div>
                  <div className="text-2xl font-semibold font-mono text-brand-text tabular-nums">
                    {result.simulated_yield} <span className="text-xs font-normal text-brand-secondary">t/ha</span>
                  </div>
                  <div className={`text-xs font-mono font-medium flex items-center gap-1 ${
                    result.yield_delta >= 0 ? 'text-brand-emerald' : 'text-risk-high'
                  }`}>
                    {result.yield_delta >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    <span>{result.yield_delta >= 0 ? `+${result.yield_delta}` : result.yield_delta} t/ha ({result.yield_pct_change}%)</span>
                  </div>
                </div>

                <div className="p-4 rounded-lg border border-brand-border bg-brand-surface space-y-1">
                  <div className="text-xs text-brand-secondary font-medium">Revenue Impact</div>
                  <div className="text-2xl font-semibold font-mono text-brand-text tabular-nums">
                    ₹{Math.abs(result.revenue_delta).toLocaleString('en-IN')}
                  </div>
                  <div className={`text-xs font-mono font-medium ${
                    result.revenue_delta >= 0 ? 'text-brand-emerald' : 'text-risk-high'
                  }`}>
                    {result.revenue_delta >= 0 ? 'Net gain over baseline' : 'Potential economic loss'}
                  </div>
                </div>

                <div className="p-4 rounded-lg border border-brand-border bg-brand-surface space-y-1">
                  <div className="text-xs text-brand-secondary font-medium">Simulated Risk Index</div>
                  <div className="text-2xl font-semibold font-mono text-brand-text tabular-nums">
                    {result.simulated_risk_score} <span className="text-xs font-normal text-brand-secondary">/ 100</span>
                  </div>
                  <div className="pt-0.5">
                    <RiskBadge level={result.risk_category} />
                  </div>
                </div>
              </div>

              {/* Comparative Chart */}
              <Card
                title="Yield Delta Comparison"
                subtitle="Baseline harvest vs simulated scenario output (tonnes/hectare)"
              >
                <div className="h-64 pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={comparisonData} margin={{ top: 15, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid stroke="#E5E9E3" strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="metric" tick={{ fill: '#69766E', fontSize: 12 }} />
                      <YAxis tick={{ fill: '#69766E', fontSize: 12 }} domain={[0, 'auto']} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5E9E3', borderRadius: '8px', fontSize: '12px' }}
                      />
                      <Legend />
                      <Bar dataKey="Baseline" fill="#183D2B" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Simulated" fill="#21865A" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Economic Breakdown */}
              <Card
                title="Financial Sensitivity Breakdown"
                subtitle={`Calculated based on current MSP/market price for ${base.crop} across ${base.area} hectares`}
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-brand-border text-xs">
                    <span className="text-brand-secondary">Baseline Expected Gross Revenue</span>
                    <span className="font-mono font-medium text-brand-text">₹{result.base_revenue?.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-brand-border text-xs">
                    <span className="text-brand-secondary">Simulated Gross Revenue</span>
                    <span className="font-mono font-semibold text-brand-text">₹{result.simulated_revenue?.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 text-xs">
                    <span className="text-brand-secondary font-medium">Variance (Delta)</span>
                    <span className={`font-mono font-bold ${result.revenue_delta >= 0 ? 'text-brand-emerald' : 'text-risk-high'}`}>
                      {result.revenue_delta >= 0 ? `+₹${result.revenue_delta?.toLocaleString('en-IN')}` : `-₹${Math.abs(result.revenue_delta)?.toLocaleString('en-IN')}`}
                    </span>
                  </div>
                </div>
              </Card>
            </>
          ) : (
            <Card>
              <EmptyState
                icon={Zap}
                title="No Simulation Executed"
                description="Select an anomaly scenario preset or adjust the environmental and input sliders to simulate agricultural yields and revenue sensitivity."
                action={{
                  label: 'Run Simulation',
                  onClick: handleSimulate
                }}
              />
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
