'use client'
import { useState } from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { useAuth } from '@/hooks/useAuth'
import { motion } from 'framer-motion'
import { CheckCircle, Circle, Bot, MessageSquare, CreditCard, Zap, ArrowRight, ExternalLink } from 'lucide-react'
import Link from 'next/link'

const STEPS = [
  {
    id: 1, title: 'Create Your Account', desc: 'You already did this! Welcome aboard.', href: null,
    icon: Zap, done: true, action: 'Done ✓'
  },
  {
    id: 2, title: 'Create Your First Bot', desc: 'Set up a WhatsApp AI bot with a name and phone number.',
    href: '/dashboard/bots', icon: Bot, done: false, action: 'Create Bot →'
  },
  {
    id: 3, title: 'Try AI Chat Assistant', desc: 'Ask the AI anything about growing your business.',
    href: '/dashboard/chat', icon: MessageSquare, done: false, action: 'Open Chat →'
  },
  {
    id: 4, title: 'Browse Templates', desc: 'Pick a ready-made message template for your industry.',
    href: '/dashboard/templates', icon: Zap, done: false, action: 'Browse →'
  },
  {
    id: 5, title: 'Upgrade Your Plan', desc: 'Unlock unlimited replies, more bots, and advanced features.',
    href: '/dashboard/billing', icon: CreditCard, done: false, action: 'Upgrade →'
  },
]

export default function OnboardingPage() {
  const { user, loading, logout } = useAuth()
  const [completed, setCompleted] = useState<number[]>([1])

  const toggle = (id: number) => {
    setCompleted(c => c.includes(id) ? c.filter(x => x !== id) : [...c, id])
  }

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center"><div className="spinner w-8 h-8" /></div>

  const pct = Math.round((completed.length / STEPS.length) * 100)

  return (
    <DashboardLayout user={user} onLogout={logout}>
      <div className="max-w-2xl space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display font-bold text-2xl text-gray-900">Get Started with Textife 🚀</h1>
          <p className="text-gray-500 text-sm mt-1">Complete these steps to unlock the full power of your AI bot</p>
        </motion.div>

        {/* Progress bar */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-gray-700">{completed.length} of {STEPS.length} steps completed</span>
            <span className="text-sm font-bold text-primary-600">{pct}%</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-primary-500 to-blue-500 rounded-full"
            />
          </div>
          {pct === 100 && (
            <p className="text-green-600 font-semibold text-sm mt-3 text-center">🎉 You're all set! You're a Textife pro.</p>
          )}
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {STEPS.map((step, i) => {
            const Icon = step.icon
            const done = completed.includes(step.id)
            return (
              <motion.div key={step.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                className={`card p-5 flex items-center gap-4 cursor-pointer transition-all hover:shadow-md ${done ? 'border-green-200 bg-green-50/50' : ''}`}
                onClick={() => toggle(step.id)}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${done ? 'bg-green-100' : 'bg-gray-100'}`}>
                  {done
                    ? <CheckCircle className="w-5 h-5 text-green-600" />
                    : <Icon className="w-5 h-5 text-gray-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold text-sm ${done ? 'text-green-800 line-through' : 'text-gray-900'}`}>{step.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{step.desc}</p>
                </div>
                {step.href && !done && (
                  <Link href={step.href} onClick={e => e.stopPropagation()}
                    className="btn-primary text-xs px-3 py-1.5 whitespace-nowrap">
                    {step.action}
                  </Link>
                )}
                {done && <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />}
              </motion.div>
            )
          })}
        </div>

        {/* Tips */}
        <div className="card p-5 bg-gradient-to-br from-primary-50 to-blue-50 border-primary-100">
          <h3 className="font-display font-bold text-gray-900 mb-3">💡 Pro Tips</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2"><ArrowRight className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />Set up your bot with a specific personality for your industry (restaurant, real estate, ecommerce)</li>
            <li className="flex items-start gap-2"><ArrowRight className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />Use the Lead Capture template to collect customer info automatically</li>
            <li className="flex items-start gap-2"><ArrowRight className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />Check Analytics weekly to see what messages drive the most leads</li>
            <li className="flex items-start gap-2"><ArrowRight className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />Share your referral link to earn free months</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  )
}
