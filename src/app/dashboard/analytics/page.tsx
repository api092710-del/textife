'use client'
import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { useAuth, apiFetch } from '@/hooks/useAuth'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { motion } from 'framer-motion'
import { TrendingUp, MessageSquare, Users, DollarSign, Zap } from 'lucide-react'

const COLORS = ['#2563EB', '#10B981', '#F59E0B']

export default function AnalyticsPage() {
  const { user, loading, logout } = useAuth()
  const [data, setData]   = useState<any>(null)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    if (!user) return
    apiFetch('/api/analytics').then(d => { setData(d); setFetching(false) }).catch(() => setFetching(false))
  }, [user])

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center"><div className="spinner w-8 h-8" /></div>

  const s = data?.summary
  const daily = data?.daily ?? []

  const summaryCards = [
    { label: 'Total Messages', val: s?.messagesHandled ?? 0,    icon: MessageSquare, color: 'bg-blue-50 text-blue-600',   change: '+18%' },
    { label: 'Total Leads',    val: s?.leadsCaptures   ?? 0,    icon: Users,         color: 'bg-green-50 text-green-600', change: '+28%' },
    { label: 'Revenue Est.',   val: `$${Math.round(s?.revenueEst ?? 0).toLocaleString()}`, icon: DollarSign, color: 'bg-purple-50 text-purple-600', change: '+22%' },
    { label: 'AI Requests',    val: s?.totalAiMessages ?? 0,    icon: Zap,           color: 'bg-orange-50 text-orange-600', change: '+5%' },
  ]

  const pieData = [
    { name: 'WhatsApp Bot', value: Math.max(data?.bots?.reduce((a: any, b: any) => a + b.leadsCaptures, 0) ?? 68, 1) },
    { name: 'AI Chat',      value: Math.max(s?.totalAiMessages ?? 20, 1) },
    { name: 'Manual',       value: 12 },
  ]

  return (
    <DashboardLayout user={user} onLogout={logout}>
      <div className="max-w-6xl space-y-5">
        <div>
          <h1 className="font-display font-bold text-2xl text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-500 mt-0.5">Track your bot performance and business growth</p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {summaryCards.map((c, i) => {
            const Icon = c.icon
            return (
              <motion.div key={c.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className="card p-5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${c.color}`}><Icon className="w-4 h-4" /></div>
                <div className="font-display font-bold text-2xl text-gray-900 mb-0.5">{c.val}</div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{c.label}</span>
                  <span className="text-xs font-semibold text-green-600 flex items-center gap-0.5"><TrendingUp className="w-3 h-3" />{c.change}</span>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 card p-6">
            <h3 className="font-display font-bold text-gray-900 mb-4">Daily Activity (Last 30 Days)</h3>
            {fetching ? (
              <div className="h-52 flex items-center justify-center text-gray-400 text-sm">Loading data...</div>
            ) : daily.length === 0 ? (
              <div className="h-52 flex items-center justify-center text-gray-400 text-sm">No activity data yet. Start using your bots!</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={daily.slice(-14).map((d: any) => ({ ...d, day: new Date(d.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }) }))} margin={{ top: 0, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', fontSize: '12px' }} />
                  <Bar dataKey="messages" fill="#2563EB" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="leads"    fill="#10B981" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="card p-6">
            <h3 className="font-display font-bold text-gray-900 mb-4">Lead Sources</h3>
            <ResponsiveContainer width="100%" height={170}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-3">
              {pieData.map((d, i) => (
                <div key={d.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i] }} />
                    <span className="text-gray-600">{d.name}</span>
                  </div>
                  <span className="font-semibold text-gray-900">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bots performance table */}
        {data?.bots?.length > 0 && (
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="font-display font-bold text-gray-900">Bot Performance</h3>
            </div>
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50">
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Bot Name</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Replies</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Leads</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-100">
                {data.bots.map((b: any) => (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-gray-900">{b.name}</td>
                    <td className="px-5 py-3"><span className={`badge ${b.status === 'ACTIVE' ? 'badge-green' : 'badge-gray'}`}>{b.status}</span></td>
                    <td className="px-5 py-3 text-gray-700">{b.totalReplies.toLocaleString()}</td>
                    <td className="px-5 py-3 text-gray-700">{b.leadsCaptures}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
