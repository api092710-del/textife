'use client'
import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { useAuth, apiFetch } from '@/hooks/useAuth'
import { motion } from 'framer-motion'
import { Trophy, Flame, Star, Zap, Award, Target, TrendingUp, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const BADGES = [
  { id: 'week_warrior',   label: 'Week Warrior',    desc: '7-day streak',     icon: '🔥', color: 'from-orange-400 to-red-500' },
  { id: 'monthly_master', label: 'Monthly Master',  desc: '30-day streak',    icon: '👑', color: 'from-yellow-400 to-orange-500' },
  { id: 'century',        label: 'Century Club',    desc: 'Earned 100 XP',    icon: '💯', color: 'from-blue-400 to-purple-500' },
  { id: 'power_user',     label: 'Power User',      desc: 'Earned 500 XP',    icon: '⚡', color: 'from-purple-400 to-pink-500' },
  { id: 'content_king',   label: 'Content King',    desc: 'Used Content Hub',  icon: '✍️', color: 'from-pink-400 to-rose-500' },
  { id: 'money_maker',    label: 'Money Maker',     desc: 'Used Money Tool',   icon: '💰', color: 'from-green-400 to-emerald-500' },
  { id: 'idea_machine',   label: 'Idea Machine',    desc: 'Generated 10 ideas', icon: '💡', color: 'from-yellow-400 to-amber-500' },
  { id: 'sales_ninja',    label: 'Sales Ninja',     desc: 'Generated 5 messages', icon: '🥷', color: 'from-slate-400 to-gray-600' },
]

const MILESTONES = [
  { xp: 50,   label: 'Getting Started',  icon: '🌱' },
  { xp: 100,  label: 'Building Momentum', icon: '🚀' },
  { xp: 250,  label: 'On Fire',           icon: '🔥' },
  { xp: 500,  label: 'Power User',        icon: '⚡' },
  { xp: 1000, label: 'Elite Member',      icon: '👑' },
  { xp: 2500, label: 'Legend',            icon: '🏆' },
]

export default function AchievementsPage() {
  const { user, loading, logout } = useAuth()
  const [streak, setStreak]     = useState<any>(null)
  const [checkedIn, setCheckedIn] = useState(false)

  useEffect(() => {
    if (user) apiFetch('/api/ai/streak').then(setStreak).catch(() => {})
  }, [user])

  const checkIn = async () => {
    try {
      const res = await apiFetch('/api/ai/streak', { method: 'POST', body: JSON.stringify({ action: 'checkin' }) })
      setStreak(res); setCheckedIn(true)
      toast.success(res.message || `🔥 Day ${res.streak} streak!`)
    } catch (e: any) { toast.error(e.message) }
  }

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center"><div className="spinner w-8 h-8" /></div>

  const xp = streak?.xp || 0
  const currentMilestone = MILESTONES.filter(m => xp >= m.xp).pop() || MILESTONES[0]
  const nextMilestone = MILESTONES.find(m => xp < m.xp) || MILESTONES[MILESTONES.length - 1]
  const progress = nextMilestone ? Math.min((xp / nextMilestone.xp) * 100, 100) : 100
  const earnedBadges = streak?.badges || []

  return (
    <DashboardLayout user={user} onLogout={logout}>
      <div className="max-w-3xl space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center"><Trophy className="w-5 h-5 text-yellow-500" /></div>
          <div>
            <h1 className="font-display font-bold text-2xl text-gray-900">Achievements & Rewards</h1>
            <p className="text-gray-500 text-sm">Earn XP, build streaks, unlock badges</p>
          </div>
        </motion.div>

        {/* Daily check-in */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="card p-6 bg-gradient-to-br from-orange-500 to-red-600 border-0 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Flame className="w-6 h-6" />
                <span className="font-display font-bold text-2xl">{streak?.streak || 0} Day Streak</span>
              </div>
              <p className="text-orange-100 text-sm">Check in daily to keep your streak alive</p>
            </div>
            <button onClick={checkIn} disabled={checkedIn}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${checkedIn ? 'bg-white/20 text-white/70' : 'bg-white text-orange-600 hover:bg-orange-50'}`}>
              {checkedIn ? '✓ Checked In!' : '🔥 Check In Today'}
            </button>
          </div>
        </motion.div>

        {/* XP & Level */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{currentMilestone.icon}</span>
                <div>
                  <p className="font-display font-bold text-gray-900">{currentMilestone.label}</p>
                  <p className="text-xs text-gray-500">{xp} XP total</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Next: {nextMilestone.label}</p>
              <p className="text-sm font-bold text-primary-600">{nextMilestone.xp - xp} XP away</p>
            </div>
          </div>
          <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-primary-500 to-purple-600 rounded-full" />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>{xp} XP</span><span>{nextMilestone.xp} XP</span>
          </div>
        </motion.div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Current Streak', val: `${streak?.streak || 0} 🔥`, color: 'text-orange-600' },
            { label: 'Total XP', val: `${xp} ⚡`, color: 'text-purple-600' },
            { label: 'Badges Earned', val: `${earnedBadges.length} 🏅`, color: 'text-yellow-600' },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 + i * 0.07 }} className="card p-4 text-center">
              <p className={`font-display font-bold text-xl ${s.color}`}>{s.val}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Badges */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h2 className="font-display font-bold text-lg text-gray-900 mb-3">Badges</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {BADGES.map((badge, i) => {
              const earned = earnedBadges.includes(badge.id)
              return (
                <motion.div key={badge.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 + i * 0.05 }}
                  className={`card p-4 text-center transition-all ${earned ? 'border-yellow-200' : 'opacity-50 grayscale'}`}>
                  <div className={`w-12 h-12 mx-auto rounded-2xl flex items-center justify-center text-2xl mb-2 ${earned ? `bg-gradient-to-br ${badge.color}` : 'bg-gray-100'}`}>
                    {badge.icon}
                  </div>
                  <p className="text-xs font-bold text-gray-900">{badge.label}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">{badge.desc}</p>
                  {earned && <p className="text-[10px] text-green-600 font-bold mt-1">✓ Earned!</p>}
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* How to earn */}
        <div className="card p-5 bg-gradient-to-br from-primary-50 to-blue-50 border-primary-100">
          <h3 className="font-bold text-gray-900 mb-3">⚡ How to Earn XP</h3>
          <div className="space-y-2 text-sm text-gray-600">
            {[
              { action: 'Daily check-in', xp: 'Streak × 10 XP' },
              { action: 'Use any AI tool', xp: '+5 XP' },
              { action: 'Generate business idea', xp: '+5 XP' },
              { action: 'Create content', xp: '+5 XP' },
              { action: 'Use Quick Tools', xp: '+5 XP' },
            ].map(e => (
              <div key={e.action} className="flex items-center justify-between">
                <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" />{e.action}</span>
                <span className="font-bold text-primary-600">{e.xp}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
