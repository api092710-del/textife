'use client'
import { useState, useRef } from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { useAuth, apiFetch } from '@/hooks/useAuth'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  Zap, Copy, Check, Sparkles, Crown, Lock,
  ChevronDown, ChevronUp, Globe, Pen, Lightbulb,
  BookOpen, Target, Hash, Type, GraduationCap
} from 'lucide-react'
import toast from 'react-hot-toast'

// ─── Tool definitions ────────────────────────────────────────────
const TOOLS = [
  {
    id: 'summarize', emoji: '📝', label: 'Summarize',
    desc: 'Condense any text to key insights',
    placeholder: 'Paste any article, email, report, or text here...',
    gradient: 'from-blue-500 to-indigo-600', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700',
    free: true, options: [],
  },
  {
    id: 'translate', emoji: '🌍', label: 'Translate',
    desc: 'Translate text to any language',
    placeholder: 'Type or paste text to translate...',
    gradient: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700',
    free: true,
    options: ['language'],
  },
  {
    id: 'rewrite', emoji: '✏️', label: 'Rewrite',
    desc: 'Rewrite in any style you choose',
    placeholder: 'Paste text to rewrite and make better...',
    gradient: 'from-violet-500 to-purple-600', bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700',
    free: true,
    options: ['style'],
  },
  {
    id: 'ideas', emoji: '💡', label: 'Generate Ideas',
    desc: '8 creative & actionable ideas',
    placeholder: 'Enter a topic, problem, or question...',
    gradient: 'from-amber-500 to-orange-500', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700',
    free: true, options: [],
  },
  {
    id: 'explain', emoji: '🎓', label: 'Explain It',
    desc: 'Understand any complex topic',
    placeholder: 'What do you want explained? (any topic)...',
    gradient: 'from-cyan-500 to-blue-500', bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-700',
    free: true,
    options: ['level'],
  },
  {
    id: 'actionplan', emoji: '🎯', label: 'Action Plan',
    desc: 'Step-by-step plan for any goal',
    placeholder: 'What goal or project do you want a plan for?',
    gradient: 'from-rose-500 to-pink-600', bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700',
    free: false, options: [],
  },
  {
    id: 'hashtags', emoji: '#️⃣', label: 'Hashtags',
    desc: '30 optimized hashtags per platform',
    placeholder: 'Describe your post, product, or niche...',
    gradient: 'from-fuchsia-500 to-pink-500', bg: 'bg-fuchsia-50', border: 'border-fuchsia-200', text: 'text-fuchsia-700',
    free: false,
    options: ['platform'],
  },
  {
    id: 'headline', emoji: '📢', label: 'Headlines',
    desc: '12 click-worthy titles that stop scrollers',
    placeholder: 'What is your article, video, or post about?',
    gradient: 'from-orange-500 to-red-500', bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700',
    free: false,
    options: ['type'],
  },
]

const LANGUAGES = [
  '🇦🇪 Arabic','🇫🇷 French','🇪🇸 Spanish','🇩🇪 German','🇨🇳 Chinese',
  '🇯🇵 Japanese','🇵🇹 Portuguese','🇮🇳 Hindi','🇹🇷 Turkish','🇷🇺 Russian',
  '🇮🇩 Indonesian','🇰🇷 Korean','🇮🇹 Italian','🇳🇱 Dutch','🇸🇦 Urdu',
]
const STYLES   = ['Professional','Casual','Persuasive','Simple','Formal','Witty','Confident','Empathetic']
const LEVELS   = ['Simple (5yr old)','Easy (student)','Standard','Advanced','Expert']
const PLATFORMS = ['Instagram','TikTok','Twitter/X','LinkedIn','YouTube','Facebook']
const HEADLINE_TYPES = ['Article','YouTube Video','Email Subject','Social Post','Ad Copy','Product Title']

export default function QuickToolsPage() {
  const { user, loading, logout } = useAuth()
  const [activeTool, setActiveTool] = useState(TOOLS[0])
  const [input, setInput]     = useState('')
  const [result, setResult]   = useState('')
  const [running, setRunning] = useState(false)
  const [copied, setCopied]   = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)

  // Option states
  const [language, setLanguage] = useState('🇦🇪 Arabic')
  const [style, setStyle]       = useState('Professional')
  const [level, setLevel]       = useState('Easy (student)')
  const [platform, setPlatform] = useState('Instagram')
  const [headlineType, setHeadlineType] = useState('Article')

  const resultRef = useRef<HTMLDivElement>(null)

  const isPro = user?.plan === 'PRO' || user?.plan === 'BUSINESS'

  const selectTool = (tool: typeof TOOLS[0]) => {
    if (!tool.free && !isPro) { setShowUpgrade(true); return }
    setActiveTool(tool)
    setInput('')
    setResult('')
    setShowUpgrade(false)
  }

  const run = async () => {
    if (!input.trim()) { toast.error('Enter some text first! ✍️'); return }
    setRunning(true); setResult('')
    try {
      // Build options object based on active tool
      const options: Record<string, string> = {}
      if (activeTool.id === 'translate') options.language = language.replace(/^[^\s]+ /, '') // strip emoji
      if (activeTool.id === 'rewrite')   options.style    = style.toLowerCase()
      if (activeTool.id === 'explain')   options.level    = level.toLowerCase()
      if (activeTool.id === 'hashtags')  options.platform = platform
      if (activeTool.id === 'headline')  options.type     = headlineType.toLowerCase()

      const res = await apiFetch('/api/ai/quicktools', {
        method: 'POST',
        body: JSON.stringify({ tool: activeTool.id, input: input.trim(), options }),
      })
      setResult(res.result || '')
      // Scroll to result
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
      apiFetch('/api/ai/streak', { method: 'POST', body: JSON.stringify({ action: 'use_tool' }) }).catch(() => {})
    } catch (e: any) {
      toast.error(e.message || 'Something went wrong')
    } finally {
      setRunning(false)
    }
  }

  const copy = () => {
    navigator.clipboard.writeText(result)
    setCopied(true)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading || !user) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <DashboardLayout user={user} onLogout={logout}>
      <div className="w-full max-w-3xl mx-auto space-y-5 pb-8">

        {/* ── HEADER ── */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl p-5 text-white"
          style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 50%, #ef4444 100%)' }}>
          <div className="absolute inset-0 opacity-[0.07]"
            style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
          <div className="relative flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-yellow-200 fill-yellow-200" />
                <span className="text-amber-200 font-bold text-xs uppercase tracking-widest">8 AI Tools</span>
              </div>
              <h1 className="font-display font-black text-2xl sm:text-3xl mb-1">Quick AI Tools ⚡</h1>
              <p className="text-amber-100 text-sm">Instant results. No fluff. Just power.</p>
            </div>
            <div className="bg-white/15 rounded-xl px-3 py-2 text-center flex-shrink-0">
              <p className="font-black text-lg leading-none">{TOOLS.filter(t => t.free || isPro).length}</p>
              <p className="text-[10px] text-amber-200">Tools Active</p>
            </div>
          </div>
        </motion.div>

        {/* ── TOOL GRID ── */}
        <div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 px-1">Choose a Tool</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {TOOLS.map((tool, i) => {
              const isLocked = !tool.free && !isPro
              const isActive = activeTool.id === tool.id
              return (
                <motion.button
                  key={tool.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => selectTool(tool)}
                  className={`relative p-3.5 rounded-2xl border-2 text-left transition-all active:scale-95 ${
                    isActive
                      ? `${tool.border} ${tool.bg} shadow-md`
                      : isLocked
                      ? 'border-gray-100 bg-gray-50 opacity-75'
                      : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'
                  }`}
                >
                  {isLocked && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center">
                      <Lock className="w-2.5 h-2.5 text-white" />
                    </div>
                  )}
                  {isActive && !isLocked && (
                    <div className={`absolute top-2 right-2 w-5 h-5 bg-gradient-to-br ${tool.gradient} rounded-full flex items-center justify-center`}>
                      <Check className="w-2.5 h-2.5 text-white" />
                    </div>
                  )}
                  <span className="text-2xl block mb-2 leading-none">{tool.emoji}</span>
                  <p className={`font-bold text-xs leading-snug ${isActive ? tool.text : 'text-gray-900'}`}>{tool.label}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5 leading-tight hidden sm:block">{tool.desc}</p>
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* ── PRO UPGRADE BANNER ── */}
        <AnimatePresence>
          {showUpgrade && (
            <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="relative overflow-hidden rounded-2xl p-5 text-white"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Crown className="w-5 h-5 text-yellow-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-yellow-300 text-xs uppercase tracking-widest mb-0.5">PRO ONLY</p>
                  <h3 className="font-display font-black text-base mb-1">Unlock Action Plan, Hashtags & Headlines</h3>
                  <p className="text-purple-200 text-xs mb-3">The 3 tools that save hours of work every week — only on Pro.</p>
                  <div className="flex gap-2">
                    <Link href="/dashboard/billing"
                      className="flex items-center gap-1.5 bg-yellow-400 text-yellow-900 rounded-xl px-4 py-2.5 text-xs font-black hover:bg-yellow-300 transition-all shadow-lg">
                      <Crown className="w-3.5 h-3.5" /> Upgrade Now
                    </Link>
                    <button onClick={() => setShowUpgrade(false)}
                      className="px-3 py-2 text-xs font-bold text-purple-300 hover:text-white transition-colors">
                      Maybe later
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── INPUT SECTION ── */}
        <motion.div
          key={activeTool.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
        >
          {/* Active tool header */}
          <div className={`flex items-center gap-3 px-5 py-4 ${activeTool.bg} border-b ${activeTool.border}`}>
            <span className="text-2xl leading-none">{activeTool.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className={`font-display font-black text-sm ${activeTool.text}`}>{activeTool.label}</p>
              <p className="text-xs text-gray-500">{activeTool.desc}</p>
            </div>
            <div className={`px-2 py-1 rounded-lg bg-gradient-to-r ${activeTool.gradient} text-white text-[10px] font-black`}>
              ACTIVE
            </div>
          </div>

          <div className="p-5 space-y-4">

            {/* ── Tool-specific options ── */}
            {activeTool.id === 'translate' && (
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Translate To</label>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGES.map(lang => (
                    <button key={lang} onClick={() => setLanguage(lang)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                        language === lang
                          ? `bg-gradient-to-r ${activeTool.gradient} text-white border-transparent shadow-sm`
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300'
                      }`}>
                      {lang}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTool.id === 'rewrite' && (
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Writing Style</label>
                <div className="flex flex-wrap gap-2">
                  {STYLES.map(s => (
                    <button key={s} onClick={() => setStyle(s)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                        style === s
                          ? `bg-gradient-to-r ${activeTool.gradient} text-white border-transparent shadow-sm`
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300'
                      }`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTool.id === 'explain' && (
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Explanation Level</label>
                <div className="flex flex-wrap gap-2">
                  {LEVELS.map(l => (
                    <button key={l} onClick={() => setLevel(l)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                        level === l
                          ? `bg-gradient-to-r ${activeTool.gradient} text-white border-transparent shadow-sm`
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300'
                      }`}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTool.id === 'hashtags' && (
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Platform</label>
                <div className="flex flex-wrap gap-2">
                  {PLATFORMS.map(p => (
                    <button key={p} onClick={() => setPlatform(p)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                        platform === p
                          ? `bg-gradient-to-r ${activeTool.gradient} text-white border-transparent shadow-sm`
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300'
                      }`}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTool.id === 'headline' && (
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Content Type</label>
                <div className="flex flex-wrap gap-2">
                  {HEADLINE_TYPES.map(t => (
                    <button key={t} onClick={() => setHeadlineType(t)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                        headlineType === t
                          ? `bg-gradient-to-r ${activeTool.gradient} text-white border-transparent shadow-sm`
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300'
                      }`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Text input */}
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Your Text</label>
              <textarea
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-amber-400 focus:bg-white transition-all resize-none leading-relaxed"
                rows={4}
                placeholder={activeTool.placeholder}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) run() }}
              />
              <div className="flex items-center justify-between mt-1.5">
                <p className="text-[10px] text-gray-400">{input.length} chars · ⌘+Enter to run</p>
                {input.length > 0 && (
                  <button onClick={() => setInput('')} className="text-[10px] text-red-400 hover:text-red-600 font-bold transition-colors">
                    Clear ✕
                  </button>
                )}
              </div>
            </div>

            {/* Run button */}
            <button
              onClick={run}
              disabled={running || !input.trim()}
              className="w-full py-4 rounded-xl text-white font-black text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 active:scale-[0.98]"
              style={{
                background: running ? '#9ca3af' : `linear-gradient(135deg, #f59e0b, #f97316)`,
                boxShadow: running ? 'none' : '0 6px 20px rgba(245,158,11,0.4)',
              }}
            >
              {running
                ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Running {activeTool.label}...</>
                : <><Sparkles className="w-4 h-4" /> {activeTool.emoji} Run {activeTool.label} — Instant Results</>
              }
            </button>
          </div>
        </motion.div>

        {/* ── RESULT ── */}
        <AnimatePresence>
          {result && (
            <motion.div
              ref={resultRef}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            >
              {/* Result header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <p className="font-bold text-sm text-gray-900">✨ Result — {activeTool.label}</p>
                </div>
                <button onClick={copy}
                  className={`flex items-center gap-1.5 text-xs font-black px-3 py-2 rounded-xl transition-all ${
                    copied
                      ? 'bg-green-500 text-white'
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm'
                  }`}>
                  {copied ? <><Check className="w-3 h-3" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy All</>}
                </button>
              </div>

              <div className="p-5">
                <div className="bg-gray-50 rounded-xl p-4 max-h-96 overflow-y-auto border border-gray-100">
                  <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans leading-relaxed">{result}</pre>
                </div>

                {/* Action row */}
                <div className="flex flex-wrap gap-2 mt-4">
                  <button onClick={run}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 rounded-xl hover:bg-amber-100 transition-all">
                    <Sparkles className="w-3 h-3" /> Regenerate
                  </button>
                  <button onClick={() => { setInput(''); setResult('') }}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-gray-50 text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-100 transition-all">
                    🔄 Start Over
                  </button>
                  <button onClick={copy}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-green-50 text-green-700 border border-green-200 rounded-xl hover:bg-green-100 transition-all">
                    <Copy className="w-3 h-3" /> Copy
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── FOMO UPGRADE STRIP (free users) ── */}
        {!isPro && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="relative overflow-hidden rounded-2xl p-5 text-white"
            style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 50%, #2563eb 100%)' }}>
            <div className="absolute inset-0 opacity-[0.07]"
              style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "18px 18px" }} />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-4 h-4 text-yellow-300" />
                <span className="text-yellow-300 font-black text-xs uppercase tracking-widest">You're missing out</span>
              </div>
              <h3 className="font-display font-black text-lg mb-1">Pro users run 3x more tools</h3>
              <p className="text-purple-200 text-xs mb-4 leading-relaxed">
                Action Plan, Hashtags & Headlines are locked. Pro users schedule less and produce more — every single day.
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {['🎯 Action Plans', '#️⃣ Hashtag packs', '📢 Headlines', '⚡ 2,000 replies/mo', '🤖 3 AI bots'].map(f => (
                  <span key={f} className="bg-white/15 rounded-lg px-2.5 py-1 text-xs font-semibold">{f}</span>
                ))}
              </div>
              <Link href="/dashboard/billing"
                className="inline-flex items-center gap-2 bg-yellow-400 text-yellow-900 rounded-xl px-5 py-3 font-black text-sm hover:bg-yellow-300 transition-all shadow-lg">
                <Crown className="w-4 h-4" /> Upgrade to Pro — Unlock Everything
              </Link>
            </div>
          </motion.div>
        )}

      </div>
    </DashboardLayout>
  )
}
