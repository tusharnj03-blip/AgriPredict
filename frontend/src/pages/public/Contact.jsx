import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { PublicNav } from './About'

export default function Contact() {
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', message: '' })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (form.name && form.email) {
      setSent(true)
    }
  }

  return (
    <div className="min-h-screen bg-[#fbfaf8] text-[#292524]">
      <PublicNav />

      <div className="pt-28 pb-20 px-6 max-w-xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-xs font-semibold text-[#57534e] hover:text-[#1c1917] mb-8">
          <ArrowLeft size={14} /> Return to Overview
        </Link>

        <h1 className="text-3xl font-serif font-bold text-[#1c1917] mb-2">Technical Inquiries & Feedback</h1>
        <p className="text-xs text-[#57534e] mb-8">
          Submit queries regarding agronomic modeling calculations, API data integrations, or academic feedback.
        </p>

        {sent ? (
          <div className="card text-center py-10">
            <div className="w-10 h-10 bg-[#e3eee6] rounded border border-[#c7ddce] flex items-center justify-center text-[#1b4332] mx-auto mb-3">
              <CheckCircle2 size={20} />
            </div>
            <h2 className="text-xl font-serif font-bold text-[#1c1917] mb-1">Inquiry Recorded</h2>
            <p className="text-xs text-[#57534e]">Thank you. Your feedback has been submitted to the project administrator.</p>
          </div>
        ) : (
          <div className="card">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Full Name</label>
                <input
                  className="input-field"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div>
                <label className="label">Institutional / Farm Email</label>
                <input
                  className="input-field"
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="name@domain.edu or name@example.com"
                  required
                />
              </div>

              <div>
                <label className="label">Message / Research Query</label>
                <textarea
                  className="input-field"
                  rows={4}
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  placeholder="Describe your inquiry or data verification request..."
                  required
                />
              </div>

              <button type="submit" className="btn-primary w-full justify-center py-2.5">
                Submit Inquiry
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
