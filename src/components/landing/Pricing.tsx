'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Check, X, Zap, Crown, Rocket, Clock, Users, TrendingUp, Shield, Star } from 'lucide-react'
import { useState, useEffect } from 'react'

const plans = [
  {
    id:'free', name:'Free', price:0, annualPrice:0, emoji:'🌱', cta:'Start Free', href:'/auth/register', popular:false,
    features:[
      { text:'50 AI bot replies / month', ok:true },
      { text:'1 WhatsApp bot', ok:true },
      { text:'AI Content Hub (blog, marketing, social)', ok:true },
      { text:'24 Smart Prompts', ok:true },
      { text:'Voice Changer (6 voices)', ok:true },
      { text:'Quick Tools (8-in-1)', ok:true },
      { text:'Daily motivation & growth tools', ok:true },
      { text:'Lead Capture CRM', ok:false },
      { text:'Email sequences', ok:false },
      { text:'Advanced Analytics', ok:false },
      { text:'Priority AI (2× faster)', ok:false },
    ],
  },
  {
    id:'pro', name:'Pro', price:19, annualPrice:15, emoji:'⚡', popular:true,
    cta:'Start Pro — 7 Days Free', href:'/auth/register?plan=pro',
    features:[
      { text:'2,000 AI replies / month', ok:true },
      { text:'3 WhatsApp bots', ok:true },
      { text:'Full AI Content Hub', ok:true },
      { text:'All 24 Pro prompts unlocked', ok:true },
      { text:'Voice Changer (8 voices + pro)', ok:true },
      { text:'All Quick Tools', ok:true },
      { text:'Lead Capture CRM', ok:true },
      { text:'Email sequences', ok:true },
      { text:'Advanced Analytics + Charts', ok:true },
      { text:'Priority AI (2× faster)', ok:true },
    ],
  },
  {
    id:'business', name:'Business', price:49, annualPrice:39, emoji:'🚀',
    cta:'Go Business', href:'/auth/register?plan=business', popular:false,
    features:[
      { text:'Unlimited AI replies', ok:true },
      { text:'Unlimited WhatsApp bots', ok:true },
      { text:'Everything in Pro', ok:true },
      { text:'Custom AI training', ok:true },
      { text:'White-label branding', ok:true },
      { text:'API access + webhooks', ok:true },
      { text:'Dedicated account manager', ok:true },
      { text:'Priority 24/7 support + SLA', ok:true },
      { text:'Team seats (up to 5)', ok:true },
      { text:'Custom integrations', ok:true },
    ],
  },
]

function Countdown() {
  const [t, setT] = useState({ h:3, m:47, s:22 })
  useEffect(() => {
    const timer = setInterval(() => {
      setT(prev => {
        let {h,m,s} = prev; s--
        if (s<0){s=59;m--} if(m<0){m=59;h--} if(h<0){h=4;m=0;s=0}
        return {h,m,s}
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])
  return <span className="font-mono font-black">{String(t.h).padStart(2,'0')}:{String(t.m).padStart(2,'0')}:{String(t.s).padStart(2,'0')}</span>
}

export default function Pricing() {
  const [annual, setAnnual] = useState(false)

  return (
    <section id="pricing" className="py-20 sm:py-28 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} className="text-center mb-6">
          <span className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold px-4 py-1.5 rounded-full mb-4">
            💰 Pricing
          </span>
          <h2 className="font-display font-black text-4xl lg:text-5xl text-gray-900 mb-4">Simple, honest pricing</h2>
          <p className="text-lg text-gray-500 mb-6">Start free. Upgrade when you see results — usually day 1.</p>

          {/* Annual toggle */}
          <div className="inline-flex items-center gap-1.5 bg-gray-100 rounded-xl p-1.5">
            <button onClick={() => setAnnual(false)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${!annual ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
              Monthly
            </button>
            <button onClick={() => setAnnual(true)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-all ${annual ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
              Annual
              <span className="text-[10px] font-black bg-green-500 text-white px-1.5 py-0.5 rounded-full">-20%</span>
            </button>
          </div>
        </motion.div>

        {/* FOMO banner */}
        <motion.div initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }}
          className="flex items-center justify-center gap-2 mb-8 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 max-w-sm mx-auto">
          <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-800 font-semibold">
            Pro trial ends in <Countdown /> — <span className="font-black text-amber-900">47 people</span> upgraded today
          </p>
        </motion.div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto mb-10">
          {plans.map((plan, i) => (
            <motion.div key={plan.id}
              initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay: i * 0.1 }}
              className={`relative rounded-2xl border-2 overflow-hidden transition-all duration-200 ${
                plan.popular
                  ? 'border-indigo-500 shadow-2xl shadow-indigo-100 -translate-y-2'
                  : 'border-gray-200 hover:shadow-lg hover:border-gray-300'
              }`}>

              {plan.popular && (
                <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white text-[11px] font-black py-1.5 text-center flex items-center justify-center gap-1.5">
                  <Zap className="w-3 h-3 fill-white" />MOST POPULAR — 7-DAY FREE TRIAL
                </div>
              )}

              <div className={`p-6 ${plan.popular ? 'pt-5 bg-gradient-to-b from-indigo-50/50 to-white' : 'bg-white'}`}>
                <div className="mb-4">
                  <span className="text-2xl">{plan.emoji}</span>
                  <h3 className="font-display font-black text-xl text-gray-900 mt-1">{plan.name}</h3>
                </div>

                <div className="mb-5">
                  <div className="flex items-end gap-1">
                    <span className="font-display font-black text-4xl text-gray-900">
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
                  className={`block text-center font-bold py-3.5 px-5 rounded-xl transition-all active:scale-95 mb-6 text-sm ${
                    plan.popular
                      ? 'text-white shadow-lg'
                      : plan.id === 'business'
                        ? 'text-white'
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                  style={plan.popular ? { background:'linear-gradient(135deg,#4f46e5,#7c3aed)', boxShadow:'0 6px 20px rgba(79,70,229,0.35)' } :
                         plan.id === 'business' ? { background:'linear-gradient(135deg,#7c3aed,#a855f7)' } : {}}>
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

        {/* Stats proof */}
        <motion.div initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }}
          className="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto mb-10">
          {[
            { icon:Users,      color:'text-indigo-600', bg:'bg-indigo-50', stat:'12,847+', label:'businesses using Textife' },
            { icon:TrendingUp, color:'text-green-600',  bg:'bg-green-50',  stat:'340%',   label:'avg. revenue increase reported' },
            { icon:Shield,     color:'text-red-600',    bg:'bg-red-50',    stat:'340k+',  label:'scams blocked monthly' },
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

        {/* Guarantee */}
        <motion.div initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }} className="text-center">
          <div className="inline-flex flex-col items-center gap-2 bg-green-50 border border-green-200 rounded-2xl px-8 py-5">
            <span className="text-2xl">🛡️</span>
            <p className="font-display font-black text-gray-900">7-Day Money-Back Guarantee</p>
            <p className="text-sm text-gray-500 max-w-xs">Not satisfied? Full refund, no questions asked. Zero risk.</p>
          </div>
          <p className="text-xs text-gray-400 mt-4">Payments via PayPal & NOWPayments (BTC, ETH, USDT + 70 coins)</p>
        </motion.div>
      </div>
    </section>
  )
}
