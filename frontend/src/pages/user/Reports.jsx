import React, { useState, useEffect } from 'react'
import { reportsAPI } from '../../services/api'
import { FileText, Download, Plus, CheckCircle2, Sparkles, Printer } from 'lucide-react'
import toast from 'react-hot-toast'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'
import { CardSkeleton } from '../../components/ui/Skeleton'

const INCLUDED_MODULES = [
  'Farm Georeference Dossier',
  'Soil Health Card & STCR Dosing',
  'Real-Time Weather Telemetry',
  'Machine Learning Yield Forecast',
  'SHAP Feature Attributions',
  'Multi-Hazard Risk Matrix',
  'C2 Profit & Revenue Ledger',
  'Crop Suitability Rankings',
  'Agronomic Action Protocols'
]

export default function Reports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    reportsAPI.list()
      .then(r => setReports(r.data || []))
      .catch(() => setReports([]))
      .finally(() => setLoading(false))
  }, [])

  const generate = async () => {
    setGenerating(true)
    try {
      const { data } = await reportsAPI.generate({ type: 'comprehensive' })
      setReports(prev => [data, ...prev])
      toast.success('Agricultural report compiled')
    } catch {
      toast.error('Report compilation failed')
    } finally {
      setGenerating(false)
    }
  }

  const download = async (id, name) => {
    try {
      const response = await reportsAPI.download(id)
      const url = URL.createObjectURL(new Blob([response.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = `${name}.pdf`
      a.click()
      toast.success('PDF downloaded')
    } catch {
      toast.error('Download failed')
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-brand-border">
        <div>
          <h1 className="text-2xl font-semibold text-brand-text tracking-tight flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-brand-emerald" />
            Agricultural Intelligence Reports
          </h1>
          <p className="text-sm text-brand-secondary mt-1">
            Generate and export comprehensive audit-ready agronomic reports with model explanations and financials.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={generate}
          loading={generating}
          icon={Plus}
        >
          Generate Dossier
        </Button>
      </div>

      {/* Scope Checklist Card */}
      <Card
        title="Dossier Scope & Verification Index"
        subtitle="Standard modules included in every comprehensive agricultural report"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
          {INCLUDED_MODULES.map(item => (
            <div
              key={item}
              className="flex items-center gap-2 p-2.5 rounded-lg border border-brand-border bg-brand-bg text-xs text-brand-text"
            >
              <CheckCircle2 className="w-4 h-4 text-brand-emerald shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Generated Reports Ledger */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map(i => <CardSkeleton key={i} />)}
        </div>
      ) : reports.length === 0 ? (
        <Card>
          <EmptyState
            icon={FileText}
            title="No Reports Generated Yet"
            description="Compile an integrated agricultural dossier combining your active farms, soil tests, weather telemetry, and yield predictions."
            action={{
              label: 'Compile New Report',
              onClick: generate
            }}
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {reports.map((r, i) => (
            <div
              key={r.id || i}
              className="p-4 rounded-lg border border-brand-border bg-brand-surface hover:border-brand-emerald transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-lg bg-brand-bg border border-brand-border flex items-center justify-center text-brand-emerald shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-brand-text">
                    {r.name || `Agricultural Intelligence Dossier #${i + 1}`}
                  </h3>
                  <p className="text-xs text-brand-secondary font-mono mt-0.5">
                    {r.created_at ? new Date(r.created_at).toLocaleString('en-IN') : 'Recent Archive'} • Comprehensive Audit PDF
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => download(r.id, r.name || `agripredict-dossier-${i + 1}`)}
                  icon={Download}
                >
                  Download PDF
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
