import React, { useState, useEffect } from 'react'
import { farmsAPI } from '../../services/api'
import { Droplets, CheckCircle2, AlertTriangle, Calendar, RefreshCw, Printer, ShieldCheck } from 'lucide-react'
import Card, { MetricCard } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Badge from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'

const CROP_ETC = {
  Rice: 5.2, Wheat: 4.1, Maize: 4.8, Cotton: 6.0,
  Soybean: 3.9, Groundnut: 4.3, Tomato: 4.6, Onion: 3.5, Potato: 3.8,
}

const EFFICIENCY = {
  Drip: { eff: 0.92, label: 'Drip Micro-Irrigation', note: 'Highest efficiency — water and fertigation applied directly to active root zone.' },
  Sprinkler: { eff: 0.80, label: 'Sprinkler System', note: 'Good for undulating terrain and sandy soils with high infiltration.' },
  Canal: { eff: 0.60, label: 'Canal Gravitational Flow', note: 'Significant seepage and evaporative transit losses.' },
  Borewell: { eff: 0.75, label: 'Tubewell / Submersible', note: 'High operational electricity consumption; monitor groundwater drawdown.' },
  Rainfed: { eff: 1.0, label: 'Pure Rainfed (Kharif)', note: 'No supplemental pumping; relies entirely on precipitation distribution.' },
  Flood: { eff: 0.55, label: 'Traditional Flood Basin', note: 'High runoff and waterlogging vulnerability — consider upgrading to drip.' },
}

const SOIL_RETENTION = {
  Alluvial: 1.0, Black: 1.15, Red: 0.85, Laterite: 0.90,
  Sandy: 0.75, Loamy: 1.05, Clay: 1.20, Silty: 1.0,
}

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function buildSchedule(waterPerSession, sessionsPerWeek) {
  const interval = Math.max(1, Math.floor(7 / sessionsPerWeek))
  return WEEK_DAYS.map((day, i) => ({
    day,
    irrigate: i % interval === 0 && (i / interval) < sessionsPerWeek,
    amount: waterPerSession,
  }))
}

export default function Irrigation() {
  const [farms, setFarms] = useState([])
  const [selectedFarm, setSelectedFarm] = useState('')
  const [form, setForm] = useState({
    crop: 'Rice',
    area: 2.0,
    soil_type: 'Alluvial',
    irrigation_type: 'Drip',
    rainfall: 0,
  })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    farmsAPI.list()
      .then(r => setFarms(r.data || []))
      .catch(() => setFarms([]))
  }, [])

  const handleFarmSelect = (id) => {
    setSelectedFarm(id)
    const farm = farms.find(f => String(f.id) === String(id))
    if (farm) {
      setForm(prev => ({
        ...prev,
        area: farm.area || 2.0,
        soil_type: farm.soil_type || 'Alluvial',
        irrigation_type: farm.irrigation_type || 'Drip',
        crop: farm.current_crop || prev.crop
      }))
    }
  }

  const u = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const calculate = (e) => {
    if (e) e.preventDefault()
    setLoading(true)
    const etc = CROP_ETC[form.crop] || 4.5
    const soilFactor = SOIL_RETENTION[form.soil_type] || 1.0
    const effData = EFFICIENCY[form.irrigation_type] || EFFICIENCY.Drip
    const area = parseFloat(form.area) || 1
    const rainfall = parseFloat(form.rainfall) || 0

    const weeklyNeedMM = Math.max(0, (etc * 7) - rainfall)
    const weeklyNeedLiters = (weeklyNeedMM / 1000) * area * 10000 * 1000 // mm -> m, ha -> m², m³ -> liters
    const adjustedNeed = Math.round(weeklyNeedLiters * soilFactor / effData.eff)

    const sessionsPerWeek = adjustedNeed > 0 ? (weeklyNeedMM > 30 ? 3 : weeklyNeedMM > 15 ? 2 : 1) : 1
    const waterPerSession = Math.round(adjustedNeed / sessionsPerWeek)

    const schedule = buildSchedule(waterPerSession, sessionsPerWeek)
    const nextIrr = schedule.find(s => s.irrigate)

    setTimeout(() => {
      setResult({
        weekly_need: adjustedNeed,
        sessions_per_week: sessionsPerWeek,
        water_per_session: waterPerSession,
        efficiency_label: effData.label,
        efficiency_note: effData.note,
        schedule,
        next_day: nextIrr?.day || 'Mon',
        weekly_need_mm: Number(weeklyNeedMM.toFixed(1)),
      })
      setLoading(false)
    }, 400)
  }

  const formatLiters = (l) => {
    if (l >= 1000000) return `${(l / 1000000).toFixed(2)} ML`
    if (l >= 1000) return `${(l / 1000).toFixed(1)} kL`
    return `${l} L`
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-brand-border">
        <div>
          <h1 className="text-2xl font-semibold text-brand-text tracking-tight flex items-center gap-2.5">
            <Droplets className="w-6 h-6 text-brand-emerald" />
            Precision Irrigation Scheduler
          </h1>
          <p className="text-sm text-brand-secondary mt-1">
            Evapotranspiration-based water budgeting and crop irrigation cycles.
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
                  ...farms.map(f => ({ value: String(f.id), label: `${f.name} (${f.irrigation_type || 'Farm'})` }))
                ]}
              />
            </div>
          )}

          <Button
            variant="secondary"
            onClick={() => window.print()}
            icon={Printer}
          >
            Export Schedule
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Left Inputs */}
        <div className="lg:col-span-5 space-y-5">
          <Card
            title="Field Water Demand Parameters"
            subtitle="Configure crop evapotranspiration and delivery methods"
          >
            <form onSubmit={calculate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="Crop"
                  value={form.crop}
                  onChange={e => u('crop', e.target.value)}
                  options={Object.keys(CROP_ETC).map(c => ({ value: c, label: c }))}
                />
                <Input
                  label="Area"
                  type="number"
                  step="0.5"
                  unit="ha"
                  value={form.area}
                  onChange={e => u('area', parseFloat(e.target.value) || 1)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="Soil Retention"
                  value={form.soil_type}
                  onChange={e => u('soil_type', e.target.value)}
                  options={Object.keys(SOIL_RETENTION).map(s => ({ value: s, label: s }))}
                />
                <Select
                  label="Irrigation Method"
                  value={form.irrigation_type}
                  onChange={e => u('irrigation_type', e.target.value)}
                  options={Object.keys(EFFICIENCY).map(e => ({ value: e, label: e }))}
                />
              </div>

              <Input
                label="Forecasted Rainfall This Week"
                type="number"
                unit="mm"
                value={form.rainfall}
                onChange={e => u('rainfall', parseFloat(e.target.value) || 0)}
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                loading={loading}
                icon={Droplets}
              >
                Compute Irrigation Protocol
              </Button>
            </form>
          </Card>
        </div>

        {/* Right Outputs */}
        <div className="lg:col-span-7 space-y-5">
          {result ? (
            <>
              {/* KPI metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <MetricCard
                  label="Weekly Total Volume"
                  value={formatLiters(result.weekly_need)}
                  secondaryValue={`Net deficit: ${result.weekly_need_mm} mm`}
                  icon={Droplets}
                />
                <MetricCard
                  label="Dosing Frequency"
                  value={`${result.sessions_per_week}x / week`}
                  secondaryValue={`Next application: ${result.next_day}`}
                  icon={Calendar}
                />
                <MetricCard
                  label="Volume Per Application"
                  value={formatLiters(result.water_per_session)}
                  secondaryValue={result.efficiency_label}
                  icon={ShieldCheck}
                />
              </div>

              {/* Weekly Schedule Planner */}
              <Card
                title="7-Day Irrigation Delivery Schedule"
                subtitle="Optimized application intervals based on soil water depletion"
              >
                <div className="grid grid-cols-7 gap-2 pt-2">
                  {result.schedule.map(s => (
                    <div
                      key={s.day}
                      className={`p-3 rounded-lg border text-center transition-all ${
                        s.irrigate
                          ? 'border-brand-emerald bg-brand-bg shadow-sm'
                          : 'border-brand-border bg-brand-surface opacity-60'
                      }`}
                    >
                      <div className="text-xs font-semibold text-brand-text">{s.day}</div>
                      <div className="my-2 flex justify-center">
                        <Droplets className={`w-5 h-5 ${s.irrigate ? 'text-brand-emerald' : 'text-brand-secondary'}`} />
                      </div>
                      <div className="text-[10px] font-mono font-medium">
                        {s.irrigate ? formatLiters(s.amount) : 'Rest'}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Delivery Advisory */}
              <div className="p-4 rounded-lg border border-brand-border bg-brand-surface text-xs space-y-1.5">
                <div className="flex items-center gap-2 font-medium text-brand-text text-sm">
                  <ShieldCheck className="w-4 h-4 text-brand-emerald" />
                  <span>Efficiency Note: {result.efficiency_label}</span>
                </div>
                <p className="text-brand-secondary leading-relaxed">
                  {result.efficiency_note} Apply irrigation during early dawn (05:00 - 08:00 AM) or dusk to minimize evaporative loss.
                </p>
              </div>
            </>
          ) : (
            <Card>
              <EmptyState
                icon={Droplets}
                title="No Irrigation Cycle Calculated"
                description="Select an active farm parcel or specify crop acreage and delivery methods to generate automated weekly irrigation scheduling."
                action={{
                  label: 'Calculate Water Schedule',
                  onClick: calculate
                }}
              />
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
