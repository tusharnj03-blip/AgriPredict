import React from 'react'
import { Link } from 'react-router-dom'
import { Leaf, Home, ArrowRight } from 'lucide-react'

export default function NotFound() {
  const quickLinks = [
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'Yield Prediction', to: '/yield-prediction' },
    { label: 'Risk Analysis', to: '/risk-analysis' },
    { label: 'My Farms', to: '/farms' },
  ]

  return (
    <div className="min-h-screen bg-[#F7F8F4] flex flex-col items-center justify-center px-6 text-center">
      {/* Logo */}
      <Link to="/" className="inline-flex items-center gap-2 mb-12">
        <div className="w-8 h-8 bg-[#183D2B] rounded flex items-center justify-center">
          <Leaf size={16} className="text-white" />
        </div>
        <span className="font-semibold text-[#202923] text-sm tracking-tight">AgriPredict AI</span>
      </Link>

      {/* 404 Block */}
      <div className="max-w-md">
        <div className="text-[96px] font-bold text-[#E5E9E3] leading-none mb-4 select-none tabular-nums">
          404
        </div>
        <h1 className="text-2xl font-semibold text-[#202923] mb-3 tracking-tight">
          Page not found
        </h1>
        <p className="text-[#69766E] text-sm mb-8 leading-relaxed">
          The page you are looking for doesn't exist, has been moved, or requires authentication.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#183D2B] text-white text-sm font-medium rounded-lg hover:bg-[#10291F] transition-colors"
          >
            <Home size={15} />
            Go to Dashboard
          </Link>
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-[#202923] text-sm font-medium rounded-lg border border-[#E5E9E3] hover:bg-[#F7F8F4] transition-colors"
          >
            <Leaf size={15} />
            Back to Home
          </Link>
        </div>

        {/* Quick Links */}
        <div className="bg-white border border-[#E5E9E3] rounded-lg p-5 text-left">
          <p className="text-xs font-semibold text-[#69766E] uppercase tracking-wide mb-3">
            Quick Navigation
          </p>
          <div className="space-y-1">
            {quickLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="flex items-center justify-between px-3 py-2 rounded-md text-sm text-[#202923] hover:bg-[#F7F8F4] group transition-colors"
              >
                <span>{l.label}</span>
                <ArrowRight
                  size={14}
                  className="text-[#A8B9A5] group-hover:text-[#183D2B] transition-colors"
                />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
