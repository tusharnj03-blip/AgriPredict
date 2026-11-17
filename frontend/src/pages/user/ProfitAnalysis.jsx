import React, { useState, useEffect } from 'react'
import { farmsAPI } from '../../services/api'
import {
  DollarSign, TrendingUp, TrendingDown, Percent, Scale,
  PieChart as PieIcon, BarChart3, Calculator, HelpCircle,
  FileSpreadsheet, Sparkles, CheckCircle2, ArrowRight,
  ShieldCheck, RefreshCw, Printer
} from 'lucide-react'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts'
import toast from 'react-hot-toast'
import Card, { MetricCard } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Badge from '../../components/ui/Badge'
import Tabs from '../../components/ui/Tabs'

const CROP_BENCHMARKS = {
  Rice: { msp: 2300, avgYield: 4.2, seedCost: 2200, fertCost: 6500, laborCost: 9000, irrCost: 3500, otherCost: 2500 },
  Wheat: { msp: 2275, avgYield: 4.5, seedCost: 2000, fertCost: 6000, laborCost: 7500, irrCost: 3000, otherCost: 2000 },
  Cotton: { msp: 7121, avgYield: 2.2, seedCost: 3500, fertCost: 8000, laborCost: 12000, irrCost: 4000, otherCost: 3500 },
  Maize: { msp: 2225, avgYield: 4.8, seedCost: 2400, fertCost: 5500, laborCost: 6500, irrCost: 2500, otherCost: 2000 },
  Soybean: { msp: 4892, avgYield: 2.4, seedCost: 3000, fertCost: 4500, laborCost: 6000, irrCost: 2000, otherCost: 2000 },
  Mustard: { msp: 5650, avgYield: 1.8, seedCost: 1800, fertCost: 4000, laborCost: 5500, irrCost: 2200, otherCost: 1800 },
  Sugarcane: { msp: 340, avgYield: 75.0, seedCost: 8000, fertCost: 14000, laborCost: 22000, irrCost: 8000, otherCost: 5000 },
  Groundnut: { msp: 6783, avgYield: 2.1, seedCost: 4200, fertCost: 5000, laborCost: 7500, irrCost: 2800, otherCost: 2200 }
}

const PIE_COLORS = ['#183D2B', '#21865A', '#D69B35', '#A8B9A5', '#69766E']

export default function ProfitAnalysis() {
  const [farms, setFarms] = useState([])
  const [selectedFarm, setSelectedFarm] = useState('')
  const [activeTab, setActiveTab] = useState('overview')

  const [form, setForm] = useState({
    crop: 'Rice',
    area: 2.5,
    yield_per_ha: 4.2,
    price_per_quintal: 2300,
    seed_cost: 2200,
    fertilizer_cost: 6500,
    labor_cost: 9000,
    irrigation_cost: 3500,
    other_cost: 2500,
    pm_kisan: true,
    pmfby_insurance: true
  })

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

    const matchedCrop = Object.keys(CROP_BENCHMARKS).find(
      c => c.toLowerCase() === (f.current_crop || '').toLowerCase()
    ) || 'Rice'

    const bm = CROP_BENCHMARKS[matchedCrop]
    setForm(prev => ({
      ...prev,
      crop: matchedCrop,
      area: f.area || 2.0,
      yield_per_ha: bm.avgYield,
      price_per_quintal: bm.msp,
      seed_cost: bm.seedCost,
      fertilizer_cost: bm.fertCost,
      labor_cost: bm.laborCost,
      irrigation_cost: bm.irrCost,
      other_cost: bm.otherCost
    }))
    toast.success(`Loaded parameters for farm: ${f.name}`)
  }

  const handleCropChange = (cropName) => {
    const bm = CROP_BENCHMARKS[cropName]
    if (bm) {
      setForm(prev => ({
        ...prev,
        crop: cropName,
        yield_per_ha: bm.avgYield,
        price_per_quintal: bm.msp,
        seed_cost: bm.seedCost,
        fertilizer_cost: bm.fertCost,
        labor_cost: bm.laborCost,
        irrigation_cost: bm.irrCost,
        other_cost: bm.otherCost
      }))
    } else {
      setForm(prev => ({ ...prev, crop: cropName }))
    }
  }

  const u = (k, v) => setForm(f => ({ ...f, [k]: parseFloat(v) || 0 }))

  // Calculations
  const area = form.area || 1
  const yieldTotalTonnes = form.yield_per_ha * area
  const yieldQuintals = yieldTotalTonnes * 10 // 1 Ton = 10 Quintals
  const cropRevenue = yieldQuintals * form.price_per_quintal

  const subsidyRevenue = form.pm_kisan ? 6000 : 0
  const grossRevenue = Math.round(cropRevenue + subsidyRevenue)

  const costPerHa = (form.seed_cost + form.fertilizer_cost + form.labor_cost + form.irrigation_cost + form.other_cost)
  const insuranceDeduction = form.pmfby_insurance ? (costPerHa * 0.02 * area) : 0
  const totalCost = Math.round((costPerHa * area) + insuranceDeduction)

  const netProfit = grossRevenue - totalCost
  const profitPerHa = Math.round(netProfit / area)
  const bcr = totalCost > 0 ? (grossRevenue / totalCost).toFixed(2) : '0.00'
  const costPerQuintal = yieldQuintals > 0 ? Math.round(totalCost / yieldQuintals) : 0

  const costBreakdownData = [
    { name: 'Labor & Harvester', value: Math.round(form.labor_cost * area) },
    { name: 'Fertilizers & Nutrients', value: Math.round(form.fertilizer_cost * area) },
    { name: 'Irrigation & Power', value: Math.round(form.irrigation_cost * area) },
    { name: 'Quality Seeds', value: Math.round(form.seed_cost * area) },
    { name: 'Machinery & Other', value: Math.round((form.other_cost * area) + insuranceDeduction) },
  ]

  const sensitivityRows = [-10, 0, 10].map(yieldDelta => {
    const sYield = form.yield_per_ha * (1 + yieldDelta / 100)
    const sQuintals = sYield * area * 10
    return {
      yieldShift: `${yieldDelta > 0 ? `+${yieldDelta}` : yieldDelta}% (${sYield.toFixed(1)} t/ha)`,
      lowPrice: Math.round((sQuintals * (form.price_per_quintal * 0.9)) + subsidyRevenue - totalCost),
      basePrice: Math.round((sQuintals * form.price_per_quintal) + subsidyRevenue - totalCost),
      highPrice: Math.round((sQuintals * (form.price_per_quintal * 1.1)) + subsidyRevenue - totalCost),
    }
  })

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-brand-border">
        <div>
          <h1 className="text-2xl font-semibold text-brand-text tracking-tight flex items-center gap-2.5">
            <DollarSign className="w-6 h-6 text-brand-emerald" />
            Agricultural Profit & Financial Intelligence
          </h1>
          <p className="text-sm text-brand-secondary mt-1">
            Cost of cultivation (C2 model), gross revenue projections, and benefit-cost sensitivity analysis.
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
            onClick={() => window.print()}
            icon={Printer}
          >
            Export Ledger
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          label="Gross Revenue"
          value={`₹${grossRevenue.toLocaleString('en-IN')}`}
          secondaryValue={`Production: ${yieldTotalTonnes.toFixed(1)} tonnes`}
          icon={TrendingUp}
        />
        <MetricCard
          label="Cost of Cultivation"
          value={`₹${totalCost.toLocaleString('en-IN')}`}
          secondaryValue={`₹${Math.round(costPerHa).toLocaleString('en-IN')}/ha`}
          icon={Scale}
        />
        <MetricCard
          label="Net Farm Profit"
          value={`₹${netProfit.toLocaleString('en-IN')}`}
          secondaryValue={`₹${profitPerHa.toLocaleString('en-IN')}/ha margin`}
          icon={DollarSign}
        />
        <MetricCard
          label="Benefit-Cost Ratio"
          value={`${bcr}x`}
          secondaryValue={`Cost basis: ₹${costPerQuintal}/q`}
          icon={Percent}
        />
      </div>

      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Left Input Column */}
        <div className="lg:col-span-5 space-y-5">
          <Card
            title="Operational Parameters"
            subtitle="Crop type, operational acreage, and anticipated harvest"
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="Target Crop"
                  value={form.crop}
                  onChange={e => handleCropChange(e.target.value)}
                  options={Object.keys(CROP_BENCHMARKS).map(c => ({ value: c, label: c }))}
                />
                <Input
                  label="Farm Area"
                  type="number"
                  step="0.5"
                  unit="ha"
                  value={form.area}
                  onChange={e => u('area', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Expected Yield"
                  type="number"
                  step="0.1"
                  unit="t/ha"
                  value={form.yield_per_ha}
                  onChange={e => u('yield_per_ha', e.target.value)}
                />
                <Input
                  label="Realization Rate"
                  type="number"
                  unit="₹/q"
                  value={form.price_per_quintal}
                  onChange={e => u('price_per_quintal', e.target.value)}
                />
              </div>

              <div className="pt-3 border-t border-brand-border">
                <h4 className="text-xs font-semibold text-brand-text uppercase tracking-wider mb-2.5">
                  Input Costs (₹ per Hectare)
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Labor & Harvesting"
                    type="number"
                    unit="₹"
                    value={form.labor_cost}
                    onChange={e => u('labor_cost', e.target.value)}
                  />
                  <Input
                    label="Fertilizers & Nutrients"
                    type="number"
                    unit="₹"
                    value={form.fertilizer_cost}
                    onChange={e => u('fertilizer_cost', e.target.value)}
                  />
                  <Input
                    label="Irrigation & Electricity"
                    type="number"
                    unit="₹"
                    value={form.irrigation_cost}
                    onChange={e => u('irrigation_cost', e.target.value)}
                  />
                  <Input
                    label="Certified Seeds"
                    type="number"
                    unit="₹"
                    value={form.seed_cost}
                    onChange={e => u('seed_cost', e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-brand-border space-y-2">
                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-brand-text">
                  <input
                    type="checkbox"
                    checked={form.pm_kisan}
                    onChange={e => setForm(f => ({ ...f, pm_kisan: e.target.checked }))}
                    className="w-4 h-4 rounded text-brand-emerald focus:ring-brand-emerald"
                  />
                  <span>Credit PM-KISAN Annual Direct Transfer (+₹6,000)</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-brand-text">
                  <input
                    type="checkbox"
                    checked={form.pmfby_insurance}
                    onChange={e => setForm(f => ({ ...f, pmfby_insurance: e.target.checked }))}
                    className="w-4 h-4 rounded text-brand-emerald focus:ring-brand-emerald"
                  />
                  <span>Deduct PMFBY Crop Insurance Premium (2.0% of cost)</span>
                </label>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Output Column */}
        <div className="lg:col-span-7 space-y-5">
          <Tabs
            activeTab={activeTab}
            onChange={setActiveTab}
            tabs={[
              { id: 'overview', label: 'Cost Distribution' },
              { id: 'sensitivity', label: 'Price-Yield Sensitivity Matrix' },
            ]}
          />

          {activeTab === 'overview' && (
            <>
              <Card
                title="Input Cost Structure Breakdown"
                subtitle="Share of major operational expense buckets across total acreage"
              >
                <div className="grid sm:grid-cols-2 gap-4 items-center">
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={costBreakdownData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          innerRadius={50}
                          paddingAngle={2}
                        >
                          {costBreakdownData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5E9E3', borderRadius: '8px', fontSize: '12px' }}
                          formatter={v => [`₹${v.toLocaleString('en-IN')}`, 'Cost']}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-2 text-xs">
                    {costBreakdownData.map((item, idx) => {
                      const pct = totalCost > 0 ? ((item.value / totalCost) * 100).toFixed(1) : 0
                      return (
                        <div key={item.name} className="flex items-center justify-between py-1 border-b border-brand-border/60">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                            <span className="text-brand-text font-medium">{item.name}</span>
                          </div>
                          <div className="font-mono text-right">
                            <span className="font-semibold text-brand-text">₹{item.value.toLocaleString('en-IN')}</span>
                            <span className="text-brand-secondary ml-1.5">({pct}%)</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </Card>

              {/* Unit Economics Card */}
              <Card
                title="Per-Quintal Unit Economics"
                subtitle="Direct margin comparison vs minimum support price"
              >
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-lg border border-brand-border bg-brand-bg">
                    <div className="text-[10px] uppercase font-semibold text-brand-secondary">Realization Rate</div>
                    <div className="text-xl font-semibold font-mono text-brand-text mt-1">₹{form.price_per_quintal}</div>
                    <div className="text-[11px] text-brand-secondary font-mono">per quintal</div>
                  </div>

                  <div className="p-3 rounded-lg border border-brand-border bg-brand-bg">
                    <div className="text-[10px] uppercase font-semibold text-brand-secondary">Production Cost</div>
                    <div className="text-xl font-semibold font-mono text-brand-text mt-1">₹{costPerQuintal}</div>
                    <div className="text-[11px] text-brand-secondary font-mono">C2 comprehensive</div>
                  </div>

                  <div className="p-3 rounded-lg border border-brand-border bg-brand-bg">
                    <div className="text-[10px] uppercase font-semibold text-brand-secondary">Net Unit Margin</div>
                    <div className={`text-xl font-semibold font-mono mt-1 ${form.price_per_quintal >= costPerQuintal ? 'text-brand-emerald' : 'text-risk-high'}`}>
                      ₹{form.price_per_quintal - costPerQuintal}
                    </div>
                    <div className="text-[11px] text-brand-secondary font-mono">per quintal</div>
                  </div>
                </div>
              </Card>
            </>
          )}

          {activeTab === 'sensitivity' && (
            <Card
              title="Price & Yield Sensitivity Matrix"
              subtitle="Projected Net Farm Profit under varying price swings and harvest yields"
            >
              <div className="overflow-x-auto -mx-5 -mb-5">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-brand-border bg-brand-bg/50">
                      <th className="text-left py-2.5 px-4 font-semibold text-brand-secondary uppercase">Harvest Scenario</th>
                      <th className="text-right py-2.5 px-4 font-semibold text-brand-secondary uppercase">-10% Price Drop</th>
                      <th className="text-right py-2.5 px-4 font-semibold text-brand-secondary uppercase">Base Modal Price</th>
                      <th className="text-right py-2.5 px-4 font-semibold text-brand-secondary uppercase">+10% Premium Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border font-mono tabular-nums">
                    {sensitivityRows.map((row, i) => (
                      <tr key={i} className="hover:bg-brand-bg/60 transition-colors">
                        <td className="py-3 px-4 font-sans font-medium text-brand-text">{row.yieldShift}</td>
                        <td className={`py-3 px-4 text-right font-semibold ${row.lowPrice >= 0 ? 'text-brand-emerald' : 'text-risk-high'}`}>
                          ₹{row.lowPrice.toLocaleString('en-IN')}
                        </td>
                        <td className={`py-3 px-4 text-right font-semibold ${row.basePrice >= 0 ? 'text-brand-emerald' : 'text-risk-high'}`}>
                          ₹{row.basePrice.toLocaleString('en-IN')}
                        </td>
                        <td className={`py-3 px-4 text-right font-semibold ${row.highPrice >= 0 ? 'text-brand-emerald' : 'text-risk-high'}`}>
                          ₹{row.highPrice.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
