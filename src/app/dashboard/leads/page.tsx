'use client'
import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { useAuth, apiFetch } from '@/hooks/useAuth'
import { motion } from 'framer-motion'
import { Users, Download, Search, Filter, Bot, Phone, Calendar, TrendingUp } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LeadsPage() {
  const { user, loading, logout } = useAuth()
  const [data, setData]       = useState<any>(null)
  const [search, setSearch]   = useState('')
  const [filter, setFilter]   = useState('all')

  useEffect(() => {
    if (user) apiFetch('/api/leads').then(setData).catch(() => {})
  }, [user])

  const exportCSV = () => {
    if (!data?.leads?.length) { toast.error('No leads to export'); return }
    const rows = [['Bot Name', 'Phone', 'Leads', 'Replies', 'Status', 'Date']]
    data.leads.forEach((l: any) => rows.push([l.botName, l.phone || '', l.leads, l.replies, l.status, new Date(l.date).toLocaleDateString()]))
    const csv = rows.map(r => r.join(',')).join('\n')
    const a = document.createElement('a')
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv)
    a.download = `textife-leads-${Date.now()}.csv`
    a.click()
    toast.success('Leads exported!')
  }

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center"><div className="spinner w-8 h-8" /></div>

  const leads = data?.leads ?? []
  const filtered = leads.filter((l: any) =>
    (filter === 'all' || l.status === filter) &&
    (search === '' || l.botName.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <DashboardLayout user={user} onLogout={logout}>
      <div className="max-w-5xl space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display font-bold text-2xl text-gray-900">Leads</h1>
            <p className="text-sm text-gray-500 mt-0.5">All captured leads from your bots</p>
          </div>
          <button onClick={exportCSV} className="btn-secondary text-sm">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Leads', val: data?.total ?? 0, icon: Users, color: 'bg-green-50 text-green-600' },
            { label: 'Active Bots', val: leads.filter((l: any) => l.status === 'ACTIVE').length, icon: Bot, color: 'bg-blue-50 text-blue-600' },
            { label: 'Conversion Rate', val: leads.length > 0 ? `${Math.round((data?.total / leads.reduce((a: any, l: any) => a + l.replies, 0)) * 100) || 0}%` : '0%', icon: TrendingUp, color: 'bg-purple-50 text-purple-600' },
          ].map((s, i) => {
            const Icon = s.icon
            return (
              <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className="card p-4">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2 ${s.color}`}><Icon className="w-4 h-4" /></div>
                <div className="font-display font-bold text-xl text-gray-900">{s.val}</div>
                <div className="text-xs text-gray-500">{s.label}</div>
              </motion.div>
            )
          })}
        </div>

        {/* Filters */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input-field pl-9" placeholder="Search bots..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="input-field w-40" value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Bot</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Phone</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Leads</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Replies</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-12 text-center text-gray-400">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p>No leads yet. Activate your bots to start capturing leads.</p>
                </td></tr>
              ) : filtered.map((l: any) => (
                <tr key={l.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-gray-900 flex items-center gap-2">
                    <Bot className="w-4 h-4 text-primary-500" />{l.botName}
                  </td>
                  <td className="px-5 py-3 text-gray-600">{l.phone || '—'}</td>
                  <td className="px-5 py-3">
                    <span className="font-bold text-green-600">{l.leads}</span>
                  </td>
                  <td className="px-5 py-3 text-gray-600">{l.replies.toLocaleString()}</td>
                  <td className="px-5 py-3">
                    <span className={`badge ${l.status === 'ACTIVE' ? 'badge-green' : 'badge-gray'}`}>{l.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Export tip */}
        <p className="text-xs text-gray-400 text-center">
          💡 Export leads to CSV and import into Google Sheets, CRM, or email marketing tools
        </p>
      </div>
    </DashboardLayout>
  )
}
