'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { useAuth, apiFetch } from '@/hooks/useAuth'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Zap, Trophy, Flame, TrendingUp, ArrowRight, Sparkles, Crown, Copy, Check
} from 'lucide-react'
import toast from 'react-hot-toast'

const AI_TOOLS = [
  { icon: '💡', label: 'Business Ideas',  desc: 'Startup & side hustle ideas',     href: '/dashboard/ideas',      bg: 'bg-yellow-50',   border: 'border-yellow-100', iconBg: 'bg-yellow-100', free: true },
  { icon: '💰', label: 'Money Maker',     desc: 'Find ways to earn today',         href: '/dashboard/money',      bg: 'bg-green-50',    border: 'border-green-100',  iconBg: 'bg-green-100',  free: true },
  { icon: '✍️', label: 'Content Hub',     desc: 'Blog, social & email copy',       href: '/dashboard/content',    bg: 'bg-purple-50',   border: 'border-purple-100', iconBg: 'bg-purple-100', free: true },
  { icon: '📣', label: 'Sales Messages',  desc: 'Messages that close deals',       href: '/dashboard/sales',      bg: 'bg-blue-50',     border: 'border-blue-100',   iconBg: 'bg-blue-100',   free: true },
  { icon: '🌱', label: 'Personal Growth', desc: 'Planner, habits & motivation',    href: '/dashboard/growth',     bg: 'bg-rose-50',     border: 'border-rose-100',   iconBg: 'bg-rose-100',   free: true },
  { icon: '⚡', label: 'Quick Tools',     desc: 'Summarize, rewrite, translate',   href: '/dashboard/quicktools', bg: 'bg-amber-50',    border: 'border-amber-100',  iconBg: 'bg-amber-100',  free: true },
  { icon: '📚', label: 'Prompt Library',  desc: '24 fill-in AI prompts',           href: '/dashboard/prompts',    bg: 'bg-indigo-50',   border: 'border-indigo-100', iconBg: 'bg-indigo-100', free: false },
  { icon: '🤖', label: 'WhatsApp Bots',   desc: 'AI customer automation',          href: '/dashboard/bots',       bg: 'bg-teal-50',     border: 'border-teal-100',   iconBg: 'bg-teal-100',   free: false },
]

const QUICK_TOOLS = [
  { label: '📝 Summarize', tool: 'summarize', placeholder: 'Paste any text to summarize...' },
  { label: '💡 Brainstorm', tool: 'ideas',    placeholder: 'Topic to brainstorm ideas on...' },
  { label: '✏️ Rewrite',   tool: 'rewrite',   placeholder: 'Paste text to improve...' },
  { label: '🌍 Translate', tool: 'translate', placeholder: 'Text + target language...' },
]

const START_LINKS = [
  { label: '🚀 Generate a Business Idea',  href: '/dashboard/ideas' },
  { label: '💰 Find Ways to Make Money',   href: '/dashboard/money' },
  { label: '📝 Create Content Instantly',  href: '/dashboard/content' },
  { label: '💬 Write a Sales Message',     href: '/dashboard/sales' },
  { label: '📚 Browse Prompt Library',     href: '/dashboard/prompts' },
]

export default function DashboardPage() {
  const { user, loading, logout } = useAuth()
  const [streak, setStreak]           = useState<any>(null)
  const [analytics, setAnalytics]     = useState<any>(null)
  const [quickInput, setQuickInput]   = useState('')
  const [quickTool, setQuickTool]     = useState('summarize')
  const [quickResult, setQuickResult] = useState('')
  const [quickRunning, setQuickRunning] = useState(false)
  const [copied, setCopied]           = useState(false)

  useEffect(() => {
    if (!user) return
    apiFetch('/api/ai/streak').then(setStreak).catch(() => {})
    apiFetch('/api/analytics?period=30').then(setAnalytics).catch(() => {})
  }, [user])

  const runQuick = async () => {
    if (!quickInput.trim()) { toast.error('Enter some text first'); return }
    setQuickRunning(true); setQuickResult('')
    try {
      const res = await apiFetch('/api/ai/quicktools', {
        method: 'POST',
        body: JSON.stringify({ tool: quickTool, input: quickInput })
      })
      setQuickResult(res.result || '')
      apiFetch('/api/ai/streak', { method: 'POST', body: JSON.stringify({ action: 'use_tool' }) })
    } catch (e: any) { toast.error(e.message) }
    finally { setQuickRunning(false) }
  }

  const copyResult = () => {
    navigator.clipboard.writeText(quickResult)
    setCopied(true)
    toast.success('Copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading || !user) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="text-center px-4">
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse shadow-xl">
          <Zap className="w-8 h-8 text-white fill-white" />
        </div>
        <p className="text-gray-500 font-semibold">Loading your workspace...</p>
      </div>
    </div>
  )

  const firstName   = user.fullName?.split(' ')[0] || 'there'
  const xp          = streak?.xp || 0
  const dayStreak   = streak?.streak || 0
  const isPro       = user.plan === 'PRO' || user.plan === 'BUSINESS'
  const totalReplies = analytics?.totalReplies ?? 0
  const badgeCount  = streak?.badges?.length ?? 0

  return (
    <DashboardLayout user={user} onLogout={logout}>
      {/* Outer wrapper — full width on mobile, constrained on large screens */}
      <div className="w-full max-w-5xl mx-auto space-y-5">

        {/* ─── WELCOME HERO ─── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl p-5 text-white"
          style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 55%, #ec4899 100%)' }}
        >
          {/* Subtle dot pattern */}
          <div className="absolute inset-0 opacity-[0.07]"
            style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "24px 24px" }} />

          <div className="relative flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-indigo-200 text-xs font-semibold mb-1">Welcome back 👋</p>
              <h1 className="font-display font-black text-2xl leading-tight mb-1">
                Hello, {firstName}! ✨
              </h1>
              <p className="text-indigo-200 text-sm leading-relaxed">
                Your AI growth engine is ready.
              </p>
            </div>
            {!isPro && (
              <Link href="/dashboard/billing"
                className="flex-shrink-0 flex items-center gap-1.5 bg-yellow-400 text-yellow-900 rounded-xl px-3 py-2 font-black text-xs hover:bg-yellow-300 transition-all shadow-lg">
                <Crown className="w-3.5 h-3.5" /> Go Pro
              </Link>
            )}
          </div>

          {/* Stats row — 2×2 grid on very small, row on larger */}
          <div className="relative grid grid-cols-2 sm:flex sm:flex-row gap-2 mt-4">
            {[
              { icon: '🔥', val: `${dayStreak}d`,    label: 'Streak'  },
              { icon: '⚡', val: `${xp} XP`,         label: 'Points'  },
              { icon: '💬', val: `${totalReplies}`,   label: 'Replies' },
              { icon: '🏅', val: `${badgeCount}`,     label: 'Badges'  },
            ].map(s => (
              <div key={s.label}
                className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-xl px-3 py-2 flex-1">
                <span className="text-base leading-none">{s.icon}</span>
                <div>
                  <p className="font-black text-sm leading-none">{s.val}</p>
                  <p className="text-[10px] text-indigo-200 mt-0.5">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ─── QUICK AI TOOL ─── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.07 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <Zap className="w-4 h-4 text-white fill-white" />
            </div>
            <div>
              <h2 className="font-display font-bold text-base text-gray-900">Quick AI Tool</h2>
              <p className="text-xs text-gray-400">Instant results in seconds</p>
            </div>
          </div>

          {/* Tool type tabs — horizontally scrollable */}
          <div className="flex gap-2 mb-3 overflow-x-auto pb-1"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {QUICK_TOOLS.map(t => (
              <button
                key={t.tool}
                onClick={() => { setQuickTool(t.tool); setQuickResult('') }}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  quickTool === t.tool
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Textarea — full width always */}
          <textarea
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 text-sm resize-none outline-none transition-all focus:border-indigo-400 focus:bg-white leading-relaxed"
            style={{ boxShadow: 'none' }}
            rows={3}
            placeholder={QUICK_TOOLS.find(t => t.tool === quickTool)?.placeholder}
            value={quickInput}
            onChange={e => setQuickInput(e.target.value)}
          />

          {/* Run button — full width on mobile */}
          <button
            onClick={runQuick}
            disabled={quickRunning}
            className="mt-3 w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-bold text-sm transition-all disabled:opacity-60"
            style={{
              background: quickRunning ? '#818cf8' : 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              boxShadow: quickRunning ? 'none' : '0 4px 14px rgba(79,70,229,0.35)'
            }}
          >
            {quickRunning
              ? <><span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin inline-block" /> Running...</>
              : <><Sparkles className="w-4 h-4" /> Run Now</>
            }
          </button>

          {/* Result */}
          <AnimatePresence>
            {quickResult && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4 relative"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Result</p>
                  <button
                    onClick={copyResult}
                    className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                      copied ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {copied ? <><Check className="w-3 h-3" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy</>}
                  </button>
                </div>
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 max-h-56 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">{quickResult}</pre>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ─── AI TOOLS GRID ─── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-bold text-lg text-gray-900">🤖 AI Tools</h2>
            <span className="text-xs text-gray-400 font-medium">{AI_TOOLS.length} tools</span>
          </div>

          {/* 2 cols mobile → 3 cols sm → 4 cols lg */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {AI_TOOLS.map((tool, i) => (
              <motion.div
                key={tool.href}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.04 }}
              >
                <Link
                  href={tool.href}
                  className={`relative flex flex-col h-full bg-white rounded-2xl border p-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:scale-95 ${tool.border}`}
                >
                  {/* Pro badge */}
                  {!tool.free && !isPro && (
                    <span className="absolute top-2.5 right-2.5 bg-gradient-to-r from-yellow-400 to-amber-500 text-yellow-900 text-[9px] font-black px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                      <Crown className="w-2.5 h-2.5" /> PRO
                    </span>
                  )}

                  {/* Icon */}
                  <div className={`w-10 h-10 ${tool.iconBg} rounded-xl flex items-center justify-center mb-3 flex-shrink-0`}>
                    <span className="text-xl leading-none">{tool.icon}</span>
                  </div>

                  <h3 className="font-display font-bold text-sm text-gray-900 leading-snug mb-1 pr-6">{tool.label}</h3>
                  <p className="text-[11px] text-gray-400 leading-relaxed flex-1">{tool.desc}</p>
                  <div className="flex items-center gap-1 mt-3 text-xs font-bold text-indigo-600">
                    Open <ArrowRight className="w-3 h-3" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ─── STREAK + START HERE ─── */}
        {/* Stack on mobile, side-by-side on sm+ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Streak card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl border border-orange-100 p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <Flame className="w-5 h-5 text-orange-500" />
              <h3 className="font-display font-bold text-gray-900">Daily Streak 🔥</h3>
            </div>
            <div className="flex items-center gap-4 mb-4">
              <span className="font-display font-black text-6xl text-orange-500 leading-none">{dayStreak}</span>
              <div>
                <p className="font-bold text-gray-900 text-sm">Days in a row</p>
                <p className="text-xs text-gray-500 mt-0.5">Use any tool daily</p>
                <p className="text-xs text-orange-600 font-bold mt-1">+{xp} XP total 🌟</p>
              </div>
            </div>
            <Link
              href="/dashboard/achievements"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-white text-sm font-bold active:opacity-80 transition-all"
              style={{ background: 'linear-gradient(135deg, #f97316, #f59e0b)', boxShadow: '0 4px 12px rgba(249,115,22,0.3)' }}
            >
              <Trophy className="w-4 h-4" /> View Achievements
            </Link>
          </motion.div>

          {/* Start here card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.42 }}
            className="bg-white rounded-2xl border border-gray-100 p-5"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
          >
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              <h3 className="font-display font-bold text-gray-900">🚀 Start Here</h3>
            </div>
            <div className="space-y-1">
              {START_LINKS.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-indigo-50 active:bg-indigo-100 transition-all group"
                >
                  <span className="text-sm font-medium text-gray-700">{item.label}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                </Link>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ─── UPGRADE CTA (free users only) ─── */}
        {!isPro && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.48 }}
            className="relative overflow-hidden rounded-2xl p-5 text-white"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed, #ec4899)' }}
          >
            <div className="absolute inset-0 opacity-[0.06]"
              style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
            <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <Crown className="w-4 h-4 text-yellow-300" />
                  <span className="font-black text-yellow-300 text-xs uppercase tracking-widest">Unlock Pro</span>
                </div>
                <h3 className="font-display font-black text-lg leading-snug mb-1">Get 10× More from Textife</h3>
                <p className="text-indigo-200 text-xs leading-relaxed">
                  2,000 AI replies · 3 WhatsApp bots · All 24 Pro prompts · Priority AI speed
                </p>
              </div>
              <Link
                href="/dashboard/billing"
                className="flex-shrink-0 flex items-center gap-2 bg-white text-indigo-700 rounded-xl px-5 py-3 font-black text-sm hover:bg-indigo-50 active:bg-indigo-100 transition-all shadow-lg w-full sm:w-auto justify-center"
              >
                Upgrade Now <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        )}

      </div>
    </DashboardLayout>
  )
}
