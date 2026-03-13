'use client'
import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { useAuth, apiFetch } from '@/hooks/useAuth'
import { Bot, Plus, Trash2, MessageSquare, Users, Wifi, WifiOff, X, Check, Play, Zap, Eye } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import Link from 'next/link'

const LIMITS: Record<string, number> = { FREE: 1, PRO: 3, BUSINESS: Infinity }

export default function BotsPage() {
  const { user, loading, logout } = useAuth()
  const [bots, setBots]           = useState<any[]>([])
  const [busy, setBusy]           = useState(false)
  const [modal, setModal]         = useState(false)
  const [previewBot, setPreviewBot] = useState<any>(null)
  const [previewMsg, setPreviewMsg] = useState('')
  const [previewReply, setPreviewReply] = useState('')
  const [previewing, setPreviewing] = useState(false)
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
      toast.success('Bot created! 🤖')
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
      toast.success(`Bot ${next === 'ACTIVE' ? 'activated ✅' : 'deactivated'}`)
    } catch (e: any) { toast.error(e.message) }
  }

  const del = async (id: string) => {
    if (!confirm('Delete this bot?')) return
    try {
      await apiFetch(`/api/bots/${id}`, { method: 'DELETE' })
      setBots(bs => bs.filter(b => b.id !== id))
      toast.success('Bot deleted')
    } catch (e: any) { toast.error(e.message) }
  }

  const previewResponse = async () => {
    if (!previewMsg.trim()) return
    setPreviewing(true)
    try {
      const res = await apiFetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ message: `[Bot: ${previewBot?.name}] Customer says: "${previewMsg}". Reply as a helpful WhatsApp business assistant.`, sessionId: 'preview' })
      })
      setPreviewReply(res.reply || res.message || 'No response')
    } catch { setPreviewReply('Unable to preview. Check your OpenAI API key.') }
    finally { setPreviewing(false) }
  }

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center"><div className="spinner w-8 h-8" /></div>
  const limit = LIMITS[user.plan] ?? 1

  const PERSONAS = [
    { value: 'friendly', label: '😊 Friendly', desc: 'Warm and helpful' },
    { value: 'professional', label: '👔 Professional', desc: 'Formal and precise' },
    { value: 'sales', label: '💰 Sales-focused', desc: 'Drives conversions' },
    { value: 'support', label: '🛠 Support', desc: 'Solves problems' },
  ]

  return (
    <DashboardLayout user={user} onLogout={logout}>
      <div className="max-w-4xl space-y-5">
        <div className="flex items-center justify-between">
          <div><h1 className="font-display font-bold text-2xl text-gray-900">My Bots</h1><p className="text-sm text-gray-500 mt-0.5">Manage your WhatsApp AI bots</p></div>
          {bots.length < (limit === Infinity ? 999 : limit)
            ? <button onClick={() => setModal(true)} className="btn-primary text-sm"><Plus className="w-4 h-4" />Create Bot</button>
            : <Link href="/dashboard/billing" className="btn-secondary text-sm">Upgrade for more bots</Link>
          }
        </div>

        {/* Limit bar */}
        <div className="bg-gray-50 rounded-xl px-4 py-3 flex items-center justify-between">
          <span className="text-sm text-gray-600">Using <strong>{bots.length}</strong> of <strong>{limit === Infinity ? 'Unlimited' : limit}</strong> bots</span>
          <div className="flex gap-1">
            {[...Array(Math.min(limit === Infinity ? 3 : limit, 5))].map((_, i) => (
              <div key={i} className={`h-2 w-10 rounded-full ${i < bots.length ? 'bg-primary-600' : 'bg-gray-200'}`} />
            ))}
          </div>
        </div>

        {bots.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4"><Bot className="w-8 h-8 text-gray-400" /></div>
            <h3 className="font-display font-bold text-gray-900 mb-1">No bots yet</h3>
            <p className="text-sm text-gray-500 mb-5">Create your first WhatsApp AI bot to start capturing leads 24/7</p>
            <button onClick={() => setModal(true)} className="btn-primary mx-auto"><Plus className="w-4 h-4" />Create Your First Bot</button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {bots.map((bot, i) => (
              <motion.div key={bot.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="card p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bot.status === 'ACTIVE' ? 'bg-green-50' : 'bg-gray-100'}`}>
                      <Bot className={`w-5 h-5 ${bot.status === 'ACTIVE' ? 'text-green-600' : 'text-gray-400'}`} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{bot.name}</p>
                      <p className="text-xs text-gray-400">{bot.phoneNumber || 'No number linked'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {bot.status === 'ACTIVE' && <span className="live-dot" />}
                    <span className={`badge ${bot.status === 'ACTIVE' ? 'badge-green' : 'badge-gray'} flex items-center gap-1`}>
                      {bot.status === 'ACTIVE' ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                      {bot.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <MessageSquare className="w-4 h-4 text-primary-500 mx-auto mb-1" />
                    <p className="font-bold text-gray-900">{bot.totalReplies.toLocaleString()}</p>
                    <p className="text-[10px] text-gray-500">Replies sent</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <Users className="w-4 h-4 text-green-500 mx-auto mb-1" />
                    <p className="font-bold text-gray-900">{bot.leadsCaptures}</p>
                    <p className="text-[10px] text-gray-500">Leads captured</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => toggle(bot)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium transition-all ${
                      bot.status === 'ACTIVE' ? 'bg-orange-50 text-orange-600 hover:bg-orange-100' : 'bg-green-50 text-green-600 hover:bg-green-100'
                    }`}>
                    {bot.status === 'ACTIVE' ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
                    {bot.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                  </button>
                  <button onClick={() => { setPreviewBot(bot); setPreviewMsg(''); setPreviewReply('') }}
                    className="p-2 rounded-xl bg-blue-50 text-blue-500 hover:bg-blue-100 transition-all" title="Preview AI response">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button onClick={() => del(bot.id)} className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-all"><Trash2 className="w-4 h-4" /></button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Create modal */}
      <AnimatePresence>
        {modal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="card p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display font-bold text-xl text-gray-900">Create New Bot</h2>
                <button onClick={() => setModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4 text-gray-500" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Bot Name *</label>
                  <input className="input-field" placeholder="e.g. Shop Assistant" value={newName} onChange={e => setNewName(e.target.value)} autoFocus />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">WhatsApp Number <span className="text-gray-400">(optional)</span></label>
                  <input className="input-field" placeholder="+971 50 000 0000" value={newPhone} onChange={e => setNewPhone(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bot Personality</label>
                  <div className="grid grid-cols-2 gap-2">
                    {PERSONAS.map(p => (
                      <button key={p.value} onClick={() => setNewPersona(p.value)}
                        className={`p-3 rounded-xl border-2 text-left transition-all ${newPersona === p.value ? 'border-primary-400 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}>
                        <p className="text-sm font-semibold text-gray-900">{p.label}</p>
                        <p className="text-xs text-gray-500">{p.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={create} disabled={busy} className="btn-primary flex-1">
                  {busy ? <><span className="spinner" />Creating...</> : <><Check className="w-4 h-4" />Create Bot</>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Preview modal */}
      <AnimatePresence>
        {previewBot && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="card p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="font-display font-bold text-xl text-gray-900">AI Preview</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Test how <strong>{previewBot.name}</strong> would reply</p>
                </div>
                <button onClick={() => setPreviewBot(null)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4 text-gray-500" /></button>
              </div>

              {/* Simulated WhatsApp chat */}
              <div className="bg-[#e5ddd5] rounded-xl p-4 min-h-32 mb-4 space-y-3">
                {previewMsg && (
                  <div className="flex justify-end">
                    <div className="bg-[#dcf8c6] rounded-xl rounded-tr-sm px-3 py-2 max-w-[80%]">
                      <p className="text-sm text-gray-800">{previewMsg}</p>
                    </div>
                  </div>
                )}
                {previewing && (
                  <div className="flex justify-start">
                    <div className="bg-white rounded-xl rounded-tl-sm px-3 py-2 flex gap-1 items-center">
                      <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
                    </div>
                  </div>
                )}
                {previewReply && !previewing && (
                  <div className="flex justify-start">
                    <div className="bg-white rounded-xl rounded-tl-sm px-3 py-2 max-w-[80%]">
                      <p className="text-[10px] text-primary-600 font-bold mb-1 flex items-center gap-1"><Zap className="w-3 h-3" />{previewBot.name}</p>
                      <p className="text-sm text-gray-800">{previewReply}</p>
                    </div>
                  </div>
                )}
                {!previewMsg && !previewReply && (
                  <p className="text-center text-xs text-gray-500 mt-8">Type a message below to see how your bot replies</p>
                )}
              </div>

              <div className="flex gap-2">
                <input className="input-field flex-1" placeholder="Type a customer message..." value={previewMsg}
                  onChange={e => { setPreviewMsg(e.target.value); setPreviewReply('') }}
                  onKeyDown={e => e.key === 'Enter' && previewResponse()} />
                <button onClick={previewResponse} disabled={previewing || !previewMsg.trim()} className="btn-primary px-4">
                  {previewing ? <span className="spinner" /> : <Play className="w-4 h-4" />}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  )
}
