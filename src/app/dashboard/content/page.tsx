'use client'
import { useState } from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { useAuth, apiFetch } from '@/hooks/useAuth'
import { motion, AnimatePresence } from 'framer-motion'
import { PenTool, Sparkles, Copy, Download, RefreshCw, Check, Crown, Lock, ArrowRight, Zap } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

const TOOLS = [
  { id:'blog',      emoji:'📝', label:'Blog Post',         desc:'Full SEO blog 800–1000 words', free:true,  grad:'from-blue-500 to-indigo-600',    ex:'Benefits of intermittent fasting' },
  { id:'marketing', emoji:'📣', label:'Marketing Copy',    desc:'Ads, headlines, multi-platform',free:true,  grad:'from-purple-500 to-violet-600',  ex:'AI productivity app for freelancers' },
  { id:'product',   emoji:'🛍️', label:'Product Page',      desc:'Benefits, features, CTAs',      free:true,  grad:'from-pink-500 to-rose-600',      ex:'Wireless noise-cancelling headphones' },
  { id:'social',    emoji:'📱', label:'Social Pack',        desc:'5 platforms ready-to-post',     free:true,  grad:'from-teal-500 to-cyan-600',      ex:'Morning routine tips for entrepreneurs' },
  { id:'email',     emoji:'📧', label:'Email Sequence',    desc:'5-email nurture sequence',       free:false, grad:'from-amber-500 to-orange-600',   ex:'SaaS onboarding for new users' },
]

const TONES = [
  { id:'professional', label:'Professional', emoji:'👔' },
  { id:'friendly',     label:'Friendly',     emoji:'😊' },
  { id:'persuasive',   label:'Persuasive',   emoji:'🔥' },
  { id:'casual',       label:'Casual',       emoji:'✌️' },
  { id:'urgent',       label:'Urgent',       emoji:'⚡' },
  { id:'inspirational',label:'Inspiring',    emoji:'✨' },
]

export default function ContentPage() {
  const { user, loading, logout } = useAuth()
  const [tool, setTool]       = useState('blog')
  const [topic, setTopic]     = useState('')
  const [tone, setTone]       = useState('professional')
  const [audience, setAudience] = useState('')
  const [keywords, setKeywords] = useState('')
  const [content, setContent] = useState('')
  const [generating, setGenerating] = useState(false)
  const [copied, setCopied]   = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)

  const isPro = user?.plan === 'PRO' || user?.plan === 'BUSINESS'
  const activeTool = TOOLS.find(t => t.id === tool)!

  const generate = async () => {
    if (!topic.trim()) { toast.error('Enter a topic first'); return }
    if (!isPro && !activeTool.free) { setShowUpgrade(true); return }
    setGenerating(true); setContent('')
    try {
      const res = await apiFetch('/api/ai/content', { method:'POST', body:JSON.stringify({ type:tool, topic, tone, audience, keywords }) })
      setContent(res.content || '')
      apiFetch('/api/ai/streak', { method:'POST', body:JSON.stringify({ action:'use_tool' }) })
    } catch (e: any) { toast.error(e.message || 'Failed. Check your API key.') }
    finally { setGenerating(false) }
  }

  const copy = () => { navigator.clipboard.writeText(content); setCopied(true); toast.success('Copied!'); setTimeout(() => setCopied(false), 2000) }
  const download = () => {
    const a = document.createElement('a')
    a.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(content)
    a.download = `textife-${tool}-${Date.now()}.txt`
    a.click(); toast.success('Downloaded!')
  }

  if (loading || !user) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center mx-auto animate-pulse">
          <PenTool className="w-7 h-7 text-white" />
        </div>
        <p className="text-sm text-gray-400">Loading Content Hub...</p>
      </div>
    </div>
  )

  return (
    <DashboardLayout user={user} onLogout={logout}>
      <div className="max-w-4xl space-y-5 pb-10">

        {/* Hero */}
        <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}
          className="relative overflow-hidden rounded-2xl p-5 sm:p-7 text-white"
          style={{ background:'linear-gradient(135deg,#7c3aed 0%,#a855f7 50%,#ec4899 100%)' }}>
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage:'radial-gradient(circle,white 1px,transparent 1px)', backgroundSize:'24px 24px' }} />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                <PenTool className="w-4 h-4 text-white" />
              </div>
              <span className="text-purple-200 font-bold text-xs uppercase tracking-widest">AI Content Hub</span>
            </div>
            <h1 className="font-display font-black text-2xl sm:text-3xl mb-1">Create Any Content in Seconds ✍️</h1>
            <p className="text-purple-200 text-sm max-w-lg">Blog posts, marketing copy, product pages, social content, email sequences — all unique, formatted, and ready to publish.</p>
            <div className="flex flex-wrap gap-2 mt-4">
              {['Blog Posts','Marketing Copy','Product Pages','Social Media Packs','Email Sequences'].map(f => (
                <span key={f} className="bg-white/15 rounded-full px-3 py-1 text-xs font-semibold">{f}</span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Tool Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {TOOLS.map(t => (
            <button key={t.id} onClick={() => { setTool(t.id); setContent('') }}
              className={`relative p-3 rounded-2xl border-2 text-left transition-all active:scale-95 ${
                tool === t.id
                  ? 'border-purple-400 bg-purple-50 shadow-md'
                  : (!isPro && !t.free) ? 'border-gray-100 bg-gray-50 opacity-70' : 'border-gray-100 bg-white hover:border-purple-200'
              }`}>
              {!t.free && !isPro && (
                <Crown className="absolute top-2 right-2 w-3 h-3 text-amber-500" />
              )}
              <span className="text-xl block mb-1">{t.emoji}</span>
              <p className="font-bold text-xs text-gray-900">{t.label}</p>
              <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">{t.desc}</p>
            </button>
          ))}
        </div>

        {/* Example suggestion */}
        {activeTool.ex && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="text-gray-400">e.g.</span>
            <button onClick={() => setTopic(activeTool.ex)}
              className="flex items-center gap-1 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-xl hover:bg-indigo-100 transition-all font-semibold">
              {activeTool.ex} <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Inputs */}
        <div className="card p-5 space-y-4">
          <div>
            <label className="block text-xs font-black text-gray-500 mb-1.5 uppercase tracking-widest">
              Topic / Subject <span className="text-red-400">*</span>
            </label>
            <input className="input-field text-base" value={topic} onChange={e => setTopic(e.target.value)}
              placeholder={`What is this ${activeTool.label.toLowerCase()} about?`}
              onKeyDown={e => e.key === 'Enter' && generate()} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-gray-500 mb-2 uppercase tracking-widest">Tone / Style</label>
              <div className="grid grid-cols-3 gap-1.5">
                {TONES.map(t => (
                  <button key={t.id} onClick={() => setTone(t.id)}
                    className={`py-2 px-2 rounded-xl text-[11px] font-bold transition-all border-2 ${tone === t.id ? 'border-purple-400 bg-purple-50 text-purple-700' : 'border-gray-100 text-gray-600 hover:border-gray-200'}`}>
                    {t.emoji} {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-black text-gray-500 mb-1.5 uppercase tracking-widest">Target Audience <span className="text-gray-400 font-normal">(optional)</span></label>
                <input className="input-field" placeholder="entrepreneurs, teens, moms..." value={audience} onChange={e => setAudience(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-500 mb-1.5 uppercase tracking-widest">Keywords <span className="text-gray-400 font-normal">(optional)</span></label>
                <input className="input-field" placeholder="seo, keyword1, keyword2..." value={keywords} onChange={e => setKeywords(e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        {/* Generate button */}
        {!isPro && !activeTool.free ? (
          <Link href="/dashboard/billing"
            className="w-full py-4 rounded-xl font-black text-base flex items-center justify-center gap-2.5 text-yellow-900 transition-all"
            style={{ background:'linear-gradient(135deg,#f59e0b,#d97706)', boxShadow:'0 8px 24px rgba(245,158,11,0.35)' }}>
            <Crown className="w-5 h-5" />Unlock Email Sequences — Upgrade to Pro
          </Link>
        ) : (
          <button onClick={generate} disabled={generating}
            className="w-full py-4 rounded-xl font-black text-base flex items-center justify-center gap-2.5 text-white transition-all disabled:opacity-60"
            style={{
              background: generating ? '#a78bfa' : `linear-gradient(135deg,#7c3aed,#a855f7)`,
              boxShadow: generating ? 'none' : '0 8px 24px rgba(124,58,237,0.35)'
            }}>
            {generating
              ? <><span className="spinner border-white/60" />Generating unique content...</>
              : <><Sparkles className="w-5 h-5" />Generate {activeTool.label} Now</>}
          </button>
        )}

        {/* Result */}
        <AnimatePresence>
          {content && (
            <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="card overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-wrap gap-2">
                <div>
                  <h2 className="font-display font-bold text-gray-900 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-purple-600" />Generated {activeTool.label}
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">{content.split(' ').length} words · {content.length} chars · Ready to use</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={generate} disabled={generating} className="btn-secondary text-xs py-1.5 px-3">
                    <RefreshCw className="w-3.5 h-3.5" />Regenerate
                  </button>
                  <button onClick={download} className="btn-secondary text-xs py-1.5 px-3">
                    <Download className="w-3.5 h-3.5" />Save
                  </button>
                  <button onClick={copy}
                    className={`flex items-center gap-1.5 text-xs px-4 py-1.5 rounded-xl font-bold transition-all ${copied ? 'bg-green-500 text-white' : 'bg-purple-600 text-white hover:bg-purple-700'}`}>
                    {copied ? <><Check className="w-3.5 h-3.5" />Copied!</> : <><Copy className="w-3.5 h-3.5" />Copy All</>}
                  </button>
                </div>
              </div>
              <div className="p-5 max-h-[600px] overflow-y-auto bg-gray-50">
                <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">{content}</pre>
              </div>
              <div className="flex items-center gap-2 px-5 py-3 bg-green-50 border-t border-green-100">
                <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                <p className="text-xs text-green-700 font-medium">100% unique AI content — ready to publish, edit, or share.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upgrade modal */}
        <AnimatePresence>
          {showUpgrade && (
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
              <motion.div initial={{ y:'100%' }} animate={{ y:0 }} exit={{ y:'100%' }}
                transition={{ type:'spring', damping:28, stiffness:300 }}
                className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
                <button onClick={() => setShowUpgrade(false)} className="float-right p-1.5 hover:bg-gray-100 rounded-xl">
                  <span className="text-gray-400 text-lg">×</span>
                </button>
                <div className="text-center pt-2">
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Crown className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="font-display font-black text-xl text-gray-900 mb-2">Pro Feature</h2>
                  <p className="text-gray-500 text-sm mb-5">Email sequences need Pro. Upgrade to unlock them + all premium features.</p>
                  <Link href="/dashboard/billing" onClick={() => setShowUpgrade(false)}
                    className="block w-full py-3.5 rounded-xl font-black text-center text-white"
                    style={{ background:'linear-gradient(135deg,#f59e0b,#d97706)' }}>
                    🚀 Upgrade to Pro — $19/mo
                  </Link>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </DashboardLayout>
  )
}
