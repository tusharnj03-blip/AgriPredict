import React from 'react'
import { Link } from 'react-router-dom'
import { Leaf, ArrowLeft, Database, BookOpen, Layers } from 'lucide-react'

export function PublicNav() {
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

export default function About() {
  return (
    <div className="min-h-screen bg-[#fbfaf8] text-[#292524]">
      <PublicNav />

      <div className="pt-28 pb-20 px-6 max-w-4xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-xs font-semibold text-[#57534e] hover:text-[#1c1917] mb-8">
          <ArrowLeft size={14} /> Return to Overview
        </Link>

        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#1c1917] mb-4">
          System Architecture and Academic Context
        </h1>

        <p className="text-base text-[#57534e] mb-10 leading-relaxed">
          AgriPredict is an agricultural decision support software developed as an MCA Data Science capstone project. The platform integrates empirical agronomy, machine learning regression, and open agrometeorological databases to support farm-level decision making.
        </p>

        <div className="space-y-6">
          <div className="card">
            <h2 className="text-lg font-serif font-bold text-[#1c1917] mb-2 flex items-center gap-2">
              <BookOpen size={18} className="text-[#1b4332]" /> Project Objectives
            </h2>
            <p className="text-sm text-[#57534e] leading-relaxed mb-3">
              The primary purpose of this project is to evaluate the feasibility of deploying open machine learning algorithms (specifically gradient boosted decision trees and random forest ensembles) alongside codified agronomic equations (such as ICAR Soil Test Crop Response calibrations) in a cohesive, accessible web interface.
            </p>
            <p className="text-sm text-[#57534e] leading-relaxed">
              No commercial claims or proprietary farmer counters are represented. All calculations are executed directly by the integrated Python FastAPI backend and verified against published university extensions.
            </p>
          </div>

          <div className="card">
            <h2 className="text-lg font-serif font-bold text-[#1c1917] mb-3 flex items-center gap-2">
              <Database size={18} className="text-[#1b4332]" /> Technology Stack & Libraries
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              {[
                { name: 'FastAPI (Python)', role: 'RESTful API & async runtime' },
                { name: 'XGBoost & Scikit-learn', role: 'Yield regression modeling' },
                { name: 'SHAP (TreeExplainer)', role: 'Feature attribution values' },
                { name: 'SQLAlchemy & SQLite', role: 'Relational data persistence' },
                { name: 'React 18 & Vite', role: 'Single page application frontend' },
                { name: 'Recharts', role: 'SVG data visualization charts' },
              ].map(t => (
                <div key={t.name} className="p-3 bg-[#f4f2eb] border border-[#e2ddd4] rounded">
                  <div className="font-semibold text-[#1c1917]">{t.name}</div>
                  <div className="text-[11px] text-[#57534e] mt-0.5">{t.role}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-serif font-bold text-[#1c1917] mb-2 flex items-center gap-2">
              <Layers size={18} className="text-[#1b4332]" /> Data Citation & Integrity
            </h2>
            <p className="text-sm text-[#57534e] leading-relaxed">
              Crop yield models are based on historical district-level datasets published by the Directorate of Economics and Statistics, Department of Agriculture & Farmers Welfare (DESAgri). Benchmark commodity pricing references the 2024–25 Minimum Support Price schedule mandated by the Commission for Agricultural Costs and Prices (CACP).
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
