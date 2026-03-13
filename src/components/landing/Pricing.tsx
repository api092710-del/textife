'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Check, X, Zap, Crown, Rocket, Clock, Users, TrendingUp, Shield } from 'lucide-react'
import { useState, useEffect } from 'react'

const plans = [
  {
    id: 'free', name: 'Free', price: 0, annualPrice: 0, emoji: '🌱',
    cta: 'Start Free', href: '/auth/register', popular: false,
    gradient: 'from-gray-100 to-gray-50', borderColor: 'border-gray-200', ctaClass: 'bg-gray-900 text-white hover:bg-gray-800',
    features: [
      { text: '50 AI replies / month', ok: true },
      { text: '1 WhatsApp bot', ok: true },
      { text: '2 daily security alerts', ok: true },
      { text: 'Basic analytics', ok: true },
      { text: 'Community templates', ok: true },
      { text: 'Pro prompt library', ok: false },
      { text: 'Lead capture CRM', ok: false },
      { text: 'AI voice tools', ok: false },
      { text: 'Priority AI speed', ok: false },
    ],
  },
  {
    id: 'pro', name: 'Pro', price: 19, annualPrice: 15, emoji: '⚡', popular: true,
    cta: 'Start Pro — 7 Days Free', href: '/auth/register?plan=pro',
    gradient: 'from-indigo-600 to-purple-700', borderColor: 'border-indigo-500',
    ctaClass: 'bg-white text-indigo-700 hover:bg-indigo-50 font-black',
    features: [
      { text: '2,000 AI replies / month', ok: true },
      { text: '3 WhatsApp bots', ok: true },
      { text: '5 daily security alerts', ok: true },
      { text: 'Advanced analytics + charts', ok: true },
      { text: 'All 24 Pro prompts unlocked', ok: true },
      { text: 'Lead capture CRM', ok: true },
      { text: 'Marketing campaigns', ok: true },
      { text: 'Priority AI (2× faster)', ok: true },
      { text: 'Email support', ok: true },
    ],
  },
  {
    id: 'business', name: 'Business', price: 49, annualPrice: 39, emoji: '🚀',
    cta: 'Go Business', href: '/auth/register?plan=business', popular: false,
    gradient: 'from-purple-600 to-pink-600', borderColor: 'border-purple-400',
    ctaClass: 'bg-white text-purple-700 hover:bg-purple-50 font-black',
    features: [
      { text: 'Unlimited AI replies', ok: true },
      { text: 'Unlimited WhatsApp bots', ok: true },
      { text: '7 daily security alerts', ok: true },
      { text: 'Full analytics suite', ok: true },
      { text: 'Custom AI training', ok: true },
      { text: 'White-label branding', ok: true },
      { text: 'API access + webhooks', ok: true },
      { text: 'Dedicated account manager', ok: true },
      { text: 'Priority 24/7 support + SLA', ok: true },
    ],
  },
]

const SOCIAL_PROOF = [
  { avatar: 'AK', name: 'Ahmad K.', role: 'E-commerce, Dubai', text: 'Made back the subscription cost in the first week.', stars: 5 },
  { avatar: 'PS', name: 'Priya S.', role: 'Freelancer, India', text: 'Closed 3× more clients using the proposal templates.', stars: 5 },
  { avatar: 'OR', name: 'Omar R.', role: 'Startup founder, UK', text: 'Replaced 4 different tools. Team productivity doubled.', stars: 5 },
]

function CountdownTimer() {
  const [time, setTime] = useState({ h: 3, m: 47, s: 22 })
  useEffect(() => {
    const t = setInterval(() => {
      setTime(prev => {
        let { h, m, s } = prev
        s--
        if (s < 0) { s = 59; m-- }
        if (m < 0) { m = 59; h-- }
        if (h < 0) { h = 4; m = 0; s = 0 }
        return { h, m, s }
      })
    }, 1000)
    return () => clearInterval(t)
  }, [])
  return (
    <span className="font-mono font-black">
      {String(time.h).padStart(2,'0')}:{String(time.m).padStart(2,'0')}:{String(time.s).padStart(2,'0')}
    </span>
  )
}

export default function Pricing() {
  const [annual, setAnnual] = useState(false)

  return (
    <section id="pricing" className="section bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-4">
          <span className="badge badge-blue mb-4">Pricing</span>
          <h2 className="font-display font-extrabold text-4xl lg:text-5xl text-gray-900 mb-4">
            Invest in your safety & growth
          </h2>
          <p className="text-xl text-gray-500 mb-6">Start free. Upgrade when you see results — usually day 1.</p>

          {/* Annual toggle */}
          <div className="inline-flex items-center gap-3 bg-gray-100 rounded-xl p-1.5">
            <button onClick={() => setAnnual(false)} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${!annual ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>Monthly</button>
            <button onClick={() => setAnnual(true)} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-1.5 ${annual ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>
              Annual
              <span className="text-[10px] font-black bg-green-500 text-white px-1.5 py-0.5 rounded-full">-20%</span>
            </button>
          </div>
        </motion.div>

        {/* FOMO banner */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="flex items-center justify-center gap-2 mb-8 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 max-w-md mx-auto">
          <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-800 font-semibold">
            Pro trial offer ends in <CountdownTimer /> — <span className="font-black">47 people</span> upgraded today
          </p>
        </motion.div>

        {/* Plans grid */}
        <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto mb-10">
          {plans.map((plan, i) => (
            <motion.div key={plan.id}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className={`relative rounded-2xl border-2 overflow-hidden transition-all duration-300 ${
                plan.popular ? plan.borderColor + ' shadow-2xl shadow-indigo-200 -translate-y-2' : plan.borderColor + ' hover:shadow-lg'
              }`}>

              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-indigo-600 to-purple-700 text-white text-[11px] font-black py-1.5 text-center flex items-center justify-center gap-1.5">
                  <Zap className="w-3 h-3 fill-white" /> MOST POPULAR — 7-DAY FREE TRIAL
                </div>
              )}

              <div className={`p-6 ${plan.popular ? 'pt-10 bg-gradient-to-b from-indigo-50/50 to-white' : 'bg-white'}`}>
                <div className="mb-4">
                  <span className="text-2xl">{plan.emoji}</span>
                  <h3 className="font-display font-black text-xl text-gray-900 mt-1">{plan.name}</h3>
                </div>
                <div className="mb-5">
                  <div className="flex items-end gap-1">
                    <span className="font-display font-extrabold text-4xl text-gray-900">
                      {plan.price === 0 ? 'Free' : `$${annual ? plan.annualPrice : plan.price}`}
                    </span>
                    {plan.price > 0 && <span className="text-gray-400 text-sm mb-1.5">/month</span>}
                  </div>
                  {annual && plan.price > 0 && (
                    <p className="text-xs text-green-600 font-bold mt-1">
                      Save ${(plan.price - plan.annualPrice) * 12}/year
                    </p>
                  )}
                </div>

                <Link href={plan.href}
                  className={`block text-center font-bold py-3 px-5 rounded-xl transition-all duration-200 mb-6 text-sm ${plan.ctaClass} ${
                    plan.popular ? 'shadow-lg' : ''
                  }`}>
                  {plan.cta}
                </Link>

                <ul className="space-y-2.5">
                  {plan.features.map((f, fi) => (
                    <li key={fi} className={`flex items-start gap-2.5 text-sm ${f.ok ? 'text-gray-700' : 'text-gray-300'}`}>
                      {f.ok
                        ? <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${plan.popular ? 'text-indigo-600' : 'text-green-500'}`} />
                        : <X className="w-4 h-4 flex-shrink-0 mt-0.5 text-gray-200" />
                      }
                      {f.text}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>

        {/* FOMO proof row */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto mb-10">
          {[
            { icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50', stat: '12,847+', label: 'businesses using Textife' },
            { icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50', stat: '340%', label: 'avg. revenue increase reported' },
            { icon: Shield, color: 'text-red-600', bg: 'bg-red-50', stat: '340k+', label: 'scams blocked monthly' },
          ].map(item => {
            const Icon = item.icon
            return (
              <div key={item.stat} className={`flex items-center gap-3 ${item.bg} rounded-xl px-4 py-3 border border-gray-100`}>
                <Icon className={`w-5 h-5 ${item.color} flex-shrink-0`} />
                <div>
                  <p className="font-black text-gray-900 text-sm">{item.stat}</p>
                  <p className="text-xs text-gray-500">{item.label}</p>
                </div>
              </div>
            )
          })}
        </motion.div>

        {/* Testimonials mini */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="grid sm:grid-cols-3 gap-4 max-w-4xl mx-auto mb-10">
          {SOCIAL_PROOF.map(t => (
            <div key={t.name} className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
              <div className="flex items-center gap-0.5 mb-2">
                {[...Array(t.stars)].map((_, i) => <span key={i} className="text-yellow-400 text-xs">★</span>)}
              </div>
              <p className="text-xs text-gray-700 italic mb-3 leading-relaxed">"{t.text}"</p>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-[9px] font-black">{t.avatar}</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">{t.name}</p>
                  <p className="text-[10px] text-gray-400">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Guarantee */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="text-center">
          <div className="inline-flex flex-col items-center gap-2 bg-green-50 border border-green-100 rounded-2xl px-8 py-5">
            <span className="text-2xl">🛡️</span>
            <p className="font-display font-black text-gray-900 text-base">7-Day Money-Back Guarantee</p>
            <p className="text-sm text-gray-500 max-w-xs">Not satisfied? 100% refund, no questions asked. Zero risk.</p>
          </div>
          <p className="text-xs text-gray-400 mt-4">Secure payments via PayPal & NOWPayments (Bitcoin, USDT, ETH + 70 more)</p>
        </motion.div>
      </div>
    </section>
  )
}
