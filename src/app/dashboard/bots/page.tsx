'use client'
import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { useAuth, apiFetch } from '@/hooks/useAuth'
import {
  Bot, Plus, Trash2, MessageSquare, Wifi, WifiOff, X, Check, Play,
  Zap, Crown, TrendingUp, ArrowRight, ChevronDown, ChevronUp, Copy,
  Link as LinkIcon, Book, AlertTriangle, Eye, EyeOff, RefreshCw,
  CheckCircle2, Circle, Clock, Users, Activity
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import Link from 'next/link'

const LIMITS: Record<string, number> = { FREE: 1, PRO: 3, BUSINESS: Infinity }

const PERSONAS = [
  { value: 'friendly',     emoji: '😊', label: 'Friendly',      desc: 'Warm & approachable',  border: 'border-green-300',  bg: 'bg-green-50',  text: 'text-green-700' },
  { value: 'professional', emoji: '👔', label: 'Professional',  desc: 'Formal & precise',      border: 'border-blue-300',   bg: 'bg-blue-50',   text: 'text-blue-700' },
  { value: 'sales',        emoji: '💰', label: 'Sales-Focused', desc: 'Persuasive & bold',     border: 'border-amber-300',  bg: 'bg-amber-50',  text: 'text-amber-700' },
  { value: 'support',      emoji: '🛠️', label: 'Support Pro',   desc: 'Patient & helpful',     border: 'border-purple-300', bg: 'bg-purple-50', text: 'text-purple-700' },
]

// Step-by-step WhatsApp connection guide
const CONNECT_STEPS = [
  {
    step: 1, icon: '📱', title: 'Get Your Webhook URL',
    detail: 'Copy the webhook URL below and keep it ready. This is the address WhatsApp will send messages to.',
  },
  {
    step: 2, icon: '🔑', title: 'Set Up WhatsApp Business API',
    detail: 'Go to Meta for Developers → Create App → Add WhatsApp product. Choose "Business" app type.',
    link: 'https://developers.facebook.com',
    linkLabel: 'Open Meta Developers →',
  },
  {
    step: 3, icon: '⚙️', title: 'Configure Webhook in Meta',
    detail: 'In WhatsApp → Configuration → Webhook, paste your URL and the Verify Token shown below. Subscribe to "messages" events.',
  },
  {
    step: 4, icon: '📞', title: 'Add Your Phone Number',
    detail: 'In WhatsApp → Phone Numbers, add and verify your business number. Then set it in your bot settings above.',
  },
  {
    step: 5, icon: '✅', title: 'Test & Go Live',
    detail: 'Send a test message to your WhatsApp number. The bot will auto-reply. Toggle the bot to ACTIVE when ready!',
  },
]

// What the bot does — explanation cards
const BOT_ACTIONS = [
  { icon: '🧠', title: 'Reads Every Message',   desc: 'Your bot reads every incoming WhatsApp message in real-time using the Meta API webhook.' },
  { icon: '🤖', title: 'Understands with AI',    desc: 'GPT-4o-mini processes the message with your bot\'s personality and context to craft the perfect reply.' },
  { icon: '⚡', title: 'Replies Instantly',       desc: 'A response is sent back to the customer via WhatsApp API in under 2 seconds, 24/7.' },
  { icon: '📊', title: 'Logs Everything',         desc: 'All conversations, leads captured, and response analytics are saved to your dashboard.' },
]

export default function BotsPage() {
  const { user, loading, logout } = useAuth()
  const [bots, setBots]           = useState<any[]>([])
  const [busy, setBusy]           = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [previewBot, setPreviewBot] = useState<any>(null)
  const [previewMsg, setPreviewMsg] = useState('')
  const [previewReply, setPreviewReply] = useState('')
  const [previewing, setPreviewing]   = useState(false)
  const [newName, setNewName]     = useState('')
  const [newPhone, setNewPhone]   = useState('')
  const [newPersona, setNewPersona] = useState('friendly')
  const [expandedBot, setExpandedBot] = useState<string | null>(null)
  const [showGuide, setShowGuide] = useState(false)
  const [showHowItWorks, setShowHowItWorks] = useState(false)
  const [copiedWebhook, setCopiedWebhook] = useState(false)
  const [verifyToken] = useState('txf_' + Math.random().toString(36).substring(2, 12))

  const webhookUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/api/whatsapp/webhook`
    : 'https://yourapp.com/api/whatsapp/webhook'

  const fetchBots = async () => {
    try { const d = await apiFetch('/api/bots'); setBots(d.bots ?? []) } catch {}
  }
  useEffect(() => { if (user) fetchBots() }, [user])

  const copyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl)
    setCopiedWebhook(true)
    toast.success('Webhook URL copied!')
    setTimeout(() => setCopiedWebhook(false), 2500)
  }

  const create = async () => {
    if (!newName.trim()) { toast.error('Bot name is required'); return }
    setBusy(true)
    try {
      await apiFetch('/api/bots', {
        method: 'POST',
        body: JSON.stringify({ name: newName, phoneNumber: newPhone, config: JSON.stringify({ persona: newPersona }) })
      })
      toast.success('🤖 Bot created! Now connect it to WhatsApp.')
      setShowCreate(false); setNewName(''); setNewPhone(''); setNewPersona('friendly')
      fetchBots()
      setShowGuide(true)
    } catch (e: any) { toast.error(e.message) }
    finally { setBusy(false) }
  }

  const toggle = async (bot: any) => {
    const next = bot.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    try {
      await apiFetch(`/api/bots/${bot.id}`, { method: 'PATCH', body: JSON.stringify({ status: next }) })
      setBots(bs => bs.map(b => b.id === bot.id ? { ...b, status: next } : b))
      toast.success(next === 'ACTIVE' ? '✅ Bot is now live!' : '⏸️ Bot paused')
    } catch (e: any) { toast.error(e.message) }
  }

  const del = async (id: string) => {
    if (!confirm('Delete this bot permanently? This cannot be undone.')) return
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
      const persona = previewBot?.config ? JSON.parse(previewBot.config).persona : 'friendly'
      const res = await apiFetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: `You are "${previewBot?.name}", a WhatsApp business AI assistant with a ${persona} personality. A customer just messaged: "${previewMsg}". Reply helpfully in 1-3 sentences, staying in character.`,
          sessionId: 'preview-' + previewBot?.id
        })
      })
      setPreviewReply(res.reply || res.message || 'Unable to generate a reply.')
    } catch { setPreviewReply('Preview unavailable — check your API configuration.') }
    finally { setPreviewing(false) }
  }

  if (loading || !user) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-3 animate-pulse shadow-xl">
          <Bot className="w-7 h-7 text-white" />
        </div>
        <p className="text-gray-400 text-sm font-medium animate-pulse">Loading your bots...</p>
      </div>
    </div>
  )

  const limit = LIMITS[user.plan] ?? 1
  const isPro = user.plan === 'PRO' || user.plan === 'BUSINESS'
  const canCreate = bots.length < (limit === Infinity ? 999 : limit)

  return (
    <DashboardLayout user={user} onLogout={logout}>
      <div className="w-full max-w-3xl mx-auto space-y-5 pb-6">

        {/* ── HERO HEADER ── */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl p-5 text-white"
          style={{ background: 'linear-gradient(135deg, #0d9488 0%, #0891b2 45%, #7c3aed 100%)' }}>
          <div className="absolute inset-0 opacity-[0.07]"
            style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "22px 22px" }} />
          <div className="relative flex items-start justify-between gap-3 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Bot className="w-6 h-6 text-white flex-shrink-0" />
                <span className="text-teal-200 font-bold text-xs uppercase tracking-widest">WhatsApp AI Bots</span>
              </div>
              <h1 className="font-display font-black text-2xl leading-tight mb-1">My AI Bots 🤖</h1>
              <p className="text-teal-100 text-xs leading-relaxed max-w-xs">
                Auto-reply to customers 24/7, capture leads & close sales — while you sleep.
              </p>
            </div>
            <div className="flex flex-col gap-2 items-end flex-shrink-0">
              <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2 text-center">
                <p className="font-black text-xl leading-none">{bots.length}<span className="text-teal-200 text-base">/{limit === Infinity ? '∞' : limit}</span></p>
                <p className="text-[10px] text-teal-200 mt-0.5">Bots Used</p>
              </div>
              {canCreate
                ? <button onClick={() => setShowCreate(true)}
                    className="flex items-center gap-1.5 bg-white text-teal-700 rounded-xl px-3 py-2 text-xs font-black hover:bg-teal-50 active:bg-teal-100 transition-all shadow-lg">
                    <Plus className="w-3.5 h-3.5" /> New Bot
                  </button>
                : <Link href="/dashboard/billing"
                    className="flex items-center gap-1.5 bg-yellow-400 text-yellow-900 rounded-xl px-3 py-2 text-xs font-black">
                    <Crown className="w-3.5 h-3.5" /> Upgrade
                  </Link>
              }
            </div>
          </div>
        </motion.div>

        {/* ── HOW IT WORKS toggle ── */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <button onClick={() => setShowHowItWorks(v => !v)}
            className="w-full flex items-center justify-between px-5 py-4 text-left">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Book className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <p className="font-bold text-sm text-gray-900">What does the bot actually do?</p>
                <p className="text-xs text-gray-400">Understand how your AI bot works</p>
              </div>
            </div>
            {showHowItWorks ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
          </button>
          <AnimatePresence>
            {showHowItWorks && (
              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                className="overflow-hidden border-t border-gray-100">
                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {BOT_ACTIONS.map((a, i) => (
                    <motion.div key={a.title} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                      className="flex items-start gap-3 p-3.5 bg-gray-50 rounded-xl">
                      <span className="text-2xl flex-shrink-0 leading-none mt-0.5">{a.icon}</span>
                      <div>
                        <p className="font-bold text-sm text-gray-900">{a.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{a.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
                {/* Flow diagram */}
                <div className="px-5 pb-5">
                  <div className="bg-gradient-to-r from-teal-50 to-indigo-50 rounded-xl p-4 border border-teal-100">
                    <p className="text-xs font-black text-teal-800 mb-3 uppercase tracking-wider">Message Flow</p>
                    <div className="flex items-center gap-1 flex-wrap">
                      {['Customer sends WA msg 📱', '→', 'Meta sends to webhook 🔗', '→', 'AI processes it 🧠', '→', 'Bot replies in WA ✅'].map((s, i) => (
                        <span key={i} className={`text-xs font-semibold ${s === '→' ? 'text-teal-400' : 'bg-white px-2.5 py-1 rounded-lg text-teal-800 shadow-sm border border-teal-100'}`}>{s}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── CONNECTION GUIDE toggle ── */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <button onClick={() => setShowGuide(v => !v)}
            className="w-full flex items-center justify-between px-5 py-4 text-left">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <LinkIcon className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="font-bold text-sm text-gray-900">How to connect to WhatsApp</p>
                <p className="text-xs text-gray-400">Step-by-step setup guide</p>
              </div>
            </div>
            {showGuide ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
          </button>
          <AnimatePresence>
            {showGuide && (
              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                className="overflow-hidden border-t border-gray-100">
                <div className="p-5 space-y-4">
                  {/* Webhook URL */}
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Your Webhook URL</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-xs font-mono bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-700 break-all">
                        {webhookUrl}
                      </code>
                      <button onClick={copyWebhook}
                        className={`flex-shrink-0 flex items-center gap-1 text-xs font-bold px-3 py-2 rounded-lg transition-all ${copiedWebhook ? 'bg-green-500 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
                        {copiedWebhook ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                      </button>
                    </div>
                    <div className="mt-2">
                      <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-1">Verify Token</p>
                      <code className="text-xs font-mono bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-indigo-700 block">{verifyToken}</code>
                    </div>
                  </div>

                  {/* Steps */}
                  {CONNECT_STEPS.map((s, i) => (
                    <motion.div key={s.step} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                      className="flex gap-4 items-start">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-indigo-500 flex items-center justify-center text-white text-xs font-black shadow-sm">
                        {s.step}
                      </div>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <span className="text-base">{s.icon}</span>
                          <p className="font-bold text-sm text-gray-900">{s.title}</p>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed">{s.detail}</p>
                        {s.link && (
                          <a href={s.link} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 mt-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
                            {s.linkLabel} <ArrowRight className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      {i < CONNECT_STEPS.length - 1 && (
                        <div className="absolute left-[28px] top-8 w-0.5 h-6 bg-gray-200" style={{ position: 'relative', left: '-28px', top: '8px', width: '1px', height: '24px', background: 'linear-gradient(to bottom, #e5e7eb, transparent)', marginLeft: '-28px', marginBottom: '-8px' }} />
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── BOT LIST ── */}
        {bots.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-14 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Bot className="w-8 h-8 text-teal-400" />
            </div>
            <h3 className="font-display font-bold text-lg text-gray-900 mb-1">No bots yet</h3>
            <p className="text-gray-400 text-sm mb-5 max-w-xs mx-auto px-4">Create your first AI bot to start automating WhatsApp conversations</p>
            {canCreate && (
              <button onClick={() => setShowCreate(true)}
                className="inline-flex items-center gap-2 py-3 px-6 rounded-xl text-white text-sm font-bold transition-all"
                style={{ background: 'linear-gradient(135deg, #0d9488, #7c3aed)', boxShadow: '0 8px 20px rgba(13,148,136,0.3)' }}>
                <Plus className="w-4 h-4" /> Create First Bot
              </button>
            )}
          </motion.div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-base text-gray-900">Your Bots ({bots.length})</h2>
              {canCreate && (
                <button onClick={() => setShowCreate(true)}
                  className="flex items-center gap-1.5 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-2 rounded-xl transition-all">
                  <Plus className="w-3.5 h-3.5" /> New Bot
                </button>
              )}
            </div>
            {bots.map((bot, i) => {
              const persona = bot.config ? (() => { try { return JSON.parse(bot.config).persona } catch { return 'friendly' } })() : 'friendly'
              const pInfo = PERSONAS.find(p => p.value === persona) || PERSONAS[0]
              const isActive = bot.status === 'ACTIVE'
              const isExpanded = expandedBot === bot.id
              return (
                <motion.div key={bot.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                  className={`bg-white rounded-2xl border-2 overflow-hidden transition-all ${isActive ? 'border-teal-200' : 'border-gray-100'}`}>
                  {/* Bot header row */}
                  <div className="p-4">
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${isActive ? 'bg-teal-50' : 'bg-gray-50'}`}>🤖</div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-display font-bold text-sm text-gray-900 truncate max-w-[140px]">{bot.name}</span>
                          <span className={`flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full ${isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                            {isActive ? 'LIVE' : 'PAUSED'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${pInfo.bg} ${pInfo.border} ${pInfo.text}`}>{pInfo.emoji} {pInfo.label}</span>
                          <span className="text-[10px] text-gray-400">{bot.phoneNumber || 'No number'}</span>
                        </div>
                      </div>
                      {/* Expand toggle */}
                      <button onClick={() => setExpandedBot(isExpanded ? null : bot.id)}
                        className="p-2 rounded-xl bg-gray-50 text-gray-400 hover:bg-gray-100 transition-all flex-shrink-0">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Quick action buttons */}
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => { setPreviewBot(bot); setPreviewMsg(''); setPreviewReply('') }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white active:bg-indigo-700 transition-all">
                        <Play className="w-3 h-3" /> Test Bot
                      </button>
                      <button onClick={() => toggle(bot)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                          isActive
                            ? 'bg-orange-50 text-orange-600 hover:bg-orange-500 hover:text-white'
                            : 'bg-green-50 text-green-700 hover:bg-green-500 hover:text-white'
                        }`}>
                        {isActive ? <><WifiOff className="w-3 h-3" /> Pause</> : <><Wifi className="w-3 h-3" /> Activate</>}
                      </button>
                      <button onClick={() => del(bot.id)}
                        className="p-2.5 rounded-xl bg-red-50 text-red-400 hover:bg-red-500 hover:text-white active:bg-red-600 transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded stats + details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        className="border-t border-gray-100 overflow-hidden">
                        <div className="p-4 bg-gray-50 space-y-4">
                          {/* Stats */}
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { label: 'Replies',  val: bot._count?.replies ?? 0, icon: MessageSquare, color: 'text-indigo-600' },
                              { label: 'Leads',    val: bot._count?.leads   ?? 0, icon: Users,         color: 'text-green-600' },
                              { label: 'Uptime',   val: isActive ? '100%' : '0%', icon: Activity,      color: 'text-teal-600' },
                            ].map(s => (
                              <div key={s.label} className="bg-white rounded-xl p-3 text-center shadow-sm border border-gray-100">
                                <p className={`font-black text-lg leading-none ${s.color}`}>{s.val}</p>
                                <p className="text-[9px] text-gray-400 uppercase tracking-wide mt-1">{s.label}</p>
                              </div>
                            ))}
                          </div>
                          {/* Status info */}
                          <div className={`flex items-start gap-3 p-3 rounded-xl border ${isActive ? 'bg-green-50 border-green-100' : 'bg-amber-50 border-amber-100'}`}>
                            {isActive
                              ? <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                              : <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                            }
                            <div>
                              <p className={`text-xs font-bold ${isActive ? 'text-green-800' : 'text-amber-800'}`}>
                                {isActive ? 'Bot is actively replying to messages' : 'Bot is paused — not replying'}
                              </p>
                              <p className={`text-[11px] mt-0.5 ${isActive ? 'text-green-600' : 'text-amber-600'}`}>
                                {isActive
                                  ? 'All incoming WhatsApp messages are being handled by AI.'
                                  : 'Activate the bot to start auto-replying to customers.'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* ── UPGRADE CTA ── */}
        {!isPro && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl p-5 text-white"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Crown className="w-5 h-5 text-yellow-300" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-black text-base mb-1">Unlock More Bots & Features</h3>
                <p className="text-purple-200 text-xs mb-3">Pro: 3 bots · Business: Unlimited + white-label</p>
                <div className="flex flex-wrap gap-1.5">
                  {['3 bots (Pro)', 'Unlimited (Business)', 'Priority AI', 'Lead capture', 'Analytics'].map(f => (
                    <span key={f} className="bg-white/15 rounded-lg px-2 py-0.5 text-[11px] font-semibold">{f}</span>
                  ))}
                </div>
              </div>
              <Link href="/dashboard/billing"
                className="flex items-center gap-1.5 bg-yellow-400 text-yellow-900 rounded-xl px-4 py-2.5 font-black text-sm hover:bg-yellow-300 transition-all shadow-lg flex-shrink-0 w-full sm:w-auto justify-center">
                Upgrade <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        )}

        {/* ── CREATE BOT BOTTOM SHEET / MODAL ── */}
        <AnimatePresence>
          {showCreate && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center"
              onClick={e => { if (e.target === e.currentTarget) setShowCreate(false) }}>
              <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl p-5 max-h-[92vh] overflow-y-auto shadow-2xl">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="font-display font-black text-lg text-gray-900">Create New Bot 🤖</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Ready in 30 seconds</p>
                  </div>
                  <button onClick={() => setShowCreate(false)} className="p-2 hover:bg-gray-100 rounded-xl">
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                </div>

                {/* Handle bar for mobile */}
                <div className="sm:hidden w-12 h-1 bg-gray-200 rounded-full mx-auto mb-4 -mt-2" />

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5">Bot Name *</label>
                    <input className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm outline-none focus:border-teal-400 focus:bg-white transition-all"
                      placeholder="e.g. Shop Assistant, Sales Bot..." value={newName} onChange={e => setNewName(e.target.value)} autoFocus />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5">WhatsApp Number <span className="text-gray-300 font-normal normal-case">(optional)</span></label>
                    <input className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm outline-none focus:border-teal-400 focus:bg-white transition-all"
                      placeholder="+971 50 000 0000" value={newPhone} onChange={e => setNewPhone(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Bot Personality</label>
                    <div className="grid grid-cols-2 gap-2">
                      {PERSONAS.map(p => (
                        <button key={p.value} onClick={() => setNewPersona(p.value)}
                          className={`p-3 rounded-xl border-2 text-left transition-all ${newPersona === p.value ? `${p.border} ${p.bg}` : 'border-gray-100 bg-gray-50 hover:border-gray-200'}`}>
                          <p className="text-sm font-bold text-gray-900">{p.emoji} {p.label}</p>
                          <p className="text-[10px] text-gray-500 mt-0.5">{p.desc}</p>
                          {newPersona === p.value && <Check className="w-3 h-3 text-teal-600 mt-1" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-5">
                  <button onClick={() => setShowCreate(false)}
                    className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all">
                    Cancel
                  </button>
                  <button onClick={create} disabled={busy}
                    className="flex-1 py-3 rounded-xl text-white text-sm font-black flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                    style={{ background: 'linear-gradient(135deg, #0d9488, #7c3aed)', boxShadow: '0 6px 20px rgba(13,148,136,0.35)' }}>
                    {busy ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating...</> : <><Zap className="w-4 h-4" /> Create Bot</>}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── AI PREVIEW BOTTOM SHEET ── */}
        <AnimatePresence>
          {previewBot && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center"
              onClick={e => { if (e.target === e.currentTarget) setPreviewBot(null) }}>
              <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                className="bg-white w-full sm:max-w-sm sm:rounded-2xl rounded-t-2xl overflow-hidden shadow-2xl">
                {/* WhatsApp-style header */}
                <div className="flex items-center gap-3 px-4 py-3" style={{ background: 'linear-gradient(135deg, #075e54, #128c7e)' }}>
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-base flex-shrink-0">🤖</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white text-sm truncate">{previewBot.name}</p>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                      <p className="text-[10px] text-green-200">online · AI-powered</p>
                    </div>
                  </div>
                  <button onClick={() => setPreviewBot(null)} className="p-1.5 hover:bg-white/10 rounded-lg transition-all flex-shrink-0">
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
                {/* Chat */}
                <div className="bg-[#e5ddd5] p-4 h-52 overflow-y-auto space-y-3">
                  {!previewMsg && !previewReply && (
                    <div className="text-center mt-6">
                      <p className="text-xs text-gray-500 bg-white/60 rounded-xl px-3 py-2 inline-block">
                        Type a customer message below to see how your bot replies 👇
                      </p>
                    </div>
                  )}
                  {previewMsg && (
                    <div className="flex justify-end">
                      <div className="bg-[#dcf8c6] rounded-xl rounded-tr-sm px-3 py-2 max-w-[78%] shadow-sm">
                        <p className="text-sm text-gray-800">{previewMsg}</p>
                        <p className="text-[9px] text-gray-400 text-right mt-0.5">You</p>
                      </div>
                    </div>
                  )}
                  {previewing && (
                    <div className="flex justify-start">
                      <div className="bg-white rounded-xl rounded-tl-sm px-3 py-2.5 shadow-sm">
                        <div className="flex gap-1 items-center">
                          {[0, 150, 300].map(d => (
                            <div key={d} className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  {previewReply && !previewing && (
                    <div className="flex justify-start">
                      <div className="bg-white rounded-xl rounded-tl-sm px-3 py-2 max-w-[78%] shadow-sm">
                        <p className="text-[9px] text-teal-600 font-bold mb-1 flex items-center gap-1">
                          <Zap className="w-2.5 h-2.5" />{previewBot.name}
                        </p>
                        <p className="text-sm text-gray-800 leading-relaxed">{previewReply}</p>
                        <p className="text-[9px] text-gray-400 mt-0.5">AI ✓✓</p>
                      </div>
                    </div>
                  )}
                </div>
                {/* Input */}
                <div className="flex gap-2 p-3 bg-white border-t border-gray-100">
                  <input
                    className="flex-1 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-teal-400 focus:bg-white transition-all"
                    placeholder="Type a customer message..."
                    value={previewMsg}
                    onChange={e => { setPreviewMsg(e.target.value); setPreviewReply('') }}
                    onKeyDown={e => e.key === 'Enter' && previewResponse()}
                  />
                  <button onClick={previewResponse} disabled={previewing || !previewMsg.trim()}
                    className="p-2.5 rounded-xl text-white flex-shrink-0 disabled:opacity-50 transition-all"
                    style={{ background: 'linear-gradient(135deg, #0d9488, #128c7e)' }}>
                    {previewing ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin block" /> : <Play className="w-4 h-4" />}
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
