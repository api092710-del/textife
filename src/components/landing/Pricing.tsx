'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Check, Zap } from 'lucide-react'

const plans = [
  { id: 'free', name: 'Free', price: 0, period: 'forever', features: ['50 AI replies / month', '1 WhatsApp bot', 'Basic analytics', 'Standard templates', 'Email support'], cta: 'Get Started Free', href: '/auth/register', popular: false },
  { id: 'pro',  name: 'Pro',  price: 19, period: '/month',  features: ['2,000 AI replies / month', '3 WhatsApp bots', 'Advanced analytics', 'Lead capture CRM', 'Marketing campaigns', 'Automation workflows', 'Priority support', 'Custom templates'], cta: 'Start Pro Trial', href: '/auth/register?plan=pro', popular: true },
  { id: 'business', name: 'Business', price: 49, period: '/month', features: ['Unlimited AI replies', 'Unlimited bots', 'Full analytics suite', 'Dedicated account manager', 'Custom AI training', 'API access', 'White-label option', 'SLA guarantee'], cta: 'Start Business Trial', href: '/auth/register?plan=business', popular: false },
]

export default function Pricing() {
  return (
    <section id="pricing" className="section bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <span className="badge badge-blue mb-4">Pricing</span>
          <h2 className="font-display font-extrabold text-4xl lg:text-5xl text-gray-900 mb-4">Simple, transparent pricing</h2>
          <p className="text-xl text-gray-500">Start free, upgrade as you grow. Cancel anytime. No hidden fees.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className={`relative bg-white rounded-2xl p-7 border-2 transition-all duration-300 hover:-translate-y-1 ${
                p.popular ? 'border-primary-500 shadow-[0_0_0_1px_#2563EB,0_20px_60px_rgba(37,99,235,0.15)]' : 'border-gray-200 hover:shadow-lg'
              }`}>
              {p.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary-600 text-white text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-1.5">
                  <Zap className="w-3 h-3 fill-white" /> Most Popular
                </div>
              )}
              <div className="mb-5">
                <h3 className="font-display font-bold text-xl text-gray-900">{p.name}</h3>
              </div>
              <div className="mb-6">
                <span className="font-display font-extrabold text-5xl text-gray-900">{p.price === 0 ? 'Free' : `$${p.price}`}</span>
                {p.price > 0 && <span className="text-gray-400 ml-1">{p.period}</span>}
              </div>
              <Link href={p.href}
                className={`block text-center font-semibold py-3 px-5 rounded-xl transition-all duration-200 mb-7 text-sm ${
                  p.popular ? 'btn-primary w-full' : 'btn-secondary w-full'
                }`}>{p.cta}</Link>
              <ul className="space-y-2.5">
                {p.features.map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-gray-600">
                    <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${p.popular ? 'text-primary-600' : 'text-green-500'}`} />
                    {f}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mt-10">
          <p className="text-sm text-gray-400 mb-3">Secure payments via</p>
          <div className="flex items-center justify-center gap-6">
            <span className="bg-gray-50 border border-gray-200 rounded-lg px-5 py-2 font-bold text-blue-600 text-sm">PayPal</span>
            <span className="bg-gray-50 border border-gray-200 rounded-lg px-5 py-2 font-bold text-green-600 text-sm">NOWPayments</span>
            <span className="text-gray-400 text-sm flex items-center gap-1">🔒 256-bit SSL</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
