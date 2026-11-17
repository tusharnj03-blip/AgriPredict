import React, { useState, useEffect } from 'react'
import { farmsAPI } from '../../services/api'
import { Link } from 'react-router-dom'
import { MapPin, Plus, Trash2, Eye, AlertCircle, Layers, Droplets, Sprout } from 'lucide-react'
import toast from 'react-hot-toast'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Modal from '../../components/ui/Modal'
import EmptyState from '../../components/ui/EmptyState'
import { CardSkeleton } from '../../components/ui/Skeleton'

const STATES = [
  'Punjab', 'Haryana', 'Uttar Pradesh', 'Madhya Pradesh',
  'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Andhra Pradesh',
  'Gujarat', 'Rajasthan', 'West Bengal', 'Bihar', 'Telangana'
]

const SOIL_TYPES = ['Alluvial', 'Black', 'Red', 'Laterite', 'Sandy', 'Loamy', 'Clay']
const IRRIGATION_TYPES = ['Rainfed', 'Canal', 'Borewell', 'Drip', 'Sprinkler']

export default function Farms() {
  const [farms, setFarms] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [creating, setCreating] = useState(false)

  const [form, setForm] = useState({
    farm_name: '',
    state: 'Punjab',
    district: '',
    village: '',
    area: '2.5',
    soil_type: 'Alluvial',
    irrigation_type: 'Canal',
    latitude: '',
    longitude: ''
  })

  const loadFarms = async () => {
    setLoading(true)
    try {
      const res = await farmsAPI.list()
      setFarms(res.data || [])
    } catch {
      setFarms([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFarms()
  }, [])

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete parcel "${name}"?`)) return
    try {
      await farmsAPI.delete(id)
      setFarms(prev => prev.filter(f => f.id !== id))
      toast.success('Farm parcel removed')
    } catch {
      toast.error('Failed to delete farm')
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setCreating(true)
    try {
      const payload = {
        farm_name: form.farm_name,
        state: form.state,
        district: form.district,
        village: form.village,
        area: parseFloat(form.area) || 1.0,
        soil_type: form.soil_type,
        irrigation_type: form.irrigation_type,
        latitude: parseFloat(form.latitude) || 0,
        longitude: parseFloat(form.longitude) || 0,
      }
      const { data } = await farmsAPI.create(payload)
      setFarms(prev => [data, ...prev])
      setShowModal(false)
      setForm({
        farm_name: '',
        state: 'Punjab',
        district: '',
        village: '',
        area: '2.5',
        soil_type: 'Alluvial',
        irrigation_type: 'Canal',
        latitude: '',
        longitude: ''
      })
      toast.success('Agricultural parcel registered')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create farm')
    } finally {
      setCreating(false)
    }
  }

  const u = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-brand-border">
        <div>
          <h1 className="text-2xl font-semibold text-brand-text tracking-tight flex items-center gap-2.5">
            <MapPin className="w-6 h-6 text-brand-emerald" />
            Registered Farm Holdings
          </h1>
          <p className="text-sm text-brand-secondary mt-1">
            GIS boundary mapping, edaphic classifications, and localized telemetry for your agricultural holdings.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setShowModal(true)}
          icon={Plus}
        >
          Add New Farm
        </Button>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map(i => <CardSkeleton key={i} />)}
        </div>
      ) : farms.length === 0 ? (
        <Card>
          <EmptyState
            icon={MapPin}
            title="No Farm Parcels Registered"
            description="Add your first landholding to unlock satellite crop health tracking, localized weather telemetry, and precision yield forecasting."
            action={{
              label: 'Register Farm Holding',
              onClick: () => setShowModal(true)
            }}
          />
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {farms.map(f => {
            const name = f.name || f.farm_name || 'Farm Parcel'
            return (
              <div
                key={f.id}
                className="p-5 rounded-lg border border-brand-border bg-brand-surface hover:border-brand-emerald transition-all space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-brand-bg border border-brand-border flex items-center justify-center text-brand-emerald">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-brand-text">{name}</h3>
                      <p className="text-xs text-brand-secondary">
                        {f.district ? `${f.district}, ` : ''}{f.state}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Link
                      to={`/farms/${f.id}`}
                      className="p-1.5 text-brand-secondary hover:text-brand-text rounded hover:bg-brand-bg transition-colors"
                      title="View Dossier"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(f.id, name)}
                      className="p-1.5 text-brand-secondary hover:text-risk-high rounded hover:bg-brand-bg transition-colors"
                      title="Delete Parcel"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded bg-brand-bg border border-brand-border/60">
                    <span className="text-[10px] uppercase font-semibold text-brand-secondary block">Area</span>
                    <span className="font-mono font-medium text-brand-text">{f.area} ha</span>
                  </div>
                  <div className="p-2.5 rounded bg-brand-bg border border-brand-border/60">
                    <span className="text-[10px] uppercase font-semibold text-brand-secondary block">Soil Type</span>
                    <span className="font-medium text-brand-text truncate block">{f.soil_type || 'Alluvial'}</span>
                  </div>
                  <div className="p-2.5 rounded bg-brand-bg border border-brand-border/60">
                    <span className="text-[10px] uppercase font-semibold text-brand-secondary block">Irrigation</span>
                    <span className="font-medium text-brand-text truncate block">{f.irrigation_type || 'Canal'}</span>
                  </div>
                  <div className="p-2.5 rounded bg-brand-bg border border-brand-border/60">
                    <span className="text-[10px] uppercase font-semibold text-brand-secondary block">Village</span>
                    <span className="font-medium text-brand-text truncate block">{f.village || 'Primary'}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-brand-border flex items-center justify-between">
                  <span className="text-[11px] text-brand-secondary">
                    Crop: <span className="font-medium text-brand-text">{f.current_crop || 'Rice / Wheat'}</span>
                  </span>
                  <Link
                    to={`/farms/${f.id}`}
                    className="text-xs font-medium text-brand-emerald hover:underline"
                  >
                    Open Farm Dossier →
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add Farm Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Register Farm Parcel"
        subtitle="Provide geographic coordinates and agro-climatic profile"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Farm Parcel Name"
            placeholder="e.g. North Canal Holding"
            value={form.farm_name}
            onChange={e => u('farm_name', e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="State / Region"
              value={form.state}
              onChange={e => u('state', e.target.value)}
              options={STATES.map(s => ({ value: s, label: s }))}
            />
            <Input
              label="District"
              placeholder="e.g. Ludhiana"
              value={form.district}
              onChange={e => u('district', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Village / Tehsil"
              placeholder="Village name"
              value={form.village}
              onChange={e => u('village', e.target.value)}
            />
            <Input
              label="Area"
              type="number"
              step="0.1"
              unit="ha"
              value={form.area}
              onChange={e => u('area', e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Soil Classification"
              value={form.soil_type}
              onChange={e => u('soil_type', e.target.value)}
              options={SOIL_TYPES.map(s => ({ value: s, label: s }))}
            />
            <Select
              label="Primary Irrigation"
              value={form.irrigation_type}
              onChange={e => u('irrigation_type', e.target.value)}
              options={IRRIGATION_TYPES.map(i => ({ value: i, label: i }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-brand-border">
            <Input
              label="Latitude"
              type="number"
              step="0.0001"
              placeholder="e.g. 30.9010"
              value={form.latitude}
              onChange={e => u('latitude', e.target.value)}
            />
            <Input
              label="Longitude"
              type="number"
              step="0.0001"
              placeholder="e.g. 75.8573"
              value={form.longitude}
              onChange={e => u('longitude', e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-brand-border">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={creating}
            >
              Save Holding
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
