'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { useAuth, apiFetch } from '@/hooks/useAuth'
import { motion } from 'framer-motion'
import {
  Lightbulb, DollarSign, PenTool, MessageCircle, Heart, Zap, BookOpen,
  Trophy, Flame, TrendingUp, ArrowRight, Sparkles, Bot, BarChart3
} from 'lucide-react'
import toast from 'react-hot-toast'

const AI_TOOLS = [
  { icon: Lightbulb,     label: 'Business Ideas',   desc: 'Startup & side hustle ideas',         href: '/dashboard/ideas',      iconBg: 'bg-yellow-50',   iconColor: 'text-yellow-600' },
  { icon: DollarSign,    label: 'Money Maker',      desc: 'Find ways to earn today',             href: '/dashboard/money',      iconBg: 'bg-green-50',    iconColor: 'text-green-600' },
  { icon: PenTool,       label: 'Content Hub',      desc: 'Blog, social, email copy',            href: '/dashboard/content',    iconBg: 'bg-purple-50',   iconColor: 'text-purple-600' },
  { icon: MessageCircle, label: 'Sales Messages',   desc: 'Messages that close deals',           href: '/dashboard/sales',      iconBg: 'bg-blue-50',     iconColor: 'text-blue-600' },
  { icon: Heart,         label: 'Personal Growth',  desc: 'Daily planner, habits, motivation',   href: '/dashboard/growth',     iconBg: 'bg-pink-50',     iconColor: 'text-pink-600' },
  { icon: Zap,           label: 'Quick Tools',      desc: 'Summarize, rewrite, translate',       href: '/dashboard/quicktools', iconBg: 'bg-amber-50',    iconColor: 'text-amber-600' },
  { icon: BookOpen,      label: 'Prompt Library',   desc: '15 powerful AI prompts',              href: '/dashboard/prompts',    iconBg: 'bg-indigo-50',   iconColor: 'text-indigo-600' },
  { icon: Bot,           label: 'WhatsApp Bots',    desc: 'AI customer automation',              href: '/dashboard/bots',       iconBg: 'bg-teal-50',     iconColor: 'text-teal-600' },
]

const QUICK_TOOLS = [
  { label: '📝 Summarize', tool: 'summarize', placeholder: 'Paste text to summarize...' },
  { label: '💡 Ideas',     tool: 'ideas',     placeholder: 'Topic to brainstorm...' },
  { label: '✏️ Rewrite',   tool: 'rewrite',   placeholder: 'Text to rewrite...' },
]

export default function DashboardPage() {
  const { user, loading, logout } = useAuth()
  const [streak, setStreak]           = useState<any>(null)
  const [analytics, setAnalytics]     = useState<any>(null)
  const [quickInput, setQuickInput]   = useState('')
  const [quickTool, setQuickTool]     = useState('summarize')
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
      const res = await apiFetch('/api/ai/quicktools', { method: 'POST', body: JSON.stringify({ tool: quickTool, input: quickInput }) })
      setQuickResult(res.result || '')
      apiFetch('/api/ai/streak', { method: 'POST', body: JSON.stringify({ action: 'use_tool' }) })
    } catch (e: any) { toast.error(e.message) }
    finally { setQuickRunning(false) }
  }

  const copy = (text: string) => { navigator.clipboard.writeText(text); toast.success('Copied!') }
  if (loading || !user) return <div className="min-h-screen flex items-center justify-center"><div className="spinner w-8 h-8" /></div>

  const firstName = user.fullName?.split(' ')[0] || 'there'
  const xp = streak?.xp || 0
  const currentStreak = streak?.streak || 0

  return (
    <DashboardLayout user={user} onLogout={logout}>
      <div className="max-w-5xl space-y-6">

        {/* Welcome Hero */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-primary-600 via-primary-700 to-purple-700 rounded-2xl p-6 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-primary-200 text-sm mb-1">Welcome back 👋</p>
              <h1 className="font-display font-bold text-2xl md:text-3xl mb-1">Hello, {firstName}!</h1>
              <p className="text-primary-200 text-sm">Your AI super toolbox is ready.</p>
              <div className="flex items-center gap-3 mt-4 flex-wrap">
                <div className="flex items-center gap-1.5 bg-white/10 rounded-xl px-3 py-1.5">
                  <Flame className="w-4 h-4 text-orange-300" />
                  <span className="text-sm font-bold">{currentStreak} day streak</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/10 rounded-xl px-3 py-1.5">
                  <Zap className="w-4 h-4 text-yellow-300" />
                  <span className="text-sm font-bold">{xp} XP</span>
                </div>
                <span className={`badge text-xs font-bold ${user.plan === 'FREE' ? 'bg-white/20 text-white' : 'bg-yellow-300 text-yellow-800'}`}>{user.plan}</span>
              </div>
            </div>
            <div className="hidden md:flex flex-col gap-2">
              <Link href="/dashboard/achievements" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all">
                <Trophy className="w-4 h-4 text-yellow-300" /> Achievements
              </Link>
              <Link href="/dashboard/analytics" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all">
                <BarChart3 className="w-4 h-4 text-blue-300" /> Analytics
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Upgrade banner */}
        {user.plan === 'FREE' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="card p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚡</span>
              <div>
                <p className="font-bold text-amber-900 text-sm">Unlock all AI tools — Upgrade to Pro</p>
                <p className="text-xs text-amber-700">2,000 AI uses/month · Advanced analytics · Premium features</p>
              </div>
            </div>
            <Link href="/dashboard/billing" className="btn-primary text-sm py-2 px-4 whitespace-nowrap flex-shrink-0" style={{ background: 'linear-gradient(135deg,#f59e0b,#f97316)' }}>
              Upgrade $19/mo
            </Link>
          </motion.div>
        )}

        {/* Quick AI Tool */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-primary-600" />
            <h2 className="font-display font-bold text-gray-900">Quick AI Tool</h2>
            <span className="badge badge-blue text-xs">Instant</span>
          </div>
          <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
            {QUICK_TOOLS.map(t => (
              <button key={t.tool} onClick={() => { setQuickTool(t.tool); setQuickInput(''); setQuickResult('') }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${quickTool === t.tool ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {t.label}
              </button>
            ))}
            <Link href="/dashboard/quicktools" className="px-3 py-1.5 rounded-xl text-xs font-semibold text-primary-600 bg-primary-50 hover:bg-primary-100 transition-all whitespace-nowrap">
              + 5 more tools
            </Link>
          </div>
          <div className="flex gap-2">
            <input className="input-field flex-1"
              value={quickInput} onChange={e => setQuickInput(e.target.value)}
              placeholder={QUICK_TOOLS.find(t => t.tool === quickTool)?.placeholder}
              onKeyDown={e => e.key === 'Enter' && runQuick()} />
            <button onClick={runQuick} disabled={quickRunning} className="btn-primary px-4 py-2.5 whitespace-nowrap">
              {quickRunning ? <span className="spinner" /> : <><Sparkles className="w-4 h-4" /> Run</>}
            </button>
          </div>
          {quickResult && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-3 bg-gray-50 rounded-xl p-4 relative">
              <button onClick={() => copy(quickResult)} className="absolute top-3 right-3 text-xs text-gray-400 hover:text-gray-700 bg-white border border-gray-200 rounded-lg px-2 py-1 transition-all">Copy</button>
              <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed pr-14 max-h-48 overflow-y-auto">{quickResult}</pre>
            </motion.div>
          )}
        </motion.div>

        {/* AI Tools Grid */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-bold text-lg text-gray-900">🤖 AI Tools</h2>
            <span className="text-sm text-gray-400">{AI_TOOLS.length} tools</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {AI_TOOLS.map((tool, i) => {
              const Icon = tool.icon
              return (
                <motion.div key={tool.href} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.04 }}>
                  <Link href={tool.href} className="block card p-4 hover:shadow-md hover:-translate-y-0.5 transition-all h-full">
                    <div className={`w-9 h-9 ${tool.iconBg} rounded-xl flex items-center justify-center mb-3`}>
                      <Icon className={`w-4 h-4 ${tool.iconColor}`} />
                    </div>
                    <h3 className="font-display font-bold text-sm text-gray-900 leading-snug mb-1">{tool.label}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed mb-3">{tool.desc}</p>
                    <span className="flex items-center gap-1 text-xs font-semibold text-primary-600">
                      Open <ArrowRight className="w-3 h-3" />
                    </span>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Stats + Streak */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Messages Sent', val: analytics?.totalReplies ?? '—', icon: '💬', bg: 'bg-blue-50', color: 'text-blue-700' },
            { label: 'Day Streak',    val: `${currentStreak} 🔥`,          icon: '🔥', bg: 'bg-orange-50', color: 'text-orange-700' },
            { label: 'Total XP',      val: `${xp}`,                        icon: '⚡', bg: 'bg-yellow-50', color: 'text-yellow-700' },
            { label: 'Badges',        val: streak?.badges?.length ?? 0,    icon: '🏅', bg: 'bg-purple-50', color: 'text-purple-700' },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.35 + i * 0.06 }}
              className={`card p-4 ${s.bg} border-0`}>
              <p className={`font-display font-black text-2xl ${s.color}`}>{s.val}</p>
              <p className="text-xs text-gray-600 mt-1 font-medium">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Bottom row */}
        <div className="grid md:grid-cols-2 gap-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
            className="card p-5 bg-gradient-to-br from-orange-50 to-amber-50 border-orange-100">
            <div className="flex items-center gap-2 mb-3">
              <Flame className="w-5 h-5 text-orange-500" />
              <h3 className="font-display font-bold text-gray-900">Daily Streak</h3>
            </div>
            <div className="flex items-center gap-4 mb-4">
              <p className="font-display font-black text-5xl text-orange-500">{currentStreak}</p>
              <div>
                <p className="font-semibold text-gray-900">Days in a row</p>
                <p className="text-xs text-gray-500 mt-0.5">Use any tool daily to keep streak</p>
              </div>
            </div>
            <Link href="/dashboard/achievements" className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-orange-500 text-white text-sm font-bold hover:bg-orange-600 transition-all">
              <Trophy className="w-4 h-4" /> View All Achievements
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="card p-5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-primary-600" />
              <h3 className="font-display font-bold text-gray-900">Start Here</h3>
            </div>
            <div className="space-y-1.5">
              {[
                { label: '🚀 Generate a Business Idea', href: '/dashboard/ideas' },
                { label: '💰 Find Ways to Make Money',  href: '/dashboard/money' },
                { label: '📝 Create Content Instantly', href: '/dashboard/content' },
                { label: '💬 Write a Sales Message',    href: '/dashboard/sales' },
                { label: '⚡ Use a Quick Tool',          href: '/dashboard/quicktools' },
              ].map(item => (
                <Link key={item.href} href={item.href}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 transition-all group">
                  <span className="text-sm font-medium text-gray-700">{item.label}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all" />
                </Link>
              ))}
            </div>
          </motion.div>
        </div>

      </div>
    </DashboardLayout>
  )
}
