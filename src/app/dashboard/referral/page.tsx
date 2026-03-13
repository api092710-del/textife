'use client'
import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { useAuth, apiFetch } from '@/hooks/useAuth'
import { motion } from 'framer-motion'
import { Gift, Copy, Users, DollarSign, Share2, CheckCircle, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ReferralPage() {
  const { user, loading, logout } = useAuth()
  const [data, setData] = useState<any>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (user) apiFetch('/api/referral').then(setData).catch(() => {})
  }, [user])

  const copy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center"><div className="spinner w-8 h-8" /></div>

  return (
    <DashboardLayout user={user} onLogout={logout}>
      <div className="max-w-2xl space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display font-bold text-2xl text-gray-900">Referral Program 🎁</h1>
          <p className="text-gray-500 text-sm mt-1">Invite friends and earn free months of Textife Pro</p>
        </motion.div>

        {/* Hero card */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="referral-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-display font-bold text-xl text-white">Earn 1 Free Month</h2>
              <p className="text-indigo-200 text-sm">For every friend who upgrades to Pro</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { label: 'You Invite', icon: '📨', desc: 'Share your link' },
              { label: 'They Sign Up', icon: '✅', desc: 'Friend joins free' },
              { label: 'Both Earn', icon: '🎁', desc: '1 month free each' },
            ].map(s => (
              <div key={s.label} className="bg-white/10 rounded-xl p-3 text-center">
                <div className="text-2xl mb-1">{s.icon}</div>
                <p className="text-white font-semibold text-xs">{s.label}</p>
                <p className="text-indigo-200 text-[10px]">{s.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Friends Referred', val: data?.referrals ?? 0, icon: Users, color: 'text-blue-600' },
            { label: 'Months Earned', val: data?.earnings ?? 0, icon: DollarSign, color: 'text-green-600' },
          ].map((s, i) => {
            const Icon = s.icon
            return (
              <motion.div key={s.label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 + i * 0.1 }} className="card p-5 text-center">
                <Icon className={`w-6 h-6 mx-auto mb-2 ${s.color}`} />
                <div className="font-display font-bold text-3xl text-gray-900">{s.val}</div>
                <div className="text-xs text-gray-500 mt-1">{s.label}</div>
              </motion.div>
            )
          })}
        </div>

        {/* Referral link */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card p-5">
          <h3 className="font-display font-bold text-gray-900 mb-4">Your Referral Link</h3>
          <div className="bg-gray-50 rounded-xl p-3 flex items-center justify-between gap-3 mb-3">
            <code className="text-xs text-gray-600 truncate flex-1">{data?.referralLink ?? 'Loading...'}</code>
            <button onClick={() => copy(data?.referralLink ?? '')} className="btn-primary text-xs px-3 py-1.5 whitespace-nowrap">
              {copied ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <p className="text-xs text-gray-400 mb-4">Your referral code: <strong className="text-gray-700">{data?.referralCode}</strong></p>

          {/* Share buttons */}
          <div className="flex gap-2">
            <a href={`https://wa.me/?text=Join%20Textife%20-%20AI%20WhatsApp%20automation!%20Use%20my%20link:%20${encodeURIComponent(data?.referralLink ?? '')}`}
              target="_blank" rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-50 text-green-700 text-sm font-semibold hover:bg-green-100 transition-all">
              <Share2 className="w-4 h-4" /> WhatsApp
            </a>
            <a href={`https://t.me/share/url?url=${encodeURIComponent(data?.referralLink ?? '')}&text=Join%20Textife!`}
              target="_blank" rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-50 text-blue-700 text-sm font-semibold hover:bg-blue-100 transition-all">
              <ExternalLink className="w-4 h-4" /> Telegram
            </a>
            <button onClick={() => copy(data?.referralLink ?? '')}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-50 text-gray-700 text-sm font-semibold hover:bg-gray-100 transition-all">
              <Copy className="w-4 h-4" /> Copy Link
            </button>
          </div>
        </motion.div>

        {/* Terms */}
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-xs text-amber-700">
          <strong>Terms:</strong> Referral rewards are credited after your friend upgrades to a paid plan and completes their first payment. Maximum 12 free months per account.
        </div>
      </div>
    </DashboardLayout>
  )
}
