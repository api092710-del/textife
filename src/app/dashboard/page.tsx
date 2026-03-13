'use client'
import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { useAuth, apiFetch } from '@/hooks/useAuth'
import { motion } from 'framer-motion'
import { MessageSquare, Users, DollarSign, Bot, TrendingUp, Zap, ArrowRight, BarChart3, FileText } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function DashboardPage() {
  const { user, loading, logout } = useAuth()
  const [analytics, setAnalytics] = useState<any>(null)
  const [upgraded, setUpgraded]   = useState(false)

  useEffect(() => {
    const url = new URL(window.location.href)
    if (url.searchParams.get('upgraded')) {
      toast.success(`🎉 Plan upgraded successfully!`)
      setUpgraded(true)
      window.history.replaceState({}, '', '/dashboard')
    }
  }, [])

  useEffect(() => {
    if (!user) return
    apiFetch('/api/analytics').then(data => setAnalytics(data)).catch(() => {})
  }, [user])

  if (loading || !user) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center"><div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-3" /><p className="text-sm text-gray-500">Loading...</p></div>
    </div>
  )

  const s = analytics?.summary
  const stats = [
    { label: 'Messages Handled',  val: s?.messagesHandled ?? '—', icon: MessageSquare, color: 'bg-blue-50 text-blue-600',   change: '+12%' },
    { label: 'Leads Captured',    val: s?.leadsCaptures   ?? '—', icon: Users,         color: 'bg-green-50 text-green-600', change: '+28%' },
    { label: 'Revenue Est.',      val: s?.revenueEst ? `$${Math.round(s.revenueEst).toLocaleString()}` : '—', icon: DollarSign, color: 'bg-purple-50 text-purple-600', change: '+19%' },
    { label: 'Active Bots',       val: s?.activeBots      ?? '—', icon: Bot,           color: 'bg-orange-50 text-orange-600', change: `of ${analytics?.bots?.length ?? '—'}` },
  ]

  const chartData = analytics?.daily?.map((d: any) => ({
    day: new Date(d.date).toLocaleDateString('en', { weekday: 'short' }),
    messages: d.messages,
    leads:    d.leads,
  })) ?? []

  return (
    <DashboardLayout user={user} onLogout={logout}>
      <div className="space-y-6 max-w-6xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display font-bold text-2xl text-gray-900">Welcome back, {user.fullName.split(' ')[0]} 👋</h1>
          <p className="text-gray-500 text-sm mt-1">Here's your business performance at a glance.</p>
        </motion.div>

        {/* Upgrade banner */}
        {user.plan === 'FREE' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
            className="bg-gradient-to-r from-primary-600 to-blue-700 rounded-2xl p-5 flex items-center justify-between">
            <div>
              <p className="text-white font-semibold">You're on the Free plan</p>
              <p className="text-blue-100 text-sm mt-0.5">Upgrade to Pro for 2,000 AI replies & 3 bots</p>
            </div>
            <Link href="/dashboard/billing" className="bg-white text-primary-600 font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-blue-50 transition-colors whitespace-nowrap">
              Upgrade Now →
            </Link>
          </motion.div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => {
            const Icon = s.icon
            return (
              <motion.div key={s.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className="card p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${s.color}`}><Icon className="w-4 h-4" /></div>
                  <span className="text-xs font-semibold text-green-600 flex items-center gap-0.5 bg-green-50 px-2 py-0.5 rounded-full">
                    <TrendingUp className="w-3 h-3" />{s.change}
                  </span>
                </div>
                <div className="font-display font-bold text-2xl text-gray-900">{s.val}</div>
                <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
              </motion.div>
            )
          })}
        </div>

        {/* Chart + Quick actions */}
        <div className="grid lg:grid-cols-3 gap-5">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-display font-bold text-gray-900">Weekly Activity</h3>
                <p className="text-xs text-gray-500 mt-0.5">Messages & leads this week</p>
              </div>
              <div className="flex gap-4 text-xs">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-primary-600 rounded-full" />Messages</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-emerald-400 rounded-full" />Leads</span>
              </div>
            </div>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gM" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2563EB" stopOpacity={0.15}/><stop offset="95%" stopColor="#2563EB" stopOpacity={0}/></linearGradient>
                    <linearGradient id="gL" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10B981" stopOpacity={0.15}/><stop offset="95%" stopColor="#10B981" stopOpacity={0}/></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', fontSize: '12px' }} />
                  <Area type="monotone" dataKey="messages" stroke="#2563EB" strokeWidth={2} fill="url(#gM)" />
                  <Area type="monotone" dataKey="leads"    stroke="#10B981" strokeWidth={2} fill="url(#gL)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
                Start using your bots to see activity here
              </div>
            )}
          </motion.div>

          {/* Quick actions */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="card p-5">
            <h3 className="font-display font-bold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { label: 'Ask AI Assistant',   desc: 'Get business guidance',  href: '/dashboard/chat',      color: 'hover:bg-blue-50 hover:text-blue-700',   icon: MessageSquare },
                { label: 'Create New Bot',     desc: 'Setup WhatsApp bot',     href: '/dashboard/bots',      color: 'hover:bg-purple-50 hover:text-purple-700', icon: Bot },
                { label: 'View Analytics',     desc: 'Check performance',      href: '/dashboard/analytics', color: 'hover:bg-green-50 hover:text-green-700',  icon: BarChart3 },
                { label: 'Browse Templates',   desc: 'Ready-made messages',    href: '/dashboard/templates', color: 'hover:bg-orange-50 hover:text-orange-700',icon: FileText },
              ].map(a => {
                const Icon = a.icon
                return (
                  <Link key={a.label} href={a.href} className={`flex items-center gap-3 p-3 rounded-xl transition-all group ${a.color}`}>
                    <Icon className="w-4 h-4 text-gray-500 group-hover:scale-110 transition-transform" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-700 group-hover:text-current">{a.label}</p>
                      <p className="text-xs text-gray-400">{a.desc}</p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                )
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  )
}


