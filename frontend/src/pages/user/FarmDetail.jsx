import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { farmsAPI } from '../../services/api'
import {
  MapPin, ArrowLeft, Edit3, Save, X, TrendingUp, AlertTriangle,
  Sprout, Droplets, FlaskConical, BarChart3, Trash2, CheckCircle2,
  ExternalLink, Layers
} from 'lucide-react'
import toast from 'react-hot-toast'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Badge from '../../components/ui/Badge'
import { CardSkeleton } from '../../components/ui/Skeleton'

const STATES = [
  'Punjab', 'Haryana', 'Uttar Pradesh', 'Madhya Pradesh',
  'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Andhra Pradesh',
  'Gujarat', 'Rajasthan', 'West Bengal', 'Bihar', 'Telangana'
]
const SOIL_TYPES = ['Alluvial', 'Black', 'Red', 'Laterite', 'Sandy', 'Loamy', 'Clay']
const IRRIGATION_TYPES = ['Rainfed', 'Canal', 'Borewell', 'Drip', 'Sprinkler']

const QUICK_ACTIONS = [
  { to: '/yield-prediction', icon: TrendingUp, label: 'Predict Yield', desc: 'Forecast seasonal output' },
  { to: '/risk-analysis', icon: AlertTriangle, label: 'Risk Intelligence', desc: 'Compute multi-hazard index' },
  { to: '/crop-recommendation', icon: Sprout, label: 'Crop Advisory', desc: 'Optimal species matching' },
  { to: '/soil-analysis', icon: FlaskConical, label: 'Soil Diagnostics', desc: 'STCR fertilizer calculator' },
  { to: '/weather', icon: Droplets, label: 'Weather Telemetry', desc: '7-day agro-meteorology' },
  { to: '/market-analysis', icon: BarChart3, label: 'Market Prices', desc: 'Live APMC mandi rates' },
]

export default function FarmDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [farm, setFarm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [form, setForm] = useState({})

  useEffect(() => {
    farmsAPI.get(id)
      .then(r => {
        setFarm(r.data)
        setForm(r.data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  const startEdit = () => {
    setForm({ ...farm })
    setEditing(true)
  }

  const cancelEdit = () => {
    setForm({ ...farm })
    setEditing(false)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = {
        farm_name: form.farm_name || form.name,
        state: form.state,
        district: form.district,
        village: form.village,
        area: parseFloat(form.area),
        soil_type: form.soil_type,
        irrigation_type: form.irrigation_type,
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
      }
      const { data } = await farmsAPI.update(id, payload)
      setFarm(data)
      setEditing(false)
      toast.success('Holding parameters updated')
    } catch {
      toast.error('Failed to update farm')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await farmsAPI.delete(id)
      toast.success('Farm holding deleted')
      navigate('/farms')
    } catch {
      toast.error('Failed to delete farm')
      setDeleting(false)
    }
  }

  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }))

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <CardSkeleton />
        <div className="grid md:grid-cols-2 gap-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    )
  }

  if (!farm) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <MapPin className="w-12 h-12 text-brand-secondary mx-auto" />
        <h2 className="text-xl font-semibold text-brand-text">Farm Parcel Not Found</h2>
        <p className="text-sm text-brand-secondary">The requested agricultural holding could not be located or has been deleted.</p>
        <Link to="/farms">
          <Button variant="secondary" icon={ArrowLeft}>Return to Holdings</Button>
        </Link>
      </div>
    )
  }

  const farmName = farm.farm_name || farm.name || 'Farm Holding'

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-brand-border">
        <div className="flex items-center gap-3">
          <Link
            to="/farms"
            className="p-2 rounded-lg border border-brand-border bg-brand-surface hover:bg-brand-bg text-brand-secondary hover:text-brand-text transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-brand-text tracking-tight flex items-center gap-2">
              <MapPin className="w-6 h-6 text-brand-emerald" />
              {farmName}
            </h1>
            <p className="text-xs text-brand-secondary mt-0.5">
              {farm.district ? `${farm.district}, ` : ''}{farm.state} • {farm.area} hectares
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {editing ? (
            <>
              <Button
                variant="secondary"
                onClick={cancelEdit}
                disabled={saving}
                icon={X}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                loading={saving}
                icon={Save}
              >
                Save Changes
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="secondary"
                onClick={startEdit}
                icon={Edit3}
              >
                Edit Parameters
              </Button>

              {confirmDelete ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-risk-high font-medium">Confirm deletion?</span>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={handleDelete}
                    loading={deleting}
                  >
                    Delete
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setConfirmDelete(false)}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  onClick={() => setConfirmDelete(true)}
                  icon={Trash2}
                >
                  Delete
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-12 gap-6 items-start">
        {/* Left Parcel Profile */}
        <div className="md:col-span-7 space-y-5">
          <Card
            title="Holding Specifications"
            subtitle="Registered soil taxonomy and irrigation infrastructure"
          >
            {editing ? (
              <div className="space-y-4 pt-1">
                <Input
                  label="Farm Name"
                  value={form.farm_name || form.name || ''}
                  onChange={e => upd('farm_name', e.target.value)}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Select
                    label="State"
                    value={form.state}
                    onChange={e => upd('state', e.target.value)}
                    options={STATES.map(s => ({ value: s, label: s }))}
                  />
                  <Input
                    label="District"
                    value={form.district || ''}
                    onChange={e => upd('district', e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Village"
                    value={form.village || ''}
                    onChange={e => upd('village', e.target.value)}
                  />
                  <Input
                    label="Area (ha)"
                    type="number"
                    step="0.1"
                    value={form.area || ''}
                    onChange={e => upd('area', e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Select
                    label="Soil Type"
                    value={form.soil_type || ''}
                    onChange={e => upd('soil_type', e.target.value)}
                    options={SOIL_TYPES.map(s => ({ value: s, label: s }))}
                  />
                  <Select
                    label="Irrigation Type"
                    value={form.irrigation_type || ''}
                    onChange={e => upd('irrigation_type', e.target.value)}
                    options={IRRIGATION_TYPES.map(i => ({ value: i, label: i }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-brand-border">
                  <Input
                    label="Latitude"
                    type="number"
                    step="0.0001"
                    value={form.latitude || ''}
                    onChange={e => upd('latitude', e.target.value)}
                  />
                  <Input
                    label="Longitude"
                    type="number"
                    step="0.0001"
                    value={form.longitude || ''}
                    onChange={e => upd('longitude', e.target.value)}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2.5 pt-1">
                {[
                  ['State / Province', farm.state],
                  ['District', farm.district || '—'],
                  ['Village / Tehsil', farm.village || '—'],
                  ['Operational Area', `${farm.area} hectares`],
                  ['Soil Classification', farm.soil_type || 'Alluvial'],
                  ['Irrigation Method', farm.irrigation_type || 'Canal'],
                  ['GPS Coordinates', farm.latitude && farm.longitude ? `${farm.latitude.toFixed(4)}°N, ${farm.longitude.toFixed(4)}°E` : 'Not georeferenced'],
                  ['Registration Date', farm.created_at ? new Date(farm.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Verified Profile'],
                ].map(([lbl, val]) => (
                  <div key={lbl} className="flex justify-between items-center py-2 border-b border-brand-border/60 text-xs">
                    <span className="text-brand-secondary font-medium">{lbl}</span>
                    <span className="text-brand-text font-mono font-medium text-right">{val}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right Location & Quick Launch Actions */}
        <div className="md:col-span-5 space-y-5">
          {/* Location Box */}
          <Card
            title="Geographic Telemetry"
            subtitle="GIS coordinates and field bounds"
          >
            <div className="p-4 rounded-lg bg-brand-bg border border-brand-border text-center space-y-2">
              <MapPin className="w-8 h-8 text-brand-emerald mx-auto" />
              {farm.latitude && farm.longitude ? (
                <>
                  <div className="text-xs font-semibold text-brand-text font-mono">
                    {farm.latitude.toFixed(4)}° N, {farm.longitude.toFixed(4)}° E
                  </div>
                  <p className="text-[11px] text-brand-secondary">
                    Georeferenced cadastral boundary recorded in database.
                  </p>
                  <div className="pt-2">
                    <a
                      href={`https://maps.google.com/?q=${farm.latitude},${farm.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-emerald hover:underline"
                    >
                      <span>Open Satellite Map</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-xs text-brand-text font-medium">Coordinates Not Yet Configured</p>
                  <p className="text-[11px] text-brand-secondary">
                    Add GPS coordinates via edit mode to unlock precise micro-climate forecasts.
                  </p>
                </>
              )}
            </div>
          </Card>

          {/* Quick Launchpad */}
          <Card
            title="Analysis Launchpad"
            subtitle="Directly run models pre-loaded with this holding's profile"
          >
            <div className="grid grid-cols-2 gap-2.5">
              {QUICK_ACTIONS.map(action => {
                const Icon = action.icon
                return (
                  <Link
                    key={action.to}
                    to={action.to}
                    className="p-3 rounded-lg border border-brand-border bg-brand-surface hover:border-brand-emerald hover:bg-brand-bg transition-all group text-left"
                  >
                    <Icon className="w-4 h-4 text-brand-emerald mb-1.5" />
                    <div className="text-xs font-semibold text-brand-text group-hover:text-brand-emerald">
                      {action.label}
                    </div>
                    <div className="text-[10px] text-brand-secondary leading-tight mt-0.5">
                      {action.desc}
                    </div>
                  </Link>
                )
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
