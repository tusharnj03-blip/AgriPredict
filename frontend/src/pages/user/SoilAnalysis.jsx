import React, { useState, useEffect } from 'react'
import { soilAPI, farmsAPI } from '../../services/api'
import {
  FlaskConical, CheckCircle2, AlertTriangle, Info, Sprout,
  ShieldCheck, ArrowRight, RefreshCw, Sparkles, Layers,
  ChevronRight, Printer, HelpCircle, PackageCheck
} from 'lucide-react'
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip
} from 'recharts'
import toast from 'react-hot-toast'
import Card, { MetricCard } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Badge, { RiskBadge } from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'

// Common Indian soil types with benchmark baseline profiles
const SOIL_PRESETS = [
  {
    name: 'Gangetic Alluvial',
    region: 'Punjab, UP, Bihar, WB',
    values: { nitrogen: 110, phosphorus: 28, potassium: 190, ph: 7.2, organic_carbon: 0.65, moisture: 42 }
  },
  {
    name: 'Deccan Black Cotton',
    region: 'Maharashtra, MP, Gujarat',
    values: { nitrogen: 95, phosphorus: 22, potassium: 280, ph: 7.8, organic_carbon: 0.58, moisture: 48 }
  },
  {
    name: 'Southern Red Loam',
    region: 'Karnataka, Tamil Nadu, AP',
    values: { nitrogen: 80, phosphorus: 18, potassium: 140, ph: 6.2, organic_carbon: 0.42, moisture: 30 }
  },
  {
    name: 'North-West Sandy Arid',
    region: 'Rajasthan, SW Haryana',
    values: { nitrogen: 45, phosphorus: 12, potassium: 110, ph: 8.2, organic_carbon: 0.25, moisture: 18 }
  },
  {
    name: 'Highland Laterite / Acidic',
    region: 'Kerala, Assam, Odisha',
    values: { nitrogen: 90, phosphorus: 15, potassium: 95, ph: 5.2, organic_carbon: 0.85, moisture: 55 }
  }
]

const TARGET_CROPS = [
  { name: 'Rice / Paddy', nReq: 120, pReq: 60, kReq: 60, idealPh: '5.5 - 6.8' },
  { name: 'Wheat', nReq: 120, pReq: 60, kReq: 40, idealPh: '6.0 - 7.5' },
  { name: 'Cotton', nReq: 150, pReq: 60, kReq: 60, idealPh: '6.5 - 8.0' },
  { name: 'Maize', nReq: 120, pReq: 60, kReq: 50, idealPh: '5.8 - 7.2' },
  { name: 'Sugarcane', nReq: 250, pReq: 100, kReq: 120, idealPh: '6.5 - 7.8' },
  { name: 'Soybean (Pulse)', nReq: 30, pReq: 80, kReq: 40, idealPh: '6.0 - 7.0' },
  { name: 'Potato / Vegetables', nReq: 180, pReq: 100, kReq: 150, idealPh: '5.5 - 6.5' }
]

export default function SoilAnalysis() {
  const [farms, setFarms] = useState([])
  const [selectedFarm, setSelectedFarm] = useState('')
  const [targetCrop, setTargetCrop] = useState('Wheat')
  const [form, setForm] = useState({
    nitrogen: 90,
    phosphorus: 24,
    potassium: 160,
    ph: 6.8,
    organic_carbon: 0.55,
    moisture: 38
  })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  // Load farms on mount
  useEffect(() => {
    farmsAPI.list()
      .then(res => setFarms(res.data || []))
      .catch(() => setFarms([]))
  }, [])

  // Auto-fill from selected farm
  const handleFarmSelect = async (farmId) => {
    setSelectedFarm(farmId)
    if (!farmId) return
    const farm = farms.find(f => String(f.id) === String(farmId))
    if (!farm) return

    try {
      const res = await soilAPI.getForFarm(farmId)
      if (res.data && res.data.nitrogen) {
        setForm({
          nitrogen: res.data.nitrogen,
          phosphorus: res.data.phosphorus,
          potassium: res.data.potassium,
          ph: res.data.ph,
          organic_carbon: res.data.organic_carbon || 0.5,
          moisture: res.data.moisture || 35
        })
        toast.success(`Loaded recorded soil profile for ${farm.name}`)
        return
      }
    } catch {
      // Fallback to type match
    }

    const match = SOIL_PRESETS.find(p => p.name.toLowerCase().includes(farm.soil_type?.toLowerCase() || ''))
    if (match) {
      setForm({ ...match.values })
      toast.success(`Applied benchmark values for ${farm.soil_type}`)
    }
  }

  const applyPreset = (preset) => {
    setForm({ ...preset.values })
    toast.success(`Applied ${preset.name} baseline`)
  }

  const u = (k, v) => setForm(f => ({ ...f, [k]: parseFloat(v) || 0 }))

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        nitrogen: parseFloat(form.nitrogen) || 0,
        phosphorus: parseFloat(form.phosphorus) || 0,
        potassium: parseFloat(form.potassium) || 0,
        ph: parseFloat(form.ph) || 7.0,
        organic_carbon: parseFloat(form.organic_carbon) || 0,
        moisture: parseFloat(form.moisture) || 0
      }
      const { data } = await soilAPI.analyze(payload)
      setResult(data)
      toast.success('Soil diagnostics generated')
    } catch {
      // Deterministic agronomic calculation fallback
      const n = parseFloat(form.nitrogen) || 0
      const p = parseFloat(form.phosphorus) || 0
      const k = parseFloat(form.potassium) || 0
      const ph = parseFloat(form.ph) || 7.0
      const oc = parseFloat(form.organic_carbon) || 0.5
      const m = parseFloat(form.moisture) || 30

      const nScore = Math.min(100, Math.max(10, (n / 140) * 100))
      const pScore = Math.min(100, Math.max(10, (p / 40) * 100))
      const kScore = Math.min(100, Math.max(10, (k / 200) * 100))
      const phScore = Math.max(10, 100 - Math.abs(ph - 6.8) * 35)
      const ocScore = Math.min(100, Math.max(10, (oc / 0.8) * 100))
      const mScore = Math.min(100, Math.max(10, (m / 50) * 100))

      const avg = Math.round((nScore + pScore + kScore + phScore + ocScore + mScore) / 6)
      const label = avg >= 80 ? 'Optimal' : avg >= 65 ? 'Good' : avg >= 45 ? 'Moderate' : 'Deficient'

      const recs = []
      if (n < 90) recs.push(`Nitrogen deficient: Apply 50-65 kg/ha Urea in 2-3 split doses at tillering and panicle initiation.`)
      if (p < 25) recs.push(`Phosphorus low: Apply 35-45 kg/ha Single Super Phosphate (SSP) or DAP as basal dressing.`)
      if (k < 140) recs.push(`Potassium low: Apply 25-35 kg/ha Muriate of Potash (MOP) to prevent lodging and grain shrinkage.`)
      if (ph < 6.0) recs.push(`Acidic soil (pH ${ph}): Apply 2-3 quintals/ha Agricultural Lime or Dolomite 3 weeks prior to sowing.`)
      if (ph > 7.8) recs.push(`Alkaline soil (pH ${ph}): Apply 1-2 tonnes/ha agricultural gypsum followed by light leaching.`)
      if (oc < 0.5) recs.push(`Low Organic Carbon (${oc}%): Incorporate 5-8 tonnes/ha well-decomposed Farmyard Manure (FYM) or Vermicompost.`)
      if (m < 25) recs.push(`Critically dry soil (${m}%): Immediate irrigation recommended before fertilizer application to prevent root burn.`)

      setResult({
        health_score: avg,
        health_label: label,
        nitrogen_score: Math.round(nScore),
        phosphorus_score: Math.round(pScore),
        potassium_score: Math.round(kScore),
        ph_score: Math.round(phScore),
        organic_score: Math.round(ocScore),
        moisture_score: Math.round(mScore),
        recommendations: recs.length ? recs : ['Soil nutrient status is well balanced. Continue standard balanced fertilization.']
      })
      toast.success('Soil health analysis generated')
    } finally {
      setLoading(false)
    }
  }

  // Calculate STCR Fertilizer Requirements for Target Crop
  const cropProfile = TARGET_CROPS.find(c => c.name === targetCrop) || TARGET_CROPS[0]
  const currentN = parseFloat(form.nitrogen) || 0
  const currentP = parseFloat(form.phosphorus) || 0
  const currentK = parseFloat(form.potassium) || 0

  const nDeficit = Math.max(0, cropProfile.nReq - currentN)
  const pDeficit = Math.max(0, cropProfile.pReq - currentP)
  const kDeficit = Math.max(0, cropProfile.kReq - currentK)

  // Fertilizer conversion (Urea = 46% N, DAP = 46% P2O5 & 18% N, MOP = 60% K2O)
  const dapKg = Math.round(pDeficit / 0.46)
  const nSuppliedByDap = dapKg * 0.18
  const remainingN = Math.max(0, nDeficit - nSuppliedByDap)
  const ureaKg = Math.round(remainingN / 0.46)
  const mopKg = Math.round(kDeficit / 0.60)

  const ureaBags = (ureaKg / 45).toFixed(1)
  const dapBags = (dapKg / 50).toFixed(1)
  const mopBags = (mopKg / 50).toFixed(1)

  const radarData = result ? [
    { subject: 'Nitrogen (N)', value: result.nitrogen_score || 50, fullMark: 100 },
    { subject: 'Phosphorus (P)', value: result.phosphorus_score || 50, fullMark: 100 },
    { subject: 'Potassium (K)', value: result.potassium_score || 50, fullMark: 100 },
    { subject: 'Soil pH', value: result.ph_score || 50, fullMark: 100 },
    { subject: 'Organic Carbon', value: result.organic_score || 50, fullMark: 100 },
    { subject: 'Moisture', value: result.moisture_score || 50, fullMark: 100 }
  ] : []

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-brand-border">
        <div>
          <h1 className="text-2xl font-semibold text-brand-text tracking-tight flex items-center gap-2.5">
            <FlaskConical className="w-6 h-6 text-brand-emerald" />
            Soil Intelligence & Diagnostics
          </h1>
          <p className="text-sm text-brand-secondary mt-1">
            Soil Health Card diagnostics, STCR-based nutrient calibration, and commercial fertilizer dosage.
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
                  ...farms.map(f => ({ value: String(f.id), label: `${f.name} (${f.soil_type || 'Farm'})` }))
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
        {/* Left Input & Presets Column */}
        <div className="lg:col-span-5 space-y-5">
          <Card
            title="Soil Test Parameters"
            subtitle="Laboratory test values or baseline estimates"
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <Input
                  label="Nitrogen (N)"
                  type="number"
                  unit="kg/ha"
                  value={form.nitrogen}
                  onChange={e => u('nitrogen', e.target.value)}
                />
                <Input
                  label="Phosphorus (P)"
                  type="number"
                  unit="kg/ha"
                  value={form.phosphorus}
                  onChange={e => u('phosphorus', e.target.value)}
                />
                <Input
                  label="Potassium (K)"
                  type="number"
                  unit="kg/ha"
                  value={form.potassium}
                  onChange={e => u('potassium', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Input
                  label="Soil pH"
                  type="number"
                  step="0.1"
                  unit="pH"
                  value={form.ph}
                  onChange={e => u('ph', e.target.value)}
                />
                <Input
                  label="Organic Carbon"
                  type="number"
                  step="0.05"
                  unit="%"
                  value={form.organic_carbon}
                  onChange={e => u('organic_carbon', e.target.value)}
                />
                <Input
                  label="Soil Moisture"
                  type="number"
                  unit="%"
                  value={form.moisture}
                  onChange={e => u('moisture', e.target.value)}
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  loading={loading}
                  icon={FlaskConical}
                >
                  Generate Soil Diagnostics
                </Button>
              </div>
            </form>
          </Card>

          {/* Regional Agro-Climatic Presets */}
          <Card
            title="Regional Soil Presets"
            subtitle="Quick-load typical soil profiles across Indian agro-ecological zones"
          >
            <div className="space-y-2">
              {SOIL_PRESETS.map(p => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className="w-full text-left p-2.5 rounded-lg border border-brand-border hover:border-brand-emerald hover:bg-brand-bg transition-colors flex items-center justify-between group"
                >
                  <div>
                    <div className="text-xs font-medium text-brand-text group-hover:text-brand-emerald">
                      {p.name}
                    </div>
                    <div className="text-[11px] text-brand-secondary">
                      {p.region}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-brand-secondary group-hover:text-brand-emerald transition-colors" />
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Output Column */}
        <div className="lg:col-span-7 space-y-5">
          {result ? (
            <>
              {/* Overall Soil Health Scorecard */}
              <div className="rounded-lg border border-brand-border bg-brand-surface p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                  <div className="flex items-center gap-5">
                    <div className="flex flex-col items-center justify-center w-20 h-20 rounded-xl bg-brand-bg border border-brand-border">
                      <span className="text-3xl font-semibold font-mono tabular-nums text-brand-emerald">
                        {result.health_score}
                      </span>
                      <span className="text-[10px] text-brand-secondary uppercase font-medium mt-0.5">/ 100</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant={result.health_score >= 70 ? 'success' : result.health_score >= 45 ? 'warning' : 'danger'}>
                          {result.health_label || 'Status'}
                        </Badge>
                        <span className="text-xs text-brand-secondary font-mono">Index: {result.health_score}/100</span>
                      </div>
                      <h3 className="text-base font-semibold text-brand-text mt-1.5">
                        {result.health_score >= 75 ? 'Fertile Profile with High Nutrient Retention' :
                         result.health_score >= 50 ? 'Moderate Fertility — Corrective Fertilization Needed' :
                         'Sub-optimal Health — Remediation Required'}
                      </h3>
                      <p className="text-xs text-brand-secondary mt-0.5">
                        Tested pH {form.ph} • Organic Carbon {form.organic_carbon}% • Available N {form.nitrogen} kg/ha
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* STCR Fertilizer Dosage Calculator */}
              <Card
                title="STCR Fertilizer Calculator"
                subtitle="Calculated requirement per hectare based on Soil Test Crop Response (STCR) method"
                action={
                  <div className="w-44">
                    <Select
                      value={targetCrop}
                      onChange={e => setTargetCrop(e.target.value)}
                      options={TARGET_CROPS.map(c => ({ value: c.name, label: c.name }))}
                    />
                  </div>
                }
              >
                <div className="grid grid-cols-3 gap-4 pt-1">
                  <div className="p-3.5 rounded-lg border border-brand-border bg-brand-bg text-center">
                    <div className="text-[11px] font-medium text-brand-secondary uppercase tracking-wider">Urea (46% N)</div>
                    <div className="text-2xl font-semibold font-mono text-brand-text mt-1 tabular-nums">{ureaKg} <span className="text-xs font-normal text-brand-secondary">kg/ha</span></div>
                    <div className="text-xs font-mono text-brand-emerald mt-1">{ureaBags} bags (45kg)</div>
                  </div>

                  <div className="p-3.5 rounded-lg border border-brand-border bg-brand-bg text-center">
                    <div className="text-[11px] font-medium text-brand-secondary uppercase tracking-wider">DAP (18% N, 46% P)</div>
                    <div className="text-2xl font-semibold font-mono text-brand-text mt-1 tabular-nums">{dapKg} <span className="text-xs font-normal text-brand-secondary">kg/ha</span></div>
                    <div className="text-xs font-mono text-brand-emerald mt-1">{dapBags} bags (50kg)</div>
                  </div>

                  <div className="p-3.5 rounded-lg border border-brand-border bg-brand-bg text-center">
                    <div className="text-[11px] font-medium text-brand-secondary uppercase tracking-wider">MOP (60% K2O)</div>
                    <div className="text-2xl font-semibold font-mono text-brand-text mt-1 tabular-nums">{mopKg} <span className="text-xs font-normal text-brand-secondary">kg/ha</span></div>
                    <div className="text-xs font-mono text-brand-emerald mt-1">{mopBags} bags (50kg)</div>
                  </div>
                </div>

                <p className="text-[11px] text-brand-secondary mt-3">
                  * Recommended split: Apply 100% DAP and MOP with 1/3 Urea as basal dressing at sowing. Apply remaining Urea in 2 equal top-dressings at active tillering and panicle initiation.
                </p>
              </Card>

              {/* Nutrient Radar Chart */}
              <Card title="Nutrient Index Radar" subtitle="Six-factor balance comparison">
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#E5E9E3" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#69766E', fontSize: 11 }} />
                      <Radar
                        name="Nutrient Score"
                        dataKey="value"
                        stroke="#21865A"
                        fill="#21865A"
                        fillOpacity={0.25}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Actionable Soil Recommendations */}
              <Card
                title="Prescriptive Soil Health Guidelines"
                subtitle="Scientific corrective practices from Indian Council of Agricultural Research (ICAR)"
              >
                <div className="space-y-2.5">
                  {(result.recommendations || []).map((rec, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-lg border border-brand-border bg-brand-bg flex items-start gap-2.5 text-xs text-brand-text"
                    >
                      <CheckCircle2 className="w-4 h-4 text-brand-emerald shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{rec}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          ) : (
            <Card>
              <EmptyState
                icon={FlaskConical}
                title="No Soil Analysis Generated"
                description="Input your Soil Health Card test values or select a regional preset to compute nutrient indices, deficit calculations, and exact fertilizer bags."
                action={{
                  label: 'Generate Soil Diagnostics',
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
