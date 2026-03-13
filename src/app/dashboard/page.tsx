'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { useAuth, apiFetch } from '@/hooks/useAuth'
import { motion } from 'framer-motion'
import {
  Lightbulb, DollarSign, PenTool, MessageCircle, Heart, Zap, BookOpen,
  Trophy, Flame, TrendingUp, ArrowRight, Sparkles, Bot, BarChart3, Crown, Lock
} from 'lucide-react'
import toast from 'react-hot-toast'

const AI_TOOLS = [
  { icon: '💡', label: 'Business Ideas',  desc: 'Startup & side hustle ideas',       href: '/dashboard/ideas',      gradient: 'from-yellow-400 to-orange-500',  free: true },
  { icon: '💰', label: 'Money Maker',     desc: 'Find ways to earn today',           href: '/dashboard/money',      gradient: 'from-green-400 to-emerald-600',  free: true },
  { icon: '✍️', label: 'Content Hub',     desc: 'Blog, social, email copy',          href: '/dashboard/content',    gradient: 'from-purple-500 to-pink-600',    free: true },
  { icon: '📣', label: 'Sales Messages',  desc: 'Messages that close deals',         href: '/dashboard/sales',      gradient: 'from-blue-500 to-cyan-600',      free: true },
  { icon: '🌱', label: 'Personal Growth', desc: 'Daily planner & motivation',        href: '/dashboard/growth',     gradient: 'from-rose-400 to-pink-600',      free: true },
  { icon: '⚡', label: 'Quick Tools',     desc: 'Summarize, rewrite, translate',     href: '/dashboard/quicktools', gradient: 'from-amber-400 to-yellow-600',   free: true },
  { icon: '📚', label: 'Prompt Library',  desc: '24 powerful fill-in AI prompts',    href: '/dashboard/prompts',    gradient: 'from-indigo-500 to-purple-600',  free: false },
  { icon: '🤖', label: 'WhatsApp Bots',   desc: 'AI customer automation',            href: '/dashboard/bots',       gradient: 'from-teal-500 to-cyan-600',      free: false },
]

const QUICK_TOOLS = [
  { label: '📝 Summarize', tool: 'summarize', placeholder: 'Paste any text to get a crisp summary...' },
  { label: '💡 Brainstorm', tool: 'ideas',    placeholder: 'Enter a topic to generate creative ideas...' },
  { label: '✏️ Rewrite',   tool: 'rewrite',   placeholder: 'Paste text to make it more compelling...' },
  { label: '🌍 Translate', tool: 'translate', placeholder: 'Paste text + specify target language...' },
]

export default function DashboardPage() {
  const { user, loading, logout } = useAuth()
  const [streak, setStreak]         = useState<any>(null)
  const [analytics, setAnalytics]   = useState<any>(null)
  const [quickInput, setQuickInput] = useState('')
  const [quickTool, setQuickTool]   = useState('summarize')
  const [quickResult, setQuickResult] = useState('')
  const [quickRunning, setQuickRunning] = useState(false)

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

  const copy = (text: string) => { navigator.clipboard.writeText(text); toast.success('Copied!') }

  if (loading || !user) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse shadow-xl">
          <Zap className="w-8 h-8 text-white fill-white" />
        </div>
        <p className="text-gray-500 font-medium">Loading your workspace...</p>
      </div>
    </div>
  )

  const firstName = user.fullName?.split(' ')[0] || 'there'
  const xp = streak?.xp || 0
  const currentStreak = streak?.streak || 0
  const isPro = user.plan === 'PRO' || user.plan === 'BUSINESS'

  return (
    <DashboardLayout user={user} onLogout={logout}>
      <div className="max-w-5xl space-y-6 page-enter">

        {/* Welcome Hero */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl p-5 sm:p-7 text-white"
          style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #ec4899 100%)' }}>
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
          }} />
          <div className="relative">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <p className="text-indigo-200 text-sm mb-1">Welcome back 👋</p>
                <h1 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl mb-2 text-balance">
                  Hello, {firstName}! ✨
                </h1>
                <p className="text-indigo-200 text-sm sm:text-base max-w-sm">Your AI-powered growth engine is ready to work for you.</p>
              </div>
              {!isPro && (
                <Link href="/dashboard/billing"
                  className="flex items-center gap-2 bg-yellow-400 text-yellow-900 rounded-xl px-4 py-2.5 font-black text-sm hover:bg-yellow-300 transition-all shadow-lg self-start flex-shrink-0">
                  <Crown className="w-4 h-4" /> Go Pro
                </Link>
              )}
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-2 mt-5 flex-wrap">
              {[
                { icon: '🔥', val: `${currentStreak} days`, label: 'Streak' },
                { icon: '⚡', val: `${xp} XP`, label: 'Earned' },
                { icon: '💬', val: analytics?.totalReplies ?? '0', label: 'Replies' },
                { icon: '🏅', val: streak?.badges?.length ?? 0, label: 'Badges' },
              ].map(s => (
                <div key={s.label} className="bg-white/15 backdrop-blur-sm rounded-xl px-3 py-2 flex items-center gap-2">
                  <span className="text-base">{s.icon}</span>
                  <div>
                    <p className="font-black text-sm leading-none">{s.val}</p>
                    <p className="text-[10px] text-indigo-200">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Quick Tool */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
          className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
              <Zap className="w-4 h-4 text-white fill-white" />
            </div>
            <div>
              <h2 className="font-display font-bold text-base text-gray-900">Quick AI Tool</h2>
              <p className="text-xs text-gray-400">Instant results in seconds</p>
            </div>
          </div>

          {/* Tool tabs */}
          <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1 scrollbar-hide">
            {QUICK_TOOLS.map(t => (
              <button key={t.tool} onClick={() => setQuickTool(t.tool)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                  quickTool === t.tool ? 'bg-indigo-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}>
                {t.label}
              </button>
            ))}
          </div>

          <textarea
            className="input-field resize-none text-sm leading-relaxed"
            rows={3}
            placeholder={QUICK_TOOLS.find(t => t.tool === quickTool)?.placeholder}
            value={quickInput}
            onChange={e => setQuickInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) runQuick() }}
          />
          <button onClick={runQuick} disabled={quickRunning}
            className="mt-3 w-full sm:w-auto btn-primary text-sm">
            {quickRunning ? <><span className="spinner" />Running...</> : <><Sparkles className="w-4 h-4" /> Run Now</>}
          </button>

          {quickResult && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-3 result-box relative">
              <button onClick={() => copy(quickResult)}
                className="absolute top-3 right-3 text-xs text-gray-400 hover:text-gray-700 bg-white border border-gray-200 rounded-lg px-2.5 py-1 transition-all shadow-sm">
                Copy
              </button>
              <pre className="pr-16">{quickResult}</pre>
            </motion.div>
          )}
        </motion.div>

        {/* AI Tools Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display font-bold text-lg text-gray-900">🤖 All AI Tools</h2>
              <p className="text-xs text-gray-400 mt-0.5">{AI_TOOLS.length} powerful tools at your fingertips</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {AI_TOOLS.map((tool, i) => (
              <motion.div key={tool.href} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 + i * 0.04 }}>
                <Link href={tool.href}
                  className="relative block bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 overflow-hidden group h-full">
                  {!tool.free && !isPro && (
                    <div className="absolute top-2.5 right-2.5 bg-gradient-to-r from-yellow-400 to-amber-500 text-yellow-900 px-1.5 py-0.5 rounded-full text-[9px] font-black flex items-center gap-0.5">
                      <Crown className="w-2.5 h-2.5" /> PRO
                    </div>
                  )}
                  {/* Gradient circle bg */}
                  <div className={`absolute -top-8 -right-8 w-20 h-20 bg-gradient-to-br ${tool.gradient} opacity-8 rounded-full blur-xl transition-opacity group-hover:opacity-15`} />
                  <span className="text-2xl mb-3 block">{tool.icon}</span>
                  <h3 className="font-display font-bold text-sm text-gray-900 leading-snug mb-1">{tool.label}</h3>
                  <p className="text-[11px] text-gray-400 leading-relaxed mb-3">{tool.desc}</p>
                  <span className="flex items-center gap-1 text-xs font-bold text-indigo-600">
                    Open <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom row: Streak + Start Here */}
        <div className="grid sm:grid-cols-2 gap-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="card p-5 bg-gradient-to-br from-orange-50 to-amber-50 border-orange-100">
            <div className="flex items-center gap-2 mb-4">
              <Flame className="w-5 h-5 text-orange-500" />
              <h3 className="font-display font-bold text-gray-900">Daily Streak 🔥</h3>
            </div>
            <div className="flex items-center gap-4 mb-5">
              <p className="font-display font-black text-5xl sm:text-6xl text-orange-500 leading-none">{currentStreak}</p>
              <div>
                <p className="font-bold text-gray-900">Days in a row</p>
                <p className="text-xs text-gray-500 mt-0.5">Use any AI tool daily to maintain</p>
                <p className="text-xs text-orange-600 font-semibold mt-1">+{xp} XP earned 🌟</p>
              </div>
            </div>
            <Link href="/dashboard/achievements"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-white text-sm font-bold transition-all"
              style={{ background: 'linear-gradient(135deg, #f97316, #f59e0b)', boxShadow: '0 4px 12px rgba(249,115,22,0.3)' }}>
              <Trophy className="w-4 h-4" /> View All Achievements
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
            className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              <h3 className="font-display font-bold text-gray-900">🚀 Start Here</h3>
            </div>
            <div className="space-y-1">
              {[
                { label: '🚀 Generate a Business Idea',  href: '/dashboard/ideas' },
                { label: '💰 Find Ways to Make Money',   href: '/dashboard/money' },
                { label: '📝 Create Content Instantly',  href: '/dashboard/content' },
                { label: '💬 Write a Sales Message',     href: '/dashboard/sales' },
                { label: '📚 Browse Prompt Library',     href: '/dashboard/prompts' },
              ].map(item => (
                <Link key={item.href} href={item.href}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-indigo-50 transition-all group">
                  <span className="text-sm font-medium text-gray-700">{item.label}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                </Link>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Upgrade CTA - shown only to free users */}
        {!isPro && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="relative overflow-hidden rounded-2xl p-6 text-white"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed, #ec4899)' }}>
            <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
            <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="w-5 h-5 text-yellow-300" />
                  <span className="font-black text-yellow-300 text-sm uppercase tracking-wider">Unlock Pro</span>
                </div>
                <h3 className="font-display font-black text-xl mb-1">Get 10× More from Textife</h3>
                <p className="text-indigo-200 text-sm">2,000 AI replies · 3 WhatsApp bots · All 24 Pro prompts · Priority AI</p>
              </div>
              <Link href="/dashboard/billing"
                className="flex items-center gap-2 bg-white text-indigo-700 rounded-xl px-6 py-3.5 font-black text-sm hover:bg-indigo-50 transition-all shadow-xl flex-shrink-0">
                Upgrade Now <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        )}

      </div>
    </DashboardLayout>
  )
}
