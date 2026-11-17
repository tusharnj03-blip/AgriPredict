import React from 'react'
import { Link } from 'react-router-dom'
import {
  Leaf, TrendingUp, Shield, BarChart3, ArrowRight,
  FlaskConical, Cloud, Bug, Droplets, Database, Check
} from 'lucide-react'

function NavBar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#e2ddd4]">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#1b4332] rounded flex items-center justify-center">
            <Leaf size={16} className="text-white" />
          </div>
          <span className="font-serif font-bold text-lg text-[#1c1917] tracking-tight">AgriPredict</span>
        </Link>
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-[#57534e]">
          <Link to="/features" className="hover:text-[#1c1917] transition-colors">Methodology & Models</Link>
          <Link to="/about" className="hover:text-[#1c1917] transition-colors">Documentation</Link>
          <Link to="/contact" className="hover:text-[#1c1917] transition-colors">Contact</Link>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="btn-secondary text-xs px-3.5 py-2">Sign In</Link>
          <Link to="/register" className="btn-primary text-xs px-3.5 py-2">Open Platform</Link>
        </div>
      </div>
    </nav>
  )
}

export default function Home() {
  return (
    <div className="min-h-screen bg-[#fbfaf8] text-[#292524]">
      <NavBar />

      {/* Main Section */}
      <section className="pt-32 pb-16 px-6 border-b border-[#e2ddd4]">
        <div className="max-w-4xl mx-auto text-left">
          <div className="inline-block px-2.5 py-1 mb-4 text-xs font-semibold text-[#1b4332] bg-[#e3eee6] border border-[#c7ddce] rounded">
            AgriPredict AI • Intelligence for Every Acre.
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-[#1c1917] mb-6 leading-[1.15]">
            Quantitative modeling and agronomic intelligence for Indian cropping systems.
          </h1>

          <p className="text-lg text-[#57534e] mb-8 leading-relaxed max-w-2xl">
            AgriPredict evaluates regional climate data, soil chemical assays, and historical district production records to provide objective yield estimates, fertilizer dosages, and economic assessments.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link to="/register" className="btn-primary px-5 py-2.5">
              Access the Platform <ArrowRight size={16} />
            </Link>
            <Link to="/features" className="btn-secondary px-5 py-2.5">
              Review Scientific Architecture
            </Link>
          </div>
        </div>
      </section>

      {/* Analytical Modules Grid */}
      <section className="py-16 px-6 border-b border-[#e2ddd4] bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="mb-10">
            <h2 className="text-2xl font-serif font-bold text-[#1c1917] mb-2">
              Integrated Analytical Modules
            </h2>
            <p className="text-sm text-[#57534e]">
              Built with verified agricultural datasets, open government APIs, and standard agronomic equations.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="card">
              <div className="w-9 h-9 bg-[#f4f2eb] rounded border border-[#e2ddd4] flex items-center justify-center text-[#1b4332] mb-3">
                <TrendingUp size={18} />
              </div>
              <h3 className="text-base font-serif font-bold text-[#1c1917] mb-1.5">
                Yield Forecasting Engine
              </h3>
              <p className="text-xs text-[#57534e] leading-relaxed">
                Gradient-boosted decision trees (XGBoost) trained on multi-year district production data, accounting for rainfall, temperature, and soil fertility metrics. Includes SHAP attributions for explainability.
              </p>
            </div>

            <div className="card">
              <div className="w-9 h-9 bg-[#f4f2eb] rounded border border-[#e2ddd4] flex items-center justify-center text-[#1b4332] mb-3">
                <FlaskConical size={18} />
              </div>
              <h3 className="text-base font-serif font-bold text-[#1c1917] mb-1.5">
                Soil Health Card Diagnostic
              </h3>
              <p className="text-xs text-[#57534e] leading-relaxed">
                Calibrated against ICAR Soil Test Crop Response (STCR) benchmarks. Translates available N-P-K (kg/ha) and pH levels into exact bag counts of Urea, DAP, and MOP.
              </p>
            </div>

            <div className="card">
              <div className="w-9 h-9 bg-[#f4f2eb] rounded border border-[#e2ddd4] flex items-center justify-center text-[#1b4332] mb-3">
                <Shield size={18} />
              </div>
              <h3 className="text-base font-serif font-bold text-[#1c1917] mb-1.5">
                Multi-Hazard Risk Scoring
              </h3>
              <p className="text-xs text-[#57534e] leading-relaxed">
                Deterministic scoring of drought, waterlogging, canopy heat stress, and price volatility risks to support preventive contingency planning and PMFBY enrollment.
              </p>
            </div>

            <div className="card">
              <div className="w-9 h-9 bg-[#f4f2eb] rounded border border-[#e2ddd4] flex items-center justify-center text-[#1b4332] mb-3">
                <BarChart3 size={18} />
              </div>
              <h3 className="text-base font-serif font-bold text-[#1c1917] mb-1.5">
                Cultivation Economics & MSP
              </h3>
              <p className="text-xs text-[#57534e] leading-relaxed">
                Itemized C2 cost of cultivation tracking against official Commission for Agricultural Costs & Prices (CACP) Minimum Support Prices, with break-even yield and price thresholds.
              </p>
            </div>

            <div className="card">
              <div className="w-9 h-9 bg-[#f4f2eb] rounded border border-[#e2ddd4] flex items-center justify-center text-[#1b4332] mb-3">
                <Cloud size={18} />
              </div>
              <h3 className="text-base font-serif font-bold text-[#1c1917] mb-1.5">
                7-Day Agrometeorological Data
              </h3>
              <p className="text-xs text-[#57534e] leading-relaxed">
                District-level precipitation forecasts, temperature bounds, and humidity observations paired with stage-specific agricultural advisories for Kharif and Rabi cycles.
              </p>
            </div>

            <div className="card">
              <div className="w-9 h-9 bg-[#f4f2eb] rounded border border-[#e2ddd4] flex items-center justify-center text-[#1b4332] mb-3">
                <Bug size={18} />
              </div>
              <h3 className="text-base font-serif font-bold text-[#1c1917] mb-1.5">
                Pathology & Remediation
              </h3>
              <p className="text-xs text-[#57534e] leading-relaxed">
                Symptom identification for major crop diseases with chemical treatment dosages and biological management options (Pseudomonas, Trichoderma, NSKE).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Structured Technical Specifications */}
      <section className="py-16 px-6 border-b border-[#e2ddd4]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-serif font-bold text-[#1c1917] mb-6">
            Data Provenance and Modeling Standards
          </h2>

          <div className="border border-[#e2ddd4] bg-white rounded overflow-hidden">
            <div className="divide-y divide-[#e2ddd4] text-xs">
              <div className="grid grid-cols-3 p-3.5 bg-[#f4f2eb] font-semibold text-[#1c1917]">
                <span>Component</span>
                <span>Underlying Source / Standard</span>
                <span>Verification Method</span>
              </div>
              <div className="grid grid-cols-3 p-3.5">
                <span className="font-medium text-[#1c1917]">Yield Models</span>
                <span className="text-[#57534e]">DESAgri / Directorate of Economics & Statistics</span>
                <span className="text-[#57534e]">Cross-validated holdout test sets</span>
              </div>
              <div className="grid grid-cols-3 p-3.5">
                <span className="font-medium text-[#1c1917]">Fertilizer Calibrations</span>
                <span className="text-[#57534e]">ICAR STCR (Soil Test Crop Response)</span>
                <span className="text-[#57534e]">Standard chemical equations per crop</span>
              </div>
              <div className="grid grid-cols-3 p-3.5">
                <span className="font-medium text-[#1c1917]">Market Rates</span>
                <span className="text-[#57534e]">Agmarknet / APMC mandi bulletins</span>
                <span className="text-[#57534e]">Official CACP MSP benchmarks (2024-25)</span>
              </div>
              <div className="grid grid-cols-3 p-3.5">
                <span className="font-medium text-[#1c1917]">Disease Management</span>
                <span className="text-[#57534e]">State Agricultural Universities (SAUs) package of practices</span>
                <span className="text-[#57534e]">Validated active ingredient formulations</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#57534e]">
          <div className="flex items-center gap-2">
            <Leaf size={14} className="text-[#1b4332]" />
            <span>AgriPredict — Agricultural Decision Support System</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/features" className="hover:text-[#1c1917]">Features</Link>
            <Link to="/about" className="hover:text-[#1c1917]">About</Link>
            <Link to="/contact" className="hover:text-[#1c1917]">Contact</Link>
            <Link to="/login" className="hover:text-[#1c1917]">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
