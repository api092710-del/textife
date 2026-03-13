'use client'
import { useState } from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { useAuth, apiFetch } from '@/hooks/useAuth'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Sparkles, Copy, RefreshCw, Check, Send } from 'lucide-react'
import toast from 'react-hot-toast'

const TYPES = [
  { id: 'sales',     label: '💰 Sales Message',   desc: 'Convert leads to buyers' },
  { id: 'reply',     label: '💬 Customer Reply',   desc: 'Handle objections' },
  { id: 'followup',  label: '🔄 Follow-Up Seq.',   desc: '3-message sequence' },
  { id: 'cold',      label: '🎯 Cold Outreach',    desc: 'First contact message' },
  { id: 'negotiate', label: '🤝 Negotiation',      desc: 'Counter offers' },
]

const TONES = ['friendly', 'professional', 'urgent', 'casual', 'assertive']

export default function SalesPage() {
  const { user, loading, logout } = useAuth()
  const [type, setType]         = useState('sales')
  const [product, setProduct]   = useState('')
  const [context, setContext]   = useState('')
  const [customerName, setCustomerName] = useState('')
  const [tone, setTone]         = useState('friendly')
  const [message, setMessage]   = useState('')
  const [generating, setGenerating] = useState(false)
  const [copied, setCopied]     = useState(false)

  const generate = async () => {
    if (!product.trim()) { toast.error('Enter your product/service first'); return }
    setGenerating(true); setMessage('')
    try {
      const res = await apiFetch('/api/ai/sales', { method: 'POST', body: JSON.stringify({ type, product, context, customerName, tone }) })
      setMessage(res.message || '')
      apiFetch('/api/ai/streak', { method: 'POST', body: JSON.stringify({ action: 'use_tool' }) })
    } catch (e: any) { toast.error(e.message) }
    finally { setGenerating(false) }
  }

  const copy = () => { navigator.clipboard.writeText(message); setCopied(true); toast.success('Copied!'); setTimeout(() => setCopied(false), 2000) }
  if (loading || !user) return <div className="min-h-screen flex items-center justify-center"><div className="spinner w-8 h-8" /></div>

  return (
    <DashboardLayout user={user} onLogout={logout}>
      <div className="max-w-4xl space-y-5">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center"><MessageCircle className="w-5 h-5 text-blue-600" /></div>
          <div>
            <h1 className="font-display font-bold text-2xl text-gray-900">AI Sales Message Generator</h1>
            <p className="text-gray-500 text-sm">Generate persuasive messages that close deals</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {TYPES.map(t => (
            <button key={t.id} onClick={() => setType(t.id)}
              className={`p-3 rounded-xl border-2 text-left transition-all ${type === t.id ? 'border-blue-400 bg-blue-50' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
              <p className="font-semibold text-xs text-gray-900">{t.label}</p>
              <p className="text-[10px] text-gray-500 mt-0.5 hidden md:block">{t.desc}</p>
            </button>
          ))}
        </div>

        <div className="card p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Product / Service *</label>
              <input className="input-field" placeholder="What are you selling?" value={product} onChange={e => setProduct(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Customer Name (optional)</label>
              <input className="input-field" placeholder="Ahmed, Sarah..." value={customerName} onChange={e => setCustomerName(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Context / Situation</label>
            <textarea className="input-field h-20 resize-none" placeholder="What's the situation? e.g. customer asked for discount, lead went cold for 2 weeks..." value={context} onChange={e => setContext(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Tone</label>
            <div className="flex gap-2 flex-wrap">
              {TONES.map(t => (
                <button key={t} onClick={() => setTone(t)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${tone === t ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button onClick={generate} disabled={generating} className="btn-primary w-full py-4 text-base" style={{ background: 'linear-gradient(135deg, #2563eb, #3b82f6)' }}>
          {generating ? <><span className="spinner" /> Crafting your message...</> : <><Send className="w-5 h-5" /> Generate Message</>}
        </button>

        <AnimatePresence>
          {message && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-bold text-gray-900">✨ Your Message</h2>
                <div className="flex gap-2">
                  <button onClick={generate} className="btn-secondary text-sm py-1.5"><RefreshCw className="w-3.5 h-3.5" /> Redo</button>
                  <button onClick={copy} className="btn-primary text-sm py-1.5">
                    {copied ? <><Check className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                  </button>
                </div>
              </div>
              {/* Message preview styled like WhatsApp */}
              <div className="bg-[#e5ddd5] rounded-xl p-4">
                <div className="bg-white rounded-xl rounded-tl-sm p-4 max-w-lg shadow-sm">
                  <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans leading-relaxed">{message}</pre>
                  <p className="text-[10px] text-gray-400 mt-2 text-right">AI Generated · {new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</p>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <button onClick={copy} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-50 text-green-700 text-sm font-semibold hover:bg-green-100 transition-all">
                  <Copy className="w-4 h-4" /> Copy for WhatsApp
                </button>
                <button onClick={() => { navigator.clipboard.writeText(message); toast.success('Ready for email!') }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-50 text-blue-700 text-sm font-semibold hover:bg-blue-100 transition-all">
                  <Send className="w-4 h-4" /> Copy for Email
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  )
}
