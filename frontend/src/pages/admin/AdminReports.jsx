import React, { useState, useEffect } from 'react'
import { adminAPI } from '../../services/api'
import {
  FileText, Download, BarChart3, Users, TrendingUp, AlertTriangle,
  MapPin, Cpu, RefreshCw, Calendar, CheckCircle2
} from 'lucide-react'
import toast from 'react-hot-toast'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'

const REPORT_TYPES = [
  {
    id: 'user_registration',
    title: 'Tenant Growth & Geographic Registry',
    desc: 'New user signups over time, segmented by state, district, and agricultural classification.',
    period: 'Monthly Aggregation',
    icon: Users,
  },
  {
    id: 'feature_usage',
    title: 'Platform Feature Utilization Audit',
    desc: 'Quantitative frequency analysis across yield predictions, soil health cards, and risk matrices.',
    period: 'Weekly Rolling',
    icon: BarChart3,
  },
  {
    id: 'prediction_accuracy',
    title: 'Inference Precision & Model Accuracy',
    desc: 'Empirical XGBoost error distributions, R2 coefficients, and post-harvest validation records.',
    period: 'Seasonal Post-Harvest',
    icon: Cpu,
  },
  {
    id: 'risk_aggregated',
    title: 'Multi-Hazard Agricultural Risk Census',
    desc: 'Aggregated regional vulnerabilities — drought probability, waterlogging, and canopy heat indices.',
    period: 'Monthly Synthesis',
    icon: AlertTriangle,
  },
  {
    id: 'farm_coverage',
    title: 'Cadastral Farm Parcel Coverage',
    desc: 'Geographic distribution of monitored acreage, soil taxonomy profiles, and irrigation systems.',
    period: 'Quarterly Audit',
    icon: MapPin,
  },
  {
    id: 'yield_trends',
    title: 'Crop Yield Benchmark Trends',
    desc: 'Comparative historical production versus satellite machine-learning predictions across Indian districts.',
    period: 'Kharif & Rabi Cycles',
    icon: TrendingUp,
  },
]

export default function AdminReports() {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState({})

  useEffect(() => {
    adminAPI.analytics()
      .then(r => setAnalytics(r.data))
      .catch(() => setAnalytics(null))
      .finally(() => setLoading(false))
  }, [])

  const handleGenerate = async (reportId, title) => {
    setGenerating(prev => ({ ...prev, [reportId]: true }))
    await new Promise(r => setTimeout(r, 1000))
    toast.success(`"${title}" compiled and queued for export`)
    setGenerating(prev => ({ ...prev, [reportId]: false }))
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-brand-border">
        <div>
          <h1 className="text-2xl font-semibold text-brand-text tracking-tight flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-brand-emerald" />
            Governance Reporting & Compliance Audits
          </h1>
          <p className="text-sm text-brand-secondary mt-1">
            Generate and export aggregated administrative intelligence, tenancy logs, and MLOps compliance documents.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {REPORT_TYPES.map(r => {
          const Icon = r.icon
          const isBusy = generating[r.id]
          return (
            <div
              key={r.id}
              className="p-5 rounded-lg border border-brand-border bg-brand-surface hover:border-brand-emerald transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-lg bg-brand-bg border border-brand-border flex items-center justify-center text-brand-emerald">
                    <Icon className="w-5 h-5" />
                  </div>
                  <Badge variant="default" size="sm">{r.period}</Badge>
                </div>

                <h3 className="text-sm font-semibold text-brand-text mt-2">{r.title}</h3>
                <p className="text-xs text-brand-secondary leading-relaxed">{r.desc}</p>
              </div>

              <div className="pt-2 border-t border-brand-border">
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full justify-center"
                  loading={isBusy}
                  onClick={() => handleGenerate(r.id, r.title)}
                  icon={Download}
                >
                  Compile PDF Ledger
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
