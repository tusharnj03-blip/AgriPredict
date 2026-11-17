import React from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft, ArrowRight, TrendingUp, AlertTriangle, Leaf,
  Zap, Bug, BarChart3, MapPin, LayoutDashboard, Check
} from 'lucide-react'
import { PublicNav } from './About'

const MODULES = [
  {
    icon: TrendingUp,
    title: 'Yield Prediction Engine',
    desc: 'Gradient boosting model (XGBoost) trained on historical district cropping datasets. Computes expected tonnage per hectare, 95% confidence bounds, and local feature importance via SHAP attributions.',
    specs: ['Statistical R² ~ 0.94 on validation set', 'SHAP TreeExplainer attributions', 'Standardized district agro-climatic inputs']
  },
  {
    icon: AlertTriangle,
    title: 'Multi-Hazard Risk Analysis',
    desc: 'Multi-factor risk assessment quantifying exposure to drought conditions, unseasonal waterlogging, canopy heat anomalies, and regional market price volatility.',
    specs: ['6 deterministic hazard dimensions', 'IMD gridded weather inputs', 'Actionable agronomic contingency guidelines']
  },
  {
    icon: Leaf,
    title: 'Crop Recommendation',
    desc: 'Calibrated crop suitability matching based on soil macronutrients (available N, P, K), pH range, precipitation threshold, and ambient temperature windows.',
    specs: ['ICAR optimal agronomic ranges', '10+ major Kharif & Rabi field crops', 'Cross-navigation to yield and profit engines']
  },
  {
    icon: Zap,
    title: 'What-If Simulation Studio',
    desc: 'Sensitivity perturbation engine allowing farmers to simulate variations in seasonal rainfall (-50% to +50%), temperature shifts, and micro-irrigation scheduling.',
    specs: ['Yield delta variance calculation', 'Revenue sensitivity against MSP', 'Pre-configured climate shock scenarios']
  },
  {
    icon: Bug,
    title: 'Pathology Diagnostics',
    desc: 'Pathogen and symptom identification matrix for major crop diseases with chemical active ingredient dosages and biological control practices (Pseudomonas, Trichoderma, NSKE).',
    specs: ['Chemical fungicide and bactericide dosages', 'Biological organic soil/foliar amendments', 'Economic crop loss risk estimation']
  },
  {
    icon: BarChart3,
    title: 'Market & Mandi Price Analysis',
    desc: 'Tracks mandi price observations across major agricultural markets in India against official Commission for Agricultural Costs & Prices (CACP) Minimum Support Prices.',
    specs: ['8 Regional APMC Mandi feeds', 'Weekly price trend curves', 'Post-harvest dispatch timing insights']
  },
  {
    icon: MapPin,
    title: 'Farm Property Registry',
    desc: 'Farm property record management tracking field boundary area (hectares), soil classification, historical soil lab test reports, and seasonal crop rotation records.',
    specs: ['Per-farm soil nutrient profiles', 'Cropping history logs', 'Auto-fill integration across all prediction forms']
  },
  {
    icon: LayoutDashboard,
    title: 'Platform Administration & MLOps',
    desc: 'Administrative oversight interface with model artifact registry, latency and throughput telemetry, live telemetry log streaming, and audit trails.',
    specs: ['Model latency benchmarks', 'Streaming audit log viewer', 'User account and farm oversight']
  }
]

export default function Features() {
  return (
    <div className="min-h-screen bg-[#fbfaf8] text-[#292524]">
      <PublicNav />

      <div className="pt-28 pb-20 px-6 max-w-6xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-xs font-semibold text-[#57534e] hover:text-[#1c1917] mb-8">
          <ArrowLeft size={14} /> Return to Overview
        </Link>

        <div className="max-w-3xl mb-12">
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#1c1917] mb-4">
            System Capabilities and Methodological Overview
          </h1>
          <p className="text-base text-[#57534e] leading-relaxed">
            Detailed breakdown of the empirical and machine-learning components implemented in the AgriPredict platform.
          </p>
        </div>

        {/* Modules Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {MODULES.map(m => {
            const Icon = m.icon
            return (
              <div key={m.title} className="card">
                <div className="flex items-start gap-3.5 mb-3">
                  <div className="w-9 h-9 bg-[#f4f2eb] rounded border border-[#e2ddd4] flex items-center justify-center text-[#1b4332] shrink-0">
                    <Icon size={18} />
                  </div>
                  <div>
                    <h2 className="text-lg font-serif font-bold text-[#1c1917] leading-tight">{m.title}</h2>
                  </div>
                </div>

                <p className="text-xs text-[#57534e] leading-relaxed mb-4">
                  {m.desc}
                </p>

                <div className="pt-3 border-t border-[#e2ddd4] space-y-1.5">
                  {m.specs.map(spec => (
                    <div key={spec} className="flex items-center gap-2 text-xs text-[#292524]">
                      <Check size={13} className="text-[#1b4332] shrink-0" />
                      <span>{spec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Action Panel */}
        <div className="card text-center py-10 bg-white">
          <h2 className="text-2xl font-serif font-bold text-[#1c1917] mb-2">
            Access Decision Support Tools
          </h2>
          <p className="text-sm text-[#57534e] max-w-xl mx-auto mb-6">
            Register or sign in to access yield predictions, soil nutrient prescriptions, and farm economic planners.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link to="/register" className="btn-primary px-5 py-2.5">
              Open Account <ArrowRight size={16} />
            </Link>
            <Link to="/login" className="btn-secondary px-5 py-2.5">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
