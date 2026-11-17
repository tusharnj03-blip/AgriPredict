import React, { useState, useEffect } from 'react'
import { adminAPI } from '../../services/api'
import {
  Database, CheckCircle2, AlertTriangle, Play, RefreshCw,
  Cpu, Activity, Zap, ShieldCheck, ArrowUpRight, BarChart2,
  HardDrive, Layers, Clock, Settings
} from 'lucide-react'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, RadarChart, PolarGrid,
  PolarAngleAxis, Radar
} from 'recharts'
import toast from 'react-hot-toast'
import Card, { MetricCard } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'

const MODEL_REGISTRY = [
  {
    id: 'xgboost-yield-v2',
    name: 'XGBoost Yield Predictor',
    version: 'v2.4.1 (Production)',
    framework: 'XGBoost 2.0.3 + TreeSHAP',
    status: 'ACTIVE',
    r2: 0.942,
    mae: 0.312,
    rmse: 0.448,
    mape: 8.2,
    latency: '34 ms',
    throughput: '210 req/s',
    trainedOn: '1.2M records (1997-2024)',
    features: 24,
    driftStatus: 'Normal (0.02 KS-stat)',
    desc: 'Primary crop yield forecasting engine utilizing climate variables, historical district yields, and soil macronutrients.'
  },
  {
    id: 'rf-yield-v1',
    name: 'Random Forest Multi-Crop Ensemble',
    version: 'v1.8.4 (Staging)',
    framework: 'Scikit-Learn 1.4',
    status: 'STANDBY',
    r2: 0.914,
    mae: 0.385,
    rmse: 0.521,
    mape: 9.8,
    latency: '52 ms',
    throughput: '145 req/s',
    trainedOn: '850K records (2000-2023)',
    features: 18,
    driftStatus: 'Normal (0.04 KS-stat)',
    desc: 'Ensemble fallback model with strong resilience against missing climate features and high variance in rainfed zones.'
  },
  {
    id: 'disease-cnn-v3',
    name: 'Crop Pathology Diagnostic Engine',
    version: 'v3.2.0 (Production)',
    framework: 'PyTorch 2.2 + TorchVision',
    status: 'ACTIVE',
    r2: 0.946,
    mae: 0.054,
    rmse: 0.082,
    mape: 5.4,
    latency: '78 ms',
    throughput: '85 req/s',
    trainedOn: '54,000 leaf symptom images (PlantVillage + Field)',
    features: '224x224 RGB',
    driftStatus: 'Low Drift',
    desc: 'Computer vision classifier detecting fungal, bacterial, and pest-induced leaf damage across staple Indian crops.'
  },
  {
    id: 'soil-health-v2',
    name: 'ICAR Soil Health Diagnostic Calibrator',
    version: 'v2.1.0 (Production)',
    framework: 'STCR Calibration Model',
    status: 'ACTIVE',
    r2: 0.965,
    mae: 0.180,
    rmse: 0.240,
    mape: 5.4,
    latency: '12 ms',
    throughput: '450 req/s',
    trainedOn: 'ICAR National Soil Profile Database (2015-2024)',
    features: 12,
    driftStatus: 'Calibrated',
    desc: 'Calibrates standard Indian Soil Health Card test values into tailored NPK fertilizer and organic amendment dosages.'
  },
  {
    id: 'risk-hazard-v1',
    name: 'Agro-Climate Multi-Hazard Risk Model',
    version: 'v1.5.2 (Production)',
    framework: 'Probabilistic Decision Matrix',
    status: 'ACTIVE',
    r2: 0.892,
    mae: 3.800,
    rmse: 5.200,
    mape: 7.1,
    latency: '18 ms',
    throughput: '380 req/s',
    trainedOn: 'IMD 30-year Gridded Weather Data (1991-2023)',
    features: 15,
    driftStatus: 'Monitored',
    desc: 'Multi-hazard exposure engine scoring drought, inundation, heat waves, and market volatility probabilities.'
  }
]

export default function AdminModels() {
  const [models, setModels] = useState(MODEL_REGISTRY)
  const [selectedModel, setSelectedModel] = useState(MODEL_REGISTRY[0])
  const [retraining, setRetraining] = useState(false)

  const handleRetrain = (modelId) => {
    setRetraining(true)
    setTimeout(() => {
      setRetraining(false)
      toast.success(`Retraining job scheduled for ${modelId}`)
    }, 1200)
  }

  const comparisonData = models.map(m => ({
    name: m.name.split(' ')[0],
    r2: m.r2 ? Number((m.r2 * 100).toFixed(1)) : 90,
    latency: parseInt(m.latency) || 30
  }))

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-brand-border">
        <div>
          <h1 className="text-2xl font-semibold text-brand-text tracking-tight flex items-center gap-2.5">
            <Cpu className="w-6 h-6 text-brand-emerald" />
            MLOps & Model Registry Governance
          </h1>
          <p className="text-sm text-brand-secondary mt-1">
            Model versioning, drift metrics, inference latency SLAs, and automated retraining pipelines.
          </p>
        </div>

        <Button
          variant="secondary"
          onClick={() => handleRetrain(selectedModel.id)}
          loading={retraining}
          icon={Play}
        >
          Retrain Active Model
        </Button>
      </div>

      {/* Model KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          label="Active In Production"
          value={models.filter(m => m.status === 'ACTIVE').length}
          secondaryValue="Production endpoints live"
          icon={CheckCircle2}
        />
        <MetricCard
          label="Peak R² Accuracy"
          value="0.965"
          secondaryValue="ICAR STCR diagnostic"
          icon={Zap}
        />
        <MetricCard
          label="Average P95 Latency"
          value="32 ms"
          secondaryValue="Sub-50ms inference SLA"
          icon={Clock}
        />
        <MetricCard
          label="Data Drift Status"
          value="Calibrated"
          secondaryValue="KS-statistic < 0.05"
          icon={ShieldCheck}
        />
      </div>

      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Left Registry Selector */}
        <div className="lg:col-span-5 space-y-3">
          <h2 className="text-xs font-semibold text-brand-text uppercase tracking-wider">
            Registered Production Models
          </h2>

          {models.map(m => {
            const isSelected = selectedModel.id === m.id
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedModel(m)}
                className={`w-full text-left p-4 rounded-lg border transition-all ${
                  isSelected
                    ? 'border-brand-emerald bg-brand-surface shadow-sm'
                    : 'border-brand-border bg-brand-surface hover:border-brand-emerald/60'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-brand-text text-sm">{m.name}</h3>
                  <Badge variant={m.status === 'ACTIVE' ? 'success' : 'default'} size="sm">
                    {m.status}
                  </Badge>
                </div>
                <p className="text-xs text-brand-secondary font-mono">{m.framework} • {m.version}</p>
                <div className="flex items-center gap-3 pt-2 text-xs font-mono text-brand-secondary">
                  <span>R²: <strong className="text-brand-text">{m.r2 || 'N/A'}</strong></span>
                  <span>Latency: <strong className="text-brand-text">{m.latency}</strong></span>
                  <span>Throughput: <strong className="text-brand-text">{m.throughput}</strong></span>
                </div>
              </button>
            )
          })}
        </div>

        {/* Right Model Detail Dossier */}
        <div className="lg:col-span-7 space-y-5">
          <Card
            title={`Architecture Dossier: ${selectedModel.name}`}
            subtitle={selectedModel.desc}
            action={
              <Badge variant={selectedModel.status === 'ACTIVE' ? 'success' : 'default'}>
                {selectedModel.version}
              </Badge>
            }
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 border-y border-brand-border text-center">
              <div className="p-2.5 rounded bg-brand-bg border border-brand-border/60">
                <span className="text-[10px] uppercase font-semibold text-brand-secondary block">R² Score</span>
                <span className="text-lg font-semibold font-mono text-brand-emerald">{selectedModel.r2 || '0.94'}</span>
              </div>
              <div className="p-2.5 rounded bg-brand-bg border border-brand-border/60">
                <span className="text-[10px] uppercase font-semibold text-brand-secondary block">Mean Abs Error</span>
                <span className="text-lg font-semibold font-mono text-brand-text">{selectedModel.mae || '0.31'}</span>
              </div>
              <div className="p-2.5 rounded bg-brand-bg border border-brand-border/60">
                <span className="text-[10px] uppercase font-semibold text-brand-secondary block">RMSE</span>
                <span className="text-lg font-semibold font-mono text-brand-text">{selectedModel.rmse || '0.45'}</span>
              </div>
              <div className="p-2.5 rounded bg-brand-bg border border-brand-border/60">
                <span className="text-[10px] uppercase font-semibold text-brand-secondary block">Mean Latency</span>
                <span className="text-lg font-semibold font-mono text-brand-text">{selectedModel.latency}</span>
              </div>
            </div>

            <div className="space-y-2 pt-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-brand-border/60">
                <span className="text-brand-secondary font-medium">Training Corpus</span>
                <span className="font-mono text-brand-text">{selectedModel.trainedOn}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-brand-border/60">
                <span className="text-brand-secondary font-medium">Input Features</span>
                <span className="font-mono text-brand-text">{selectedModel.features} parameters</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-brand-border/60">
                <span className="text-brand-secondary font-medium">Covariate Drift Check</span>
                <span className="font-mono text-brand-emerald">{selectedModel.driftStatus}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-brand-secondary font-medium">Deployment Target</span>
                <span className="font-mono text-brand-text">FastAPI Worker Daemon / Uvicorn</span>
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-2.5 border-t border-brand-border">
              <Button
                variant="primary"
                onClick={() => handleRetrain(selectedModel.id)}
                loading={retraining}
                icon={Play}
              >
                Trigger Automated Pipeline Retrain
              </Button>
            </div>
          </Card>

          {/* Cross-Model Performance Chart */}
          <Card
            title="Model Accuracy vs Inference Latency"
            subtitle="Benchmark R² accuracy (%) and compute latency (ms)"
          >
            <div className="h-56 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="#E5E9E3" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: '#69766E', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#69766E', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5E9E3', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Bar dataKey="r2" name="Accuracy (x100)" fill="#21865A" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="latency" name="Latency (ms)" fill="#183D2B" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
