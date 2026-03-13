'use client'
import { useState } from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { useAuth, apiFetch } from '@/hooks/useAuth'
import { Check, Crown, CreditCard, Zap, AlertCircle, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

const PLANS = [
  { id: 'free',     name: 'Free',     price: 0,  features: ['50 AI replies/month', '1 bot', 'Basic analytics', 'Email support'],
    cta: 'Current Free', btn: 'btn-secondary' },
  { id: 'pro',      name: 'Pro',      price: 19, features: ['2,000 AI replies/month', '3 bots', 'Advanced analytics', 'Lead capture CRM', 'Marketing campaigns', 'Automation workflows', 'Priority support'],
    cta: 'Upgrade to Pro', btn: 'btn-primary', popular: true },
  { id: 'business', name: 'Business', price: 49, features: ['Unlimited AI replies', 'Unlimited bots', 'Full analytics suite', 'Dedicated manager', 'Custom AI training', 'API access', 'White-label'],
    cta: 'Upgrade to Business', btn: 'bg-purple-600 hover:bg-purple-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-all' },
]

export default function BillingPage() {
  const { user, loading, logout } = useAuth()
  const [provider, setProvider] = useState<'PAYPAL' | 'NOWPAYMENTS'>('PAYPAL')
  const [paying, setPaying]     = useState<string | null>(null)

  const upgrade = async (plan: string) => {
    if (plan === 'free' || plan === user?.plan?.toLowerCase()) return
    setPaying(plan)
    try {
      const data = await apiFetch('/api/payments/create', {
        method: 'POST',
        body: JSON.stringify({ plan: plan.toUpperCase(), provider }),
      })
      // Redirect to PayPal or NOWPayments
      window.location.href = data.approvalUrl || data.paymentUrl
    } catch (e: any) {
      toast.error(e.message)
      setPaying(null)
    }
  }

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center"><div className="spinner w-8 h-8" /></div>

  const current = user.plan

  return (
    <DashboardLayout user={user} onLogout={logout}>
      <div className="max-w-4xl space-y-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-gray-900">Billing & Subscription</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your plan and payment method</p>
        </div>

        {/* Current plan */}
        <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-2xl p-4 border border-primary-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center shadow-button">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Current Plan: <span className="text-primary-600">{current}</span></p>
              <p className="text-sm text-gray-500">{current === 'FREE' ? 'Upgrade to unlock more features' : 'Your subscription is active ✅'}</p>
            </div>
          </div>
        </div>

        {/* Payment method */}
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-3">Choose Payment Method</p>
          <div className="flex flex-wrap gap-3">
            {(['PAYPAL', 'NOWPAYMENTS'] as const).map(p => (
              <button key={p} onClick={() => setProvider(p)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                  provider === p ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}>
                {p === 'PAYPAL' ? <><CreditCard className="w-4 h-4" />PayPal / Card</> : <><Zap className="w-4 h-4" />Crypto (NOWPayments)</>}
              </button>
            ))}
          </div>
          {provider === 'NOWPAYMENTS' && (
            <p className="text-xs text-gray-500 mt-2">Accepts Bitcoin, USDT, Ethereum, and 100+ cryptocurrencies</p>
          )}
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-5">
          {PLANS.map((plan, i) => {
            const isCurrent = current === plan.name.toUpperCase()
            const isLoading = paying === plan.id
            return (
              <motion.div key={plan.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className={`relative bg-white rounded-2xl p-6 border-2 transition-all ${
                  plan.popular ? 'border-primary-500 shadow-[0_0_0_1px_#2563EB,0_20px_50px_rgba(37,99,235,0.12)]' : 'border-gray-200'
                } ${!isCurrent ? 'hover:-translate-y-1 hover:shadow-lg' : ''}`}>
                {plan.popular && !isCurrent && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary-600 text-white text-xs font-bold px-3.5 py-1 rounded-full flex items-center gap-1">
                    <Zap className="w-3 h-3 fill-white" />Most Popular
                  </div>
                )}
                {isCurrent && (
                  <div className="absolute -top-3.5 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">✓ Current</div>
                )}

                <h3 className="font-display font-bold text-lg text-gray-900 mb-1">{plan.name}</h3>
                <div className="mb-5">
                  <span className="font-display font-extrabold text-3xl md:text-4xl text-gray-900">{plan.price === 0 ? 'Free' : `$${plan.price}`}</span>
                  {plan.price > 0 && <span className="text-gray-400 text-sm">/month</span>}
                </div>

                <button onClick={() => upgrade(plan.id)} disabled={isCurrent || isLoading || paying !== null}
                  className={`w-full py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 mb-6 transition-all ${
                    isCurrent ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : plan.btn
                  } disabled:opacity-60`}>
                  {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" />Redirecting...</> : isCurrent ? '✓ Active Plan' : plan.cta}
                </button>

                <ul className="space-y-2">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                      <Check className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${plan.popular ? 'text-primary-500' : 'text-green-500'}`} />
                      {f}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )
          })}
        </div>

        {/* Note */}
        <div className="flex gap-3 bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
          <AlertCircle className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" />
          <span>After clicking upgrade, you'll be redirected to {provider === 'PAYPAL' ? 'PayPal' : 'NOWPayments'} to complete your payment securely. Your plan upgrades automatically upon successful payment.</span>
        </div>
      </div>
    </DashboardLayout>
  )
}
