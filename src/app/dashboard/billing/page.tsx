'use client'
import { useState } from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { useAuth, apiFetch } from '@/hooks/useAuth'
import { Check, Crown, Zap, Star, Shield, Rocket, ArrowRight, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

const PLANS = [
  {
    id: 'free', name: 'Free', price: 0, emoji: '🌱',
    gradient: 'from-gray-100 to-gray-200', textColor: 'text-gray-700',
    cta: 'Current Plan',
    features: [
      '50 AI replies / month',
      '1 WhatsApp bot',
      'Basic analytics',
      '7 AI tools access',
      'Community support',
    ],
    missing: ['Prompt Library Pro', 'Lead capture CRM', 'Priority AI speed', 'Advanced analytics'],
  },
  {
    id: 'pro', name: 'Pro', price: 19, emoji: '⚡', popular: true,
    gradient: 'from-indigo-500 to-purple-600', textColor: 'text-white',
    cta: 'Upgrade to Pro',
    features: [
      '2,000 AI replies / month',
      '3 WhatsApp bots',
      'All 24 Pro prompts unlocked',
      'Lead capture CRM',
      'Marketing campaigns',
      'Advanced analytics',
      'Priority AI (2× faster)',
      'Email support',
    ],
    missing: [],
  },
  {
    id: 'business', name: 'Business', price: 49, emoji: '🚀',
    gradient: 'from-purple-600 to-pink-600', textColor: 'text-white',
    cta: 'Go Business',
    features: [
      'Unlimited AI replies',
      'Unlimited bots',
      'White-label branding',
      'API access',
      'Custom AI training',
      'Dedicated account manager',
      'Full analytics suite',
      'Priority 24/7 support',
    ],
    missing: [],
  },
]

const TESTIMONIALS = [
  { name: 'Ahmad K.', role: 'E-commerce owner', text: 'Made back my subscription cost in the first week. The WhatsApp bots alone are worth 10×.', avatar: 'A', stars: 5 },
  { name: 'Priya S.', role: 'Freelance designer', text: 'The prompt library is insane. I close 3× more clients now using the proposal templates.', avatar: 'P', stars: 5 },
  { name: 'Omar R.', role: 'Startup founder', text: 'Replaced 4 different tools with Textife Pro. My team\'s productivity doubled in month 1.', avatar: 'O', stars: 5 },
]

export default function BillingPage() {
  const { user, loading, logout } = useAuth()
  const [provider, setProvider] = useState<'PAYPAL' | 'NOWPAYMENTS'>('PAYPAL')
  const [paying, setPaying]     = useState<string | null>(null)
  const [annual, setAnnual]     = useState(false)

  const upgrade = async (plan: string) => {
    if (plan === 'free' || plan === user?.plan?.toLowerCase()) return
    setPaying(plan)
    try {
      const data = await apiFetch('/api/payments/create', {
        method: 'POST',
        body: JSON.stringify({ plan: plan.toUpperCase(), provider }),
      })
      window.location.href = data.approvalUrl || data.paymentUrl
    } catch (e: any) {
      toast.error(e.message)
      setPaying(null)
    }
  }

  if (loading || !user) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="spinner w-10 h-10 mx-auto mb-3 border-indigo-600" />
        <p className="text-gray-400 text-sm animate-pulse">Loading billing...</p>
      </div>
    </div>
  )

  const current = user.plan

  return (
    <DashboardLayout user={user} onLogout={logout}>
      <div className="max-w-4xl space-y-8 pb-10">

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="text-center py-6">
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-full px-4 py-1.5 mb-4">
            <Crown className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-bold text-indigo-700">Upgrade Your Plan</span>
          </div>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-gray-900 mb-3 text-balance">
            Scale Your Business with AI 🚀
          </h1>
          <p className="text-gray-500 max-w-lg mx-auto text-sm sm:text-base">
            Join thousands of entrepreneurs automating their work and growing faster with Textife.
          </p>

          {/* Annual toggle */}
          <div className="flex items-center justify-center gap-3 mt-5">
            <span className={`text-sm font-semibold ${!annual ? 'text-gray-900' : 'text-gray-400'}`}>Monthly</span>
            <button onClick={() => setAnnual(!annual)}
              className={`relative w-12 h-6 rounded-full transition-all duration-300 ${annual ? 'bg-indigo-600' : 'bg-gray-200'}`}>
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300 ${annual ? 'left-6' : 'left-0.5'}`} />
            </button>
            <span className={`text-sm font-semibold ${annual ? 'text-gray-900' : 'text-gray-400'}`}>
              Annual <span className="text-green-600 font-black text-xs bg-green-50 px-1.5 py-0.5 rounded-full ml-1">Save 30%</span>
            </span>
          </div>
        </motion.div>

        {/* Current plan banner */}
        {current !== 'FREE' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <Check className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-bold text-green-800">✅ You're on {current} — Subscription Active</p>
              <p className="text-xs text-green-600 mt-0.5">All your features are unlocked and running.</p>
            </div>
          </motion.div>
        )}

        {/* Pricing cards */}
        <div className="grid sm:grid-cols-3 gap-4">
          {PLANS.map((plan, i) => {
            const isCurrent = current === plan.id.toUpperCase()
            const displayPrice = annual && plan.price > 0 ? Math.round(plan.price * 0.7) : plan.price
            return (
              <motion.div key={plan.id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                className={`relative rounded-2xl overflow-hidden ${plan.popular ? 'ring-2 ring-indigo-500 shadow-xl' : 'border border-gray-100 shadow-sm'}`}>

                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-center text-xs font-black py-1.5 tracking-widest uppercase">
                    ⭐ Most Popular
                  </div>
                )}

                <div className={`bg-gradient-to-br ${plan.gradient} p-5 ${plan.popular ? 'pt-9' : ''}`}>
                  <div className={`text-3xl mb-2`}>{plan.emoji}</div>
                  <p className={`font-black text-xl ${plan.textColor}`}>{plan.name}</p>
                  <div className="flex items-end gap-1 mt-1">
                    <span className={`font-black text-4xl ${plan.textColor}`}>
                      ${displayPrice}
                    </span>
                    {plan.price > 0 && <span className={`text-sm mb-1 opacity-80 ${plan.textColor}`}>/mo</span>}
                  </div>
                  {annual && plan.price > 0 && (
                    <p className={`text-xs mt-1 opacity-80 ${plan.textColor}`}>
                      <span className="line-through">${plan.price}/mo</span> → billed annually
                    </p>
                  )}
                </div>

                <div className="bg-white p-5 flex flex-col flex-1">
                  <ul className="space-y-2.5 mb-5 flex-1">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-start gap-2.5">
                        <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-2.5 h-2.5 text-green-600" />
                        </div>
                        <span className="text-sm text-gray-700">{f}</span>
                      </li>
                    ))}
                    {plan.missing?.map(f => (
                      <li key={f} className="flex items-start gap-2.5 opacity-40">
                        <div className="w-4 h-4 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-[10px] text-gray-400">✕</span>
                        </div>
                        <span className="text-sm text-gray-400 line-through">{f}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => upgrade(plan.id)}
                    disabled={isCurrent || paying !== null}
                    className={`w-full py-3 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 ${
                      isCurrent
                        ? 'bg-gray-100 text-gray-400 cursor-default'
                        : plan.popular
                          ? 'text-white hover:opacity-90 active:opacity-80'
                          : plan.id === 'business'
                            ? 'text-white hover:opacity-90'
                            : 'bg-gray-100 text-gray-500'
                    }`}
                    style={!isCurrent && plan.id !== 'free' ? {
                      background: plan.popular
                        ? 'linear-gradient(135deg, #4f46e5, #7c3aed)'
                        : 'linear-gradient(135deg, #7c3aed, #ec4899)',
                      boxShadow: plan.popular ? '0 6px 20px rgba(79,70,229,0.35)' : '0 6px 20px rgba(124,58,237,0.3)'
                    } : {}}>
                    {paying === plan.id
                      ? <><span className="spinner border-white" /> Redirecting...</>
                      : isCurrent
                        ? '✅ Current Plan'
                        : <>{plan.cta} <ArrowRight className="w-4 h-4" /></>
                    }
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Payment provider */}
        <div className="card p-5">
          <h3 className="font-display font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-600" /> Payment Method
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {(['PAYPAL', 'NOWPAYMENTS'] as const).map(p => (
              <button key={p} onClick={() => setProvider(p)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${provider === p ? 'border-indigo-400 bg-indigo-50' : 'border-gray-100 hover:border-gray-200'}`}>
                <p className="font-bold text-sm text-gray-900">
                  {p === 'PAYPAL' ? '💳 PayPal' : '₿ Crypto'}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {p === 'PAYPAL' ? 'Card, PayPal balance' : 'Bitcoin, USDT, ETH +70 more'}
                </p>
                {provider === p && <div className="mt-1.5"><Check className="w-3.5 h-3.5 text-indigo-600" /></div>}
              </button>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div>
          <h3 className="font-display font-bold text-lg text-gray-900 text-center mb-4">
            What Pro users say 💬
          </h3>
          <div className="grid sm:grid-cols-3 gap-3">
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={t.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.08 }}
                className="card p-4">
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(t.stars)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />)}
                </div>
                <p className="text-sm text-gray-700 italic mb-3 leading-relaxed">"{t.text}"</p>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-black">{t.avatar}</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">{t.name}</p>
                    <p className="text-[10px] text-gray-400">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Guarantee */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 text-center border border-green-100">
          <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Shield className="w-7 h-7 text-green-600" />
          </div>
          <h3 className="font-display font-black text-xl text-gray-900 mb-2">7-Day Money-Back Guarantee</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Not satisfied within 7 days of upgrading? We'll refund 100% of your payment, no questions asked. Zero risk, pure upside.
          </p>
        </motion.div>

      </div>
    </DashboardLayout>
  )
}
