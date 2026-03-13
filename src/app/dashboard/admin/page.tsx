'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { useAuth, apiFetch } from '@/hooks/useAuth'
import { Shield, Users, Ban, Search, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

export default function AdminPage() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  const [users, setUsers]   = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    if (!user) return
    if (user.role !== 'ADMIN') { router.replace('/dashboard'); return }
    apiFetch('/api/users').then(d => { setUsers(d.users); setFetching(false) }).catch(() => setFetching(false))
  }, [user, router])

  const banUser = async (id: string, ban: boolean) => {
    try {
      await apiFetch(`/api/users/${id}/ban`, { method: 'PATCH', body: JSON.stringify({ ban }) })
      setUsers(us => us.map(u => u.id === id ? { ...u, isBanned: ban } : u))
      toast.success(ban ? 'User banned' : 'User unbanned')
    } catch (e: any) { toast.error(e.message) }
  }

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center"><div className="spinner w-8 h-8" /></div>

  const filtered = users.filter(u =>
    u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.username?.toLowerCase().includes(search.toLowerCase())
  )

  const stats = [
    { label: 'Total Users',     val: users.length },
    { label: 'Pro Users',       val: users.filter(u => u.plan === 'PRO').length },
    { label: 'Business Users',  val: users.filter(u => u.plan === 'BUSINESS').length },
    { label: 'Banned',          val: users.filter(u => u.isBanned).length },
  ]

  return (
    <DashboardLayout user={user} onLogout={logout}>
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center"><Shield className="w-5 h-5 text-red-600" /></div>
          <div><h1 className="font-display font-bold text-2xl text-gray-900">Admin Panel</h1><p className="text-sm text-gray-500">Manage users and platform</p></div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className="card p-5">
              <div className="font-display font-bold text-3xl text-gray-900 mb-1">{s.val}</div>
              <div className="text-sm text-gray-500">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Users table */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-display font-bold text-gray-900">All Users</h2>
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 w-52" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50">
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Plan</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Bots</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-100">
                {fetching ? (
                  <tr><td colSpan={6} className="text-center py-10 text-gray-400 text-sm">Loading users...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-10 text-gray-400 text-sm">No users found</td></tr>
                ) : filtered.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-primary-600">{u.fullName?.[0]?.toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{u.fullName}</p>
                          <p className="text-xs text-gray-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`badge ${u.plan === 'BUSINESS' ? 'badge-purple' : u.plan === 'PRO' ? 'badge-blue' : 'badge-gray'}`}>{u.plan}</span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-700">{u._count?.botInstances ?? 0}</td>
                    <td className="px-5 py-3.5">
                      <span className={`badge ${u.isBanned ? 'badge-red' : 'badge-green'}`}>{u.isBanned ? 'Banned' : 'Active'}</span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 text-xs">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</td>
                    <td className="px-5 py-3.5">
                      {u.id !== user.id && (
                        <button onClick={() => banUser(u.id, !u.isBanned)}
                          className={`flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${
                            u.isBanned ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-red-50 text-red-600 hover:bg-red-100'
                          }`}>
                          <Ban className="w-3 h-3" />{u.isBanned ? 'Unban' : 'Ban'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
