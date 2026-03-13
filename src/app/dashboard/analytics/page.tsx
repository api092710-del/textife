'use client'
import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { useAuth, apiFetch } from '@/hooks/useAuth'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { motion } from 'framer-motion'
import { TrendingUp, MessageSquare, Users, DollarSign, Zap, Download, RefreshCw, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'

const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444']

export default function AnalyticsPage() {
  const { user, loading, logout } = useAuth()
  const [data, setData]       = useState<any>(null)
  const [fetching, setFetching] = useState(true)
  const [period, setPeriod]   = useState('30')

  const fetchData = () => {
    if (!user) return
    setFetching(true)
    apiFetch('/api/analytics').then(d => { setData(d); setFetching(false) }).catch(() => setFetching(false))
  }

  useEffect(() => { fetchData() }, [user])

  const exportReport = () => {
    if (!data) { toast.error('No data to export'); return }
    const s = data.summary
    const rows = [
      ['Metric', 'Value'],
      ['Messages Handled', s?.messagesHandled ?? 0],
      ['Leads Captured', s?.leadsCaptures ?? 0],
      ['Revenue Est.', `$${Math.round(s?.revenueEst ?? 0)}`],
      ['AI Requests', s?.totalAiMessages ?? 0],
    ]
    const csv = rows.map(r => r.join(',')).join('\n')
    const a = document.createElement('a')
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv)
    a.download = `textife-analytics-${Date.now()}.csv`
    a.click()
    toast.success('Report exported!')
  }

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center"><div className="spinner w-10 h-10 border-indigo-600" /></div>

  const s = data?.summary
  const daily = data?.daily ?? []

  const summaryCards = [
    { label: 'Total Messages', val: s?.messagesHandled ?? 0,   icon: MessageSquare, color: 'bg-blue-50 text-blue-600',    change: '+18%' },
    { label: 'Total Leads',    val: s?.leadsCaptures   ?? 0,   icon: Users,         color: 'bg-green-50 text-green-600',  change: '+28%' },
    { label: 'Revenue Est.',   val: `$${Math.round(s?.revenueEst ?? 0).toLocaleString()}`, icon: DollarSign, color: 'bg-purple-50 text-purple-600', change: '+22%' },
    { label: 'AI Requests',    val: s?.totalAiMessages ?? 0,   icon: Zap,           color: 'bg-orange-50 text-orange-600', change: '+5%' },
  ]

  const pieData = [
    { name: 'WhatsApp Bot', value: Math.max(data?.bots?.reduce((a: any, b: any) => a + b.leadsCaptures, 0) ?? 68, 1) },
    { name: 'AI Chat', value: Math.max(s?.totalAiMessages ?? 20, 1) },
    { name: 'Templates', value: 15 },
    { name: 'Manual', value: 12 },
  ]

  const growthData = [
    { month: 'Jan', revenue: 120, leads: 45 },
    { month: 'Feb', revenue: 280, leads: 78 },
    { month: 'Mar', revenue: 190, leads: 62 },
    { month: 'Apr', revenue: 410, leads: 95 },
    { month: 'May', revenue: 350, leads: 88 },
    { month: 'Jun', revenue: 520, leads: 120 },
  ]

  return (
    <DashboardLayout user={user} onLogout={logout}>
      <div className="max-w-6xl space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display font-bold text-2xl text-gray-900">Analytics</h1>
            <p className="text-sm text-gray-500 mt-0.5">Track your bot performance and business growth</p>
          </div>
          <div className="flex gap-2">
            <select className="input-field w-36 text-sm py-2" value={period} onChange={e => setPeriod(e.target.value)}>
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
            <button onClick={fetchData} className="btn-secondary text-sm py-2 px-3" disabled={fetching}>
              <RefreshCw className={`w-4 h-4 ${fetching ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={exportReport} className="btn-secondary text-sm py-2">
              <Download className="w-4 h-4" /> Export
            </button>
          </div>
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

        {/* Charts row 1 */}
        <div className="grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 card p-6">
            <h3 className="font-display font-bold text-gray-900 mb-4">Daily Activity</h3>
            {fetching ? (
              <div className="h-52 flex items-center justify-center text-gray-400 text-sm">Loading...</div>
            ) : daily.length === 0 ? (
              <div className="h-52 flex items-center justify-center text-gray-400 text-sm">No data yet. Start using your bots!</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={daily.slice(-14).map((d: any) => ({ ...d, day: new Date(d.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }) }))} margin={{ top: 0, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', fontSize: '12px' }} />
                  <Bar dataKey="messages" fill="#2563EB" radius={[3,3,0,0]} />
                  <Bar dataKey="leads" fill="#10B981" radius={[3,3,0,0]} />
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

        {/* Revenue growth chart */}
        <div className="card p-6">
          <h3 className="font-display font-bold text-gray-900 mb-4">Revenue & Lead Growth Trend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={growthData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', fontSize: '12px' }} />
              <Line type="monotone" dataKey="revenue" stroke="#7C3AED" strokeWidth={2.5} dot={{ fill: '#7C3AED', r: 4 }} />
              <Line type="monotone" dataKey="leads" stroke="#10B981" strokeWidth={2.5} dot={{ fill: '#10B981', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex gap-6 mt-3 justify-center text-xs">
            <span className="flex items-center gap-2"><span className="w-4 h-0.5 bg-purple-600 inline-block rounded" />Revenue ($)</span>
            <span className="flex items-center gap-2"><span className="w-4 h-0.5 bg-emerald-500 inline-block rounded" />Leads</span>
          </div>
        </div>

        {/* Bots performance */}
        {data?.bots?.length > 0 && (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-display font-bold text-gray-900">Bot Performance</h3>
              <span className="text-xs text-gray-400">{data.bots.length} bot{data.bots.length !== 1 ? 's' : ''}</span>
            </div>
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50">
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Bot Name</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Replies</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Leads</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Conv. Rate</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-100">
                {data.bots.map((b: any) => (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-gray-900">{b.name}</td>
                    <td className="px-5 py-3"><span className={`badge ${b.status === 'ACTIVE' ? 'badge-green' : 'badge-gray'}`}>{b.status}</span></td>
                    <td className="px-5 py-3 text-gray-700 font-medium">{b.totalReplies.toLocaleString()}</td>
                    <td className="px-5 py-3 text-green-600 font-bold">{b.leadsCaptures}</td>
                    <td className="px-5 py-3 text-gray-600">
                      {b.totalReplies > 0 ? `${((b.leadsCaptures / b.totalReplies) * 100).toFixed(1)}%` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
