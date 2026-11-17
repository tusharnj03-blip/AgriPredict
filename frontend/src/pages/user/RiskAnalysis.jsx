import React, { useState, useEffect } from 'react'
import { riskAPI, farmsAPI, weatherAPI } from '../../services/api'
import {
  AlertTriangle, ShieldAlert, ShieldCheck, RefreshCw,
  Umbrella, Droplets, Flame, Waves, HelpCircle,
  TrendingDown, CheckCircle2, ChevronRight, Layers,
  Sparkles, FileText, ArrowRight, Printer, AlertCircle
} from 'lucide-react'
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  ResponsiveContainer
} from 'recharts'
import toast from 'react-hot-toast'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Badge, { RiskBadge } from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'

const STATES = [
  'Punjab', 'Haryana', 'Uttar Pradesh', 'Madhya Pradesh',
  'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Andhra Pradesh',
  'Gujarat', 'Rajasthan', 'West Bengal', 'Bihar', 'Telangana'
]

const CROPS = ['Rice', 'Wheat', 'Cotton', 'Maize', 'Soybean', 'Groundnut', 'Sugarcane', 'Potato', 'Tomato']
const SEASONS = ['Kharif', 'Rabi', 'Zaid']

const RISK_ADVISORIES = {
  drought_risk: {
    title: 'Drought & Moisture Stress',
    icon: Flame,
    color: 'text-amber-600',
    borderColor: 'border-amber-200',
    bgColor: 'bg-amber-50/50',
    highAdvice: 'Adopt drip micro-irrigation, apply straw mulching to conserve topsoil moisture, and consider drought-hardy varieties.',
    mediumAdvice: 'Schedule irrigations during critical growth stages (tillering, panicle emergence). Monitor tensiometers.',
    lowAdvice: 'Adequate moisture profile. Standard irrigation intervals sufficient.'
  },
  flood_risk: {
    title: 'Inundation & Waterlogging',
    icon: Waves,
    color: 'text-sky-600',
    borderColor: 'border-sky-200',
    bgColor: 'bg-sky-50/50',
    highAdvice: 'Excavate lateral drainage trenches immediately. Avoid basal nitrogen application during continuous rainfall to prevent runoff loss.',
    mediumAdvice: 'Ensure field bund outlets are cleared of silt. Prepare prophylactic copper oxychloride sprays against root rot.',
    lowAdvice: 'Minimal flood risk under current precipitation patterns.'
  },
  heat_risk: {
    title: 'Canopy Heat Stress',
    icon: Flame,
    color: 'text-rose-600',
    borderColor: 'border-rose-200',
    bgColor: 'bg-rose-50/50',
    highAdvice: 'Provide light frequent early morning irrigations. Spray 2% potassium nitrate (KNO3) to alleviate terminal heat shock.',
    mediumAdvice: 'Maintain canopy humidity with sprinkler misting where possible during peak noon hours.',
    lowAdvice: 'Thermal regime is within optimal physiological thresholds.'
  },
  water_risk: {
    title: 'Vapor Deficit & Humidity Stress',
    icon: Droplets,
    color: 'text-teal-600',
    borderColor: 'border-teal-200',
    bgColor: 'bg-teal-50/50',
    highAdvice: 'Extreme vapor pressure deficit. Inspect for spider mites in dry air, or fungal spores in stagnant humid air.',
    mediumAdvice: 'Moderate atmospheric stress. Maintain regular leaf wetness monitoring.',
    lowAdvice: 'Vapor pressure deficit in equilibrium.'
  },
  soil_risk: {
    title: 'Soil pH & Nutrient Fixation',
    icon: Layers,
    color: 'text-amber-700',
    borderColor: 'border-amber-200',
    bgColor: 'bg-amber-50/50',
    highAdvice: 'Severe pH imbalance limiting micronutrient availability. Apply agricultural gypsum (if alkaline) or lime (if acidic).',
    mediumAdvice: 'Mild pH deviation. Incorporate farmyard manure to buffer root zone acidity.',
    lowAdvice: 'Soil pH is well-balanced for the targeted crop.'
  },
  market_risk: {
    title: 'Market Volatility & Price Risk',
    icon: TrendingDown,
    color: 'text-orange-600',
    borderColor: 'border-orange-200',
    bgColor: 'bg-orange-50/50',
    highAdvice: 'High price volatility. Register on e-NAM for interstate auction access and utilize WDRA registered warehouses for pledge finance.',
    mediumAdvice: 'Moderate price swings. Stagger marketing across 2-3 months post-harvest rather than immediate distress sale.',
    lowAdvice: 'Stable MSP procurement support exists for this commodity.'
  }
}

export default function RiskAnalysis() {
  const [farms, setFarms] = useState([])
  const [selectedFarm, setSelectedFarm] = useState('')
  const [weatherLoading, setWeatherLoading] = useState(false)

  const [form, setForm] = useState({
    state: 'Punjab',
    crop: 'Rice',
    season: 'Kharif',
    rainfall: 620,
    temperature: 28,
    humidity: 64,
    soil_ph: 6.8
  })

  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  // Load farms
  useEffect(() => {
    farmsAPI.list()
      .then(res => setFarms(res.data || []))
      .catch(() => setFarms([]))
  }, [])

  // Sync state weather
  const syncWeather = async (stateName) => {
    if (!stateName) return
    setWeatherLoading(true)
    try {
      const res = await weatherAPI.current({ state: stateName })
      if (res.data) {
        setForm(prev => ({
          ...prev,
          state: stateName,
          temperature: Math.round(res.data.temperature || 28),
          humidity: Math.round(res.data.humidity || 65),
          rainfall: Math.round(res.data.rainfall || 600)
        }))
        toast.success(`Weather parameters updated for ${stateName}`)
      }
    } catch {
      // Keep existing
    } finally {
      setWeatherLoading(false)
    }
  }

  const handleStateChange = (st) => {
    setForm(f => ({ ...f, state: st }))
    syncWeather(st)
  }

  const handleFarmSelect = (farmId) => {
    setSelectedFarm(farmId)
    if (!farmId) return
    const f = farms.find(farm => String(farm.id) === String(farmId))
    if (!f) return

    setForm(prev => ({
      ...prev,
      state: f.state || prev.state,
      crop: f.current_crop || prev.crop
    }))
    if (f.state) syncWeather(f.state)
    toast.success(`Farm context applied: ${f.name}`)
  }

  const u = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const un = (k, v) => setForm(f => ({ ...f, [k]: parseFloat(v) || 0 }))

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        state: form.state,
        crop: form.crop,
        season: form.season,
        rainfall: parseFloat(form.rainfall) || 0,
        temperature: parseFloat(form.temperature) || 25,
        humidity: parseFloat(form.humidity) || 60,
        soil_ph: parseFloat(form.soil_ph) || 7.0
      }
      const { data } = await riskAPI.analyze(payload)
      setResult(data)
      toast.success('Agricultural risk matrix generated')
    } catch (err) {
      // Deterministic agronomic calculation fallback
      const rain = parseFloat(form.rainfall) || 600
      const temp = parseFloat(form.temperature) || 28
      const hum = parseFloat(form.humidity) || 60
      const ph = parseFloat(form.soil_ph) || 6.8

      const droughtRisk = Math.max(10, Math.min(95, Math.round((1 - rain / 800) * 80)))
      const floodRisk = Math.max(5, Math.min(90, Math.round(Math.max(0, (rain - 800) / 10))))
      const heatRisk = Math.max(10, Math.min(90, Math.round(Math.abs(temp - 26) * 6)))
      const waterRisk = Math.max(10, Math.min(85, Math.round(Math.abs(hum - 65) * 1.5)))
      const soilRisk = Math.max(10, Math.min(90, Math.round(Math.abs(ph - 6.8) * 25)))
      const marketRisk = form.crop === 'Cotton' || form.crop === 'Tomato' ? 55 : 28

      const overall = Math.round(
        droughtRisk * 0.25 + floodRisk * 0.20 + heatRisk * 0.15 +
        waterRisk * 0.15 + soilRisk * 0.10 + marketRisk * 0.15
      )

      setResult({
        drought_risk: droughtRisk,
        flood_risk: floodRisk,
        heat_risk: heatRisk,
        water_risk: waterRisk,
        soil_risk: soilRisk,
        market_risk: marketRisk,
        overall_risk: overall
      })
      toast.success('Risk assessment calculated')
    } finally {
      setLoading(false)
    }
  }

  const getRiskCategory = (score) => {
    if (score >= 65) return { label: 'High', level: 'high', color: 'text-risk-high', bg: 'bg-red-50 text-red-700 border-red-200' }
    if (score >= 40) return { label: 'Medium', level: 'medium', color: 'text-risk-medium', bg: 'bg-amber-50 text-amber-700 border-amber-200' }
    return { label: 'Low', level: 'low', color: 'text-risk-low', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
  }

  const risks = result ? [
    { key: 'drought_risk', name: 'Drought & Moisture Deficit', value: result.drought_risk },
    { key: 'flood_risk', name: 'Inundation & Waterlogging', value: result.flood_risk },
    { key: 'heat_risk', name: 'Canopy Heat Stress', value: result.heat_risk },
    { key: 'water_risk', name: 'Vapor & Humidity Stress', value: result.water_risk },
    { key: 'soil_risk', name: 'Soil Fixation & pH Imbalance', value: result.soil_risk },
    { key: 'market_risk', name: 'Market Volatility & Price Risk', value: result.market_risk },
  ] : []

  const radarData = risks.map(r => ({
    subject: r.name.split(' ')[0],
    fullName: r.name,
    value: r.value,
    fullMark: 100
  }))

  const overallScore = result?.overall_risk || 0
  const overallCategory = getRiskCategory(overallScore)

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-brand-border">
        <div>
          <h1 className="text-2xl font-semibold text-brand-text tracking-tight flex items-center gap-2.5">
            <ShieldAlert className="w-6 h-6 text-brand-emerald" />
            Risk Intelligence
          </h1>
          <p className="text-sm text-brand-secondary mt-1">
            Multi-hazard predictive assessment across climatic, edaphic, and commercial vectors.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {farms.length > 0 && (
            <div className="w-56">
              <Select
                value={selectedFarm}
                onChange={e => handleFarmSelect(e.target.value)}
                options={[
                  { value: '', label: 'Select registered farm...' },
                  ...farms.map(f => ({ value: String(f.id), label: `${f.name} (${f.current_crop || 'Farm'})` }))
                ]}
              />
            </div>
          )}

          <Button
            variant="secondary"
            onClick={() => window.print()}
            icon={Printer}
          >
            Export
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Left Form Column */}
        <div className="lg:col-span-5 space-y-5">
          <Card
            title="Agro-Climatic Parameters"
            subtitle="Configure regional parameters or load from state weather"
            action={
              weatherLoading ? (
                <span className="text-xs text-brand-emerald flex items-center gap-1 font-mono">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Syncing...
                </span>
              ) : null
            }
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="State / Region"
                  value={form.state}
                  onChange={e => handleStateChange(e.target.value)}
                  options={STATES.map(s => ({ value: s, label: s }))}
                />
                <Select
                  label="Crop"
                  value={form.crop}
                  onChange={e => u('crop', e.target.value)}
                  options={CROPS.map(c => ({ value: c, label: c }))}
                />
              </div>

              <Select
                label="Cropping Season"
                value={form.season}
                onChange={e => u('season', e.target.value)}
                options={SEASONS.map(s => ({ value: s, label: s }))}
              />

              <div className="pt-3 border-t border-brand-border">
                <h4 className="text-xs font-semibold text-brand-text uppercase tracking-wider mb-3">
                  Meteorological Observations
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Rainfall"
                    type="number"
                    unit="mm"
                    value={form.rainfall}
                    onChange={e => un('rainfall', e.target.value)}
                  />
                  <Input
                    label="Temperature"
                    type="number"
                    step="0.5"
                    unit="°C"
                    value={form.temperature}
                    onChange={e => un('temperature', e.target.value)}
                  />
                  <Input
                    label="Relative Humidity"
                    type="number"
                    unit="%"
                    value={form.humidity}
                    onChange={e => un('humidity', e.target.value)}
                  />
                  <Input
                    label="Soil pH"
                    type="number"
                    step="0.1"
                    unit="pH"
                    value={form.soil_ph}
                    onChange={e => un('soil_ph', e.target.value)}
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                loading={loading}
                icon={AlertTriangle}
              >
                Compute Risk Matrix
              </Button>
            </form>
          </Card>

          {/* PMFBY Advisory Notice */}
          <div className="rounded-lg border border-brand-border bg-brand-surface p-4 text-xs text-brand-secondary space-y-2">
            <div className="flex items-center gap-2 text-brand-text font-medium text-sm">
              <Umbrella className="w-4 h-4 text-brand-emerald" />
              <span>PMFBY Policy Advisory</span>
            </div>
            <p className="leading-relaxed">
              When composite risk surpasses 45, enrollment under Pradhan Mantri Fasal Bima Yojana (PMFBY) is strongly advised. Government-subsidized farmer premiums are capped at 2.0% for Kharif and 1.5% for Rabi food and oilseed crops.
            </p>
          </div>
        </div>

        {/* Right Output Column */}
        <div className="lg:col-span-7 space-y-5">
          {result ? (
            <>
              {/* Executive Composite Metric */}
              <div className="rounded-lg border border-brand-border bg-brand-surface p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                  <div className="flex items-center gap-5">
                    <div className="flex flex-col items-center justify-center w-20 h-20 rounded-xl bg-brand-bg border border-brand-border">
                      <span className={`text-3xl font-semibold font-mono tabular-nums ${overallCategory.color}`}>
                        {overallScore}
                      </span>
                      <span className="text-[10px] text-brand-secondary uppercase font-medium mt-0.5">/ 100</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <RiskBadge level={overallCategory.level} />
                        <span className="text-xs text-brand-secondary font-mono">Index Score: {overallScore}/100</span>
                      </div>
                      <h3 className="text-base font-semibold text-brand-text mt-1.5">
                        {overallScore >= 65 ? 'Elevated Vulnerabilities Detected' :
                         overallScore >= 40 ? 'Moderate Hazard — Targeted Mitigations Advised' :
                         'Optimal Agro-Climatic Resilience'}
                      </h3>
                      <p className="text-xs text-brand-secondary mt-0.5">
                        Evaluated for {form.crop} in {form.state} ({form.season} Season)
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Radar and Detailed Bars */}
              <div className="grid sm:grid-cols-2 gap-5">
                <Card title="Hazard Profile Radar" subtitle="Cross-vector distribution">
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="#E5E9E3" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#69766E', fontSize: 11 }} />
                        <Radar
                          name="Hazard Score"
                          dataKey="value"
                          stroke="#21865A"
                          fill="#21865A"
                          fillOpacity={0.25}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                <Card title="Hazard Indices" subtitle="Individual vector scores (0–100)">
                  <div className="space-y-3 pt-1">
                    {risks.map(r => {
                      const cat = getRiskCategory(r.value)
                      return (
                        <div key={r.key} className="space-y-1">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-brand-text font-medium">{r.name}</span>
                            <span className="font-mono font-semibold text-brand-text">{r.value}</span>
                          </div>
                          <div className="w-full bg-brand-bg h-1.5 rounded-full overflow-hidden border border-brand-border/60">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                r.value >= 65 ? 'bg-risk-high' : r.value >= 40 ? 'bg-risk-medium' : 'bg-risk-low'
                              }`}
                              style={{ width: `${r.value}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </Card>
              </div>

              {/* Contingency Actions Table */}
              <Card
                title="Targeted Agronomic Mitigations"
                subtitle="Prescriptive protocols based on active hazard thresholds"
              >
                <div className="space-y-3">
                  {risks.map(r => {
                    const advisory = RISK_ADVISORIES[r.key]
                    if (!advisory) return null
                    const Icon = advisory.icon
                    const advice = r.value >= 65 ? advisory.highAdvice : r.value >= 40 ? advisory.mediumAdvice : advisory.lowAdvice
                    const cat = getRiskCategory(r.value)

                    return (
                      <div
                        key={r.key}
                        className={`p-3.5 rounded-lg border ${advisory.borderColor} ${advisory.bgColor} text-xs space-y-1.5`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 font-medium text-brand-text">
                            <Icon className={`w-4 h-4 ${advisory.color}`} />
                            <span>{advisory.title}</span>
                          </div>
                          <RiskBadge level={cat.level} />
                        </div>
                        <p className="text-brand-secondary text-xs leading-relaxed pl-6">
                          {advice}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </Card>
            </>
          ) : (
            <Card>
              <EmptyState
                icon={ShieldAlert}
                title="No Hazard Evaluation Run"
                description="Configure regional agro-climatic conditions or load parameters from a registered farm to generate the multi-hazard risk matrix."
                action={{
                  label: 'Compute Risk Matrix',
                  onClick: handleSubmit
                }}
              />
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
