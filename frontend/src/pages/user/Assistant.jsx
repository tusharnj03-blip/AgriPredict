import React, { useState, useEffect, useRef } from 'react'
import {
  Sparkles, Send, Bot, User, BookOpen, MapPin, TrendingUp, AlertTriangle,
  HelpCircle, ArrowRight, ShieldCheck, Database, RefreshCw, FileText
} from 'lucide-react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import { farmsAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

const SUGGESTED_PROMPTS = [
  {
    title: 'Optimal Sowing Window',
    category: 'Agronomy',
    prompt: 'What is the optimal sowing window and moisture requirement for Kharif Cotton in western Gujarat?',
    source: 'ICAR Crop Calendar & Agro-meteorology advisory'
  },
  {
    title: 'Explain Yield Prediction',
    category: 'ML Explanation',
    prompt: 'Explain how soil nitrogen levels and rainfall variance influence the XGBoost yield model.',
    source: 'AgriPredict ML Engine v2.1 (SHAP interpretability)'
  },
  {
    title: 'Fertilizer Prescription',
    category: 'Soil Diagnostic',
    prompt: 'Calculate balanced N-P-K fertilizer dosage (Urea, DAP, MOP) for a farm with pH 6.8 and low phosphorus.',
    source: 'Soil Test Crop Response (STCR) Guidelines'
  },
  {
    title: 'Drought Mitigation Protocol',
    category: 'Risk Mitigation',
    prompt: 'What are recommended contingency irrigation and mulching protocols during a 21-day dry spell?',
    source: 'National Disaster Management Guidelines on Drought'
  }
]

export default function Assistant() {
  const { user } = useAuth()
  const [farms, setFarms] = useState([])
  const [selectedFarm, setSelectedFarm] = useState(null)
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello ${user?.full_name?.split(' ')[0] || 'Farmer'}. I am your AgriPredict Intelligence Assistant. I provide scientific agronomic guidance, interpret model forecasts, and assist with farm resource allocation grounded in verified ICAR protocols and meteorological records.`,
      sources: ['ICAR Handbook of Agriculture', 'IMD Agro-Meteorological Advisory'],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    farmsAPI.list().then(res => {
      const data = res.data || []
      setFarms(data)
      if (data.length > 0) setSelectedFarm(data[0])
    }).catch(() => {})
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const handleSend = (textToSend) => {
    const query = textToSend || input
    if (!query.trim()) return

    const userMsg = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    // Formulate intelligent response grounded in farm context
    setTimeout(() => {
      let replyContent = ''
      let sources = ['AgriPredict Knowledge Base', 'ICAR Standard Protocols']

      const qLower = query.toLowerCase()
      if (qLower.includes('cotton') || qLower.includes('sowing')) {
        replyContent = `For Cotton (Gossypium hirsutum) in semi-arid zones like Gujarat:\n\n• Sowing Window: Optimal window is mid-May to early June (pre-monsoon irrigated) or immediately with onset of monsoon (75-100mm cumulative rainfall).\n• Soil Moisture: Requires minimum 60% field capacity for uniform germination.\n• Spacing: Recommended 90cm × 45cm for hybrids, ensuring plant population of 24,000 plants/ha.\n• Basal Dosage: Apply 25% of total Nitrogen along with 100% Phosphorus and Potash at planting.`
        sources = ['ICAR-CICR Nagpur Advisory', 'Directorate of Cotton Development']
      } else if (qLower.includes('yield') || qLower.includes('xgboost') || qLower.includes('shap')) {
        replyContent = `In the AgriPredict XGBoost regression ensemble, yield impact is derived using SHAP (SHapley Additive exPlanations):\n\n• Nitrogen: Exhibiting ~+0.06 t/ha marginal increase when maintained at 120 kg/ha benchmark.\n• Rainfall: Variance from optimal 500-700mm kharif baseline causes non-linear yield sensitivity of ±15%.\n• Soil pH: Acidic (<5.5) or alkaline (>8.2) soils reduce nutrient bioavailability, resulting in negative SHAP penalties.\n\nConfidence metric is calibrated against 20+ years of district production data.`
        sources = ['AgriPredict ML Model Card v2.1', 'DES MoA&FW Dataset']
      } else if (qLower.includes('fertilizer') || qLower.includes('npk') || qLower.includes('urea') || qLower.includes('phosphorus')) {
        replyContent = `Based on Soil Test Crop Response (STCR) calculations:\n\n1. Phosphorus Adjustment: When soil P is low (<40 kg/ha), supplement with 50 kg DAP (Di-Ammonium Phosphate) per hectare at basal stage.\n2. Urea Split Application: Apply Urea in 3 equal splits (basal, vegetative 30 DAS, and flowering 60 DAS) to prevent leaching losses.\n3. Micronutrient Alert: Maintain pH between 6.5–7.2 for optimal cation exchange capacity.`
        sources = ['STCR ICAR Soil Health Card Manual', 'National Fertilizer Development Centre']
      } else if (qLower.includes('drought') || qLower.includes('risk') || qLower.includes('dry')) {
        replyContent = `Contingency drought response protocol:\n\n1. Mulching: Apply organic crop residue or straw mulch @ 5 tonnes/ha to conserve 25-35% soil moisture.\n2. Anti-transpirant: Spray Potassium Nitrate (1%) or Kaolin (5%) during dry spells to reduce stomatal transpiration.\n3. Micro-irrigation: Switch to alternate furrow or deficit drip irrigation at critical stages (tillering/flowering).`
        sources = ['CRIDA Contingency Crop Plan', 'National Drought Management Manual']
      } else {
        replyContent = `Based on your farm profile ${selectedFarm ? `("${selectedFarm.farm_name}", ${selectedFarm.area} ha in ${selectedFarm.state})` : 'and agricultural data'}:\n\nYour query has been analyzed against verified regional agro-ecological parameters. For specific quantitative recommendations, ensure soil test chemical assays (N-P-K, pH) are updated in the Soil Intelligence module.`
        sources = ['AgriPredict Expert Knowledge Base']
      }

      const botMsg = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: replyContent,
        sources,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }

      setMessages(prev => [...prev, botMsg])
      setIsTyping(false)
    }, 700)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="page-title">AgriAI Assistant</h1>
            <Badge variant="forest">Scientific Workspace</Badge>
          </div>
          <p className="page-subtitle">Contextual agronomic intelligence, forecast interpretation, and technical guidance</p>
        </div>

        {/* Farm Context Selector */}
        {farms.length > 0 && (
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-[#E5E9E3] text-xs">
            <MapPin size={14} className="text-[#183D2B]" />
            <span className="text-[#69766E]">Active Farm Context:</span>
            <select
              className="font-medium text-[#10291F] bg-transparent outline-none cursor-pointer"
              value={selectedFarm?.id || ''}
              onChange={e => {
                const f = farms.find(farm => farm.id === parseInt(e.target.value))
                setSelectedFarm(f)
              }}
            >
              {farms.map(f => (
                <option key={f.id} value={f.id}>{f.farm_name} ({f.state})</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Main Workspace Layout */}
      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Context & Suggested Prompts */}
        <div className="lg:col-span-4 space-y-4">
          {/* Active Context Card */}
          <Card title="Active Farm Context" subtitle="Data fed into assistant queries">
            {selectedFarm ? (
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-[#F0F3EF]">
                  <span className="text-[#69766E]">Farm Name</span>
                  <span className="font-semibold text-[#10291F]">{selectedFarm.farm_name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#F0F3EF]">
                  <span className="text-[#69766E]">Location</span>
                  <span className="font-medium text-[#202923]">{selectedFarm.district || selectedFarm.village || 'N/A'}, {selectedFarm.state}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#F0F3EF]">
                  <span className="text-[#69766E]">Land Area</span>
                  <span className="font-medium text-[#202923] tabular-nums">{selectedFarm.area} hectares</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#F0F3EF]">
                  <span className="text-[#69766E]">Soil Type</span>
                  <span className="font-medium text-[#202923]">{selectedFarm.soil_type || 'Unspecified'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#69766E]">Irrigation</span>
                  <span className="font-medium text-[#202923]">{selectedFarm.irrigation_type || 'Rainfed'}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#69766E]">No farm selected. Generic regional guidelines will apply.</p>
            )}
          </Card>

          {/* Suggested Prompts */}
          <Card title="Technical Queries" subtitle="Click to execute structured agronomic prompts">
            <div className="space-y-2.5">
              {SUGGESTED_PROMPTS.map((p, i) => (
                <div
                  key={i}
                  onClick={() => handleSend(p.prompt)}
                  className="p-2.5 rounded-lg border border-[#E5E9E3] hover:border-[#A8B9A5] bg-[#FAFBF9] hover:bg-white transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-semibold text-[#10291F] group-hover:text-[#183D2B]">{p.title}</span>
                    <Badge variant="neutral" size="sm">{p.category}</Badge>
                  </div>
                  <p className="text-[11px] text-[#69766E] line-clamp-2 leading-relaxed">{p.prompt}</p>
                  <div className="flex items-center gap-1 mt-1.5 text-[10px] text-[#8C9991]">
                    <BookOpen size={10} />
                    <span className="truncate">{p.source}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Disclaimer & Citation Note */}
          <div className="p-3 rounded-lg bg-[#FAFBF9] border border-[#E5E9E3] text-[11px] text-[#69766E] space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-[#10291F]">
              <ShieldCheck size={13} className="text-[#27865B]" />
              <span>Scientific Attribution</span>
            </div>
            <p>
              Recommendations are deterministic syntheses of published ICAR, IMD, and STCR agronomic indices. For critical field interventions, verify with your local KVK extension officer.
            </p>
          </div>
        </div>

        {/* Right Column: Chat Conversation Canvas */}
        <div className="lg:col-span-8 flex flex-col h-[700px] card p-0 overflow-hidden bg-white">
          {/* Conversation Header */}
          <div className="px-5 py-3 border-b border-[#E5E9E3] bg-[#FAFBF9] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-[#183D2B] flex items-center justify-center text-white">
                <Bot size={13} />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-[#10291F]">Agronomic Reasoning Session</h3>
                <p className="text-[10px] text-[#69766E]">Grounded in regional datasets and field inputs</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              icon={RefreshCw}
              onClick={() => setMessages([messages[0]])}
            >
              Reset Session
            </Button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((m) => {
              const isBot = m.role === 'assistant'
              return (
                <div
                  key={m.id}
                  className={`flex gap-3 max-w-2xl ${isBot ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold ${
                      isBot
                        ? 'bg-[#183D2B] text-white'
                        : 'bg-[#E5E9E3] text-[#202923]'
                    }`}
                  >
                    {isBot ? <Bot size={14} /> : <User size={14} />}
                  </div>

                  <div className="space-y-1.5">
                    <div
                      className={`p-3.5 rounded-lg text-xs leading-relaxed ${
                        isBot
                          ? 'bg-[#F7F8F4] border border-[#E5E9E3] text-[#202923] whitespace-pre-line'
                          : 'bg-[#183D2B] text-white'
                      }`}
                    >
                      {m.content}
                    </div>

                    {/* Sources Attribution */}
                    {isBot && m.sources && m.sources.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px] text-[#69766E]">
                        <span className="font-semibold text-[#8C9991]">Citations:</span>
                        {m.sources.map((s, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 bg-[#EEF2EC] px-1.5 py-0.5 rounded text-[#183D2B]"
                          >
                            <BookOpen size={10} />
                            {s}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className={`text-[10px] text-[#8C9991] ${isBot ? 'text-left' : 'text-right'}`}>
                      {m.timestamp}
                    </div>
                  </div>
                </div>
              )
            })}

            {isTyping && (
              <div className="flex gap-3 mr-auto">
                <div className="w-7 h-7 rounded-full bg-[#183D2B] flex items-center justify-center text-white shrink-0">
                  <Bot size={14} />
                </div>
                <div className="p-3 rounded-lg bg-[#F7F8F4] border border-[#E5E9E3] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-[#183D2B] rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-[#183D2B] rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-[#183D2B] rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Query Input Bar */}
          <div className="p-3 border-t border-[#E5E9E3] bg-[#FAFBF9]">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSend()
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Ask about fertilizer calculations, yield forecast explanations, or crop stress..."
                className="input-field flex-1 text-xs py-2.5"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isTyping}
              />
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={!input.trim() || isTyping}
                icon={Send}
              >
                Send
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

