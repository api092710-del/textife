'use client'
import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { useAuth, apiFetch } from '@/hooks/useAuth'
import { Bot, Plus, Trash2, MessageSquare, Wifi, WifiOff, X, Check, Play, Zap, Crown, Sparkles, Clock, TrendingUp, Shield, Star, ArrowRight, Settings2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import Link from 'next/link'

const LIMITS: Record<string, number> = { FREE: 1, PRO: 3, BUSINESS: Infinity }

const BOT_FEATURES = [
  { icon: '⚡', title: 'Instant Replies', desc: 'Respond to customers in < 2 seconds, 24/7' },
  { icon: '🎭', title: 'Custom Persona', desc: 'Train your bot to sound exactly like your brand' },
  { icon: '💰', title: 'Sales Automation', desc: 'Qualify leads and close deals while you sleep' },
  { icon: '📊', title: 'Smart Analytics', desc: 'Track conversations, leads, and conversions' },
]

const PERSONAS = [
  { value: 'friendly',     label: '😊 Friendly',      desc: 'Warm, casual, approachable',   color: 'border-green-300 bg-green-50' },
  { value: 'professional', label: '👔 Professional',   desc: 'Formal, precise, trustworthy',  color: 'border-blue-300 bg-blue-50' },
  { value: 'sales',        label: '💰 Sales-Focused',  desc: 'Persuasive, drives action',     color: 'border-amber-300 bg-amber-50' },
  { value: 'support',      label: '🛠️ Support Expert', desc: 'Patient, problem-solving',      color: 'border-purple-300 bg-purple-50' },
]

export default function BotsPage() {
  const { user, loading, logout } = useAuth()
  const [bots, setBots]           = useState<any[]>([])
  const [busy, setBusy]           = useState(false)
  const [modal, setModal]         = useState(false)
  const [previewBot, setPreviewBot] = useState<any>(null)
  const [previewMsg, setPreviewMsg] = useState('')
  const [previewReply, setPreviewReply] = useState('')
  const [previewing, setPreviewing]   = useState(false)
  const [newName, setNewName]     = useState('')
  const [newPhone, setNewPhone]   = useState('')
  const [newPersona, setNewPersona] = useState('friendly')

  const fetchBots = async () => {
    try { const d = await apiFetch('/api/bots'); setBots(d.bots) } catch {}
  }
  useEffect(() => { if (user) fetchBots() }, [user])

  const create = async () => {
    if (!newName.trim()) { toast.error('Bot name required'); return }
    setBusy(true)
    try {
      await apiFetch('/api/bots', { method: 'POST', body: JSON.stringify({ name: newName, phoneNumber: newPhone, config: JSON.stringify({ persona: newPersona }) }) })
      toast.success('Bot created! 🤖 Time to dominate! 🚀')
      setModal(false); setNewName(''); setNewPhone(''); setNewPersona('friendly')
      fetchBots()
    } catch (e: any) { toast.error(e.message) }
    finally { setBusy(false) }
  }

  const toggle = async (bot: any) => {
    const next = bot.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    try {
      await apiFetch(`/api/bots/${bot.id}`, { method: 'PATCH', body: JSON.stringify({ status: next }) })
      setBots(bs => bs.map(b => b.id === bot.id ? { ...b, status: next } : b))
      toast.success(next === 'ACTIVE' ? '✅ Bot activated — it\'s live!' : '⏸️ Bot paused')
    } catch (e: any) { toast.error(e.message) }
  }

  const del = async (id: string) => {
    if (!confirm('Delete this bot permanently?')) return
    try {
      await apiFetch(`/api/bots/${id}`, { method: 'DELETE' })
      setBots(bs => bs.filter(b => b.id !== id))
      toast.success('Bot deleted')
    } catch (e: any) { toast.error(e.message) }
  }

  const previewResponse = async () => {
    if (!previewMsg.trim()) return
    setPreviewing(true); setPreviewReply('')
    try {
      const res = await apiFetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: `You are "${previewBot?.name}", a WhatsApp business bot with ${previewBot?.config ? JSON.parse(previewBot.config).persona : 'friendly'} personality. A customer just sent: "${previewMsg}". Reply naturally and helpfully in 1-3 sentences.`,
          sessionId: 'preview-' + previewBot?.id
        })
      })
      setPreviewReply(res.reply || res.message || 'No response')
    } catch { setPreviewReply('Preview unavailable. Check your API configuration.') }
    finally { setPreviewing(false) }
  }

  if (loading || !user) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-cyan-50">
      <div className="text-center">
        <div className="spinner w-10 h-10 mx-auto mb-3 border-teal-600" />
        <p className="text-teal-600 font-medium animate-pulse">Loading your bots...</p>
      </div>
    </div>
  )

  const limit = LIMITS[user.plan] ?? 1
  const isPro = user.plan === 'PRO' || user.plan === 'BUSINESS'
  const canCreate = bots.length < (limit === Infinity ? 999 : limit)

  return (
    <DashboardLayout user={user} onLogout={logout}>
      <div className="max-w-4xl space-y-6 pb-10">

        {/* Hero Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl p-6 text-white"
          style={{ background: 'linear-gradient(135deg, #0d9488 0%, #0891b2 50%, #7c3aed 100%)' }}>
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
          <div className="relative flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Bot className="w-8 h-8 text-white" />
                <span className="text-teal-200 font-semibold text-sm">WhatsApp AI Bots</span>
              </div>
              <h1 className="font-display font-black text-2xl sm:text-3xl mb-1.5">My AI Bots 🤖</h1>
              <p className="text-teal-100 text-sm max-w-md">
                Deploy intelligent AI assistants that handle customer conversations, qualify leads, and close sales — automatically.
              </p>
            </div>
            <div className="flex flex-col gap-2 items-end">
              <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2 text-center">
                <p className="font-black text-2xl">{bots.length}/{limit === Infinity ? '∞' : limit}</p>
                <p className="text-xs text-teal-200">Bots Active</p>
              </div>
              {canCreate
                ? <button onClick={() => setModal(true)}
                    className="flex items-center gap-2 bg-white text-teal-700 rounded-xl px-4 py-2.5 text-sm font-black hover:bg-teal-50 transition-all shadow-lg">
                    <Plus className="w-4 h-4" /> Create New Bot
                  </button>
                : <Link href="/dashboard/billing"
                    className="flex items-center gap-2 bg-yellow-400 text-yellow-900 rounded-xl px-4 py-2.5 text-sm font-black hover:bg-yellow-300 transition-all">
                    <Crown className="w-4 h-4" /> Upgrade for More
                  </Link>
              }
            </div>
          </div>
        </motion.div>

        {/* Feature Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {BOT_FEATURES.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm hover:shadow-md transition-all">
              <span className="text-2xl block mb-1.5">{f.icon}</span>
              <p className="font-bold text-xs text-gray-900">{f.title}</p>
              <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Bot Cards */}
        {bots.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <div className="w-20 h-20 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Bot className="w-10 h-10 text-teal-400" />
            </div>
            <h3 className="font-display font-bold text-xl text-gray-900 mb-2">No bots yet</h3>
            <p className="text-gray-400 text-sm mb-6 max-w-xs mx-auto">Create your first AI bot and start automating customer conversations today</p>
            {canCreate && (
              <button onClick={() => setModal(true)}
                className="inline-flex items-center gap-2 py-3 px-6 rounded-xl text-white font-bold transition-all"
                style={{ background: 'linear-gradient(135deg, #0d9488, #7c3aed)', boxShadow: '0 8px 20px rgba(13,148,136,0.3)' }}>
                <Plus className="w-5 h-5" /> Create Your First Bot
              </button>
            )}
          </motion.div>
        ) : (
          <div className="space-y-4">
            <h2 className="font-display font-bold text-lg text-gray-900">Your Bots ({bots.length})</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {bots.map((bot, i) => {
                const persona = bot.config ? JSON.parse(bot.config).persona : 'friendly'
                const personaInfo = PERSONAS.find(p => p.value === persona) || PERSONAS[0]
                const isActive = bot.status === 'ACTIVE'
                return (
                  <motion.div key={bot.id} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.06 }}
                    className={`relative bg-white rounded-2xl border-2 p-5 transition-all hover:shadow-lg ${isActive ? 'border-teal-200' : 'border-gray-100'}`}>

                    {/* Status indicator */}
                    <div className={`absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                      {isActive ? 'Live' : 'Paused'}
                    </div>

                    <div className="flex items-start gap-4 mb-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 ${isActive ? 'bg-teal-50' : 'bg-gray-50'}`}>
                        🤖
                      </div>
                      <div className="flex-1 min-w-0 pr-16">
                        <h3 className="font-display font-bold text-gray-900 truncate">{bot.name}</h3>
                        <p className="text-xs text-gray-400 mt-0.5">{personaInfo.label} · {bot.phoneNumber || 'No number set'}</p>
                        <div className={`inline-flex items-center gap-1 mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full border ${personaInfo.color}`}>
                          <Star className="w-2.5 h-2.5" />
                          {personaInfo.desc}
                        </div>
                      </div>
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {[
                        { label: 'Replies', val: bot._count?.replies ?? '—', icon: MessageSquare },
                        { label: 'Uptime',  val: isActive ? '100%' : '0%', icon: Clock },
                        { label: 'Leads',   val: bot._count?.leads ?? '—', icon: TrendingUp },
                      ].map(s => (
                        <div key={s.label} className="bg-gray-50 rounded-xl p-2.5 text-center">
                          <p className="font-black text-base text-gray-900">{s.val}</p>
                          <p className="text-[9px] text-gray-400 uppercase tracking-wide">{s.label}</p>
                        </div>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button onClick={() => { setPreviewBot(bot); setPreviewMsg(''); setPreviewReply('') }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-bold hover:bg-indigo-600 hover:text-white transition-all">
                        <Play className="w-3.5 h-3.5" /> Test Bot
                      </button>
                      <button onClick={() => toggle(bot)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${isActive ? 'bg-orange-50 text-orange-600 hover:bg-orange-500 hover:text-white' : 'bg-green-50 text-green-700 hover:bg-green-500 hover:text-white'}`}>
                        {isActive ? <><WifiOff className="w-3.5 h-3.5" /> Pause</> : <><Wifi className="w-3.5 h-3.5" /> Activate</>}
                      </button>
                      <button onClick={() => del(bot.id)}
                        className="p-2 rounded-xl bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        )}

        {/* Upgrade CTA for Free users */}
        {!isPro && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="relative overflow-hidden rounded-2xl p-6 text-white"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
            <div className="flex items-start gap-4 flex-wrap">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Crown className="w-6 h-6 text-yellow-300" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-black text-lg mb-1">Unlock More Bots & Advanced Features</h3>
                <p className="text-purple-200 text-sm mb-3">Pro: 3 bots + priority AI · Business: Unlimited bots + white-label</p>
                <div className="flex flex-wrap gap-2">
                  {['3 concurrent bots', 'Priority AI responses', 'Custom bot personality', 'Advanced analytics', 'Lead capture automation'].map(f => (
                    <span key={f} className="bg-white/15 rounded-lg px-2.5 py-1 text-xs font-semibold">{f}</span>
                  ))}
                </div>
              </div>
              <Link href="/dashboard/billing"
                className="flex items-center gap-2 bg-yellow-400 text-yellow-900 rounded-xl px-5 py-3 font-black text-sm hover:bg-yellow-300 transition-all shadow-lg flex-shrink-0">
                Upgrade Now <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        )}

        {/* Create Bot Modal */}
        <AnimatePresence>
          {modal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
              <motion.div initial={{ y: 60, scale: 0.97 }} animate={{ y: 0, scale: 1 }} exit={{ y: 60, scale: 0.97 }}
                className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="font-display font-black text-xl text-gray-900">Create New Bot 🤖</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Your AI assistant, ready in 30 seconds</p>
                  </div>
                  <button onClick={() => setModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-all">
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Bot Name *</label>
                    <input className="input-field" placeholder="e.g. Sales Assistant, Shop Helper..." value={newName} onChange={e => setNewName(e.target.value)} autoFocus />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">WhatsApp Number <span className="text-gray-400 font-normal">(optional)</span></label>
                    <input className="input-field" placeholder="+971 50 000 0000" value={newPhone} onChange={e => setNewPhone(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2.5">Bot Personality</label>
                    <div className="grid grid-cols-2 gap-2">
                      {PERSONAS.map(p => (
                        <button key={p.value} onClick={() => setNewPersona(p.value)}
                          className={`p-3.5 rounded-xl border-2 text-left transition-all hover:shadow-sm ${newPersona === p.value ? `${p.color} shadow-sm` : 'border-gray-100 hover:border-gray-200'}`}>
                          <p className="text-sm font-bold text-gray-900">{p.label}</p>
                          <p className="text-[11px] text-gray-500 mt-0.5">{p.desc}</p>
                          {newPersona === p.value && <Check className="w-3.5 h-3.5 text-teal-600 mt-1.5" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
                  <button onClick={create} disabled={busy}
                    className="flex-1 py-3 rounded-xl text-white font-black text-sm flex items-center justify-center gap-2 transition-all"
                    style={{ background: 'linear-gradient(135deg, #0d9488, #7c3aed)', boxShadow: '0 6px 20px rgba(13,148,136,0.35)' }}>
                    {busy ? <><span className="spinner border-white" /> Creating...</> : <><Zap className="w-4 h-4" /> Create Bot</>}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Preview Modal */}
        <AnimatePresence>
          {previewBot && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
              <motion.div initial={{ y: 60, scale: 0.97 }} animate={{ y: 0, scale: 1 }} exit={{ y: 60 }}
                className="bg-white rounded-2xl p-0 w-full max-w-sm shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center gap-3 p-4 border-b border-gray-100" style={{ background: 'linear-gradient(135deg, #075e54, #128c7e)' }}>
                  <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center text-xl">🤖</div>
                  <div className="flex-1">
                    <p className="font-bold text-white text-sm">{previewBot.name}</p>
                    <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" /><p className="text-[10px] text-green-200">online · AI-powered</p></div>
                  </div>
                  <button onClick={() => setPreviewBot(null)} className="p-1.5 hover:bg-white/10 rounded-lg transition-all">
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>

                {/* Chat area */}
                <div className="bg-[#e5ddd5] p-4 min-h-40 max-h-60 overflow-y-auto space-y-3">
                  {!previewMsg && !previewReply && (
                    <p className="text-center text-xs text-gray-500 mt-8 bg-white/60 rounded-xl py-2 px-3">Type below to test how your bot replies 👇</p>
                  )}
                  {previewMsg && (
                    <div className="flex justify-end">
                      <div className="bg-[#dcf8c6] rounded-xl rounded-tr-sm px-3 py-2 max-w-[80%] shadow-sm">
                        <p className="text-sm text-gray-800">{previewMsg}</p>
                        <p className="text-[9px] text-gray-400 text-right mt-1">You</p>
                      </div>
                    </div>
                  )}
                  {previewing && (
                    <div className="flex justify-start">
                      <div className="bg-white rounded-xl rounded-tl-sm px-3 py-2 shadow-sm">
                        <div className="flex gap-1 items-center">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}
                  {previewReply && !previewing && (
                    <div className="flex justify-start">
                      <div className="bg-white rounded-xl rounded-tl-sm px-3 py-2 max-w-[80%] shadow-sm">
                        <p className="text-[9px] text-teal-600 font-bold mb-1 flex items-center gap-1"><Zap className="w-2.5 h-2.5" />{previewBot.name}</p>
                        <p className="text-sm text-gray-800">{previewReply}</p>
                        <p className="text-[9px] text-gray-400 mt-1">AI</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input */}
                <div className="flex gap-2 p-3 bg-white border-t border-gray-100">
                  <input className="input-field flex-1 py-2.5 text-sm" placeholder="Type a customer message..."
                    value={previewMsg}
                    onChange={e => { setPreviewMsg(e.target.value); setPreviewReply('') }}
                    onKeyDown={e => e.key === 'Enter' && previewResponse()} />
                  <button onClick={previewResponse} disabled={previewing || !previewMsg.trim()}
                    className="p-2.5 rounded-xl text-white flex-shrink-0 transition-all disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, #0d9488, #128c7e)' }}>
                    {previewing ? <span className="spinner border-white w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  )
}
