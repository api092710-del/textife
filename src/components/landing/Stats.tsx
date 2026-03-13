'use client'
import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { TrendingUp, Shield, Zap, Users } from 'lucide-react'

function Counter({ to, suffix = '', prefix = '' }: { to: number; suffix?: string; prefix?: string }) {
  const [val, setVal] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    let start = 0
    const step = to / 60
    const timer = setInterval(() => {
      start += step
      if (start >= to) { setVal(to); clearInterval(timer) }
      else setVal(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [inView, to])

  return <span ref={ref}>{prefix}{val.toLocaleString()}{suffix}</span>
}

const STATS = [
  { icon: Users,     color: 'text-indigo-600', bg: 'bg-indigo-50', label: 'Active Users',          to: 12847,  suffix: '+',  prefix: '' },
  { icon: Shield,    color: 'text-red-600',    bg: 'bg-red-50',    label: 'Scams Detected Monthly', to: 340000, suffix: '+',  prefix: '' },
  { icon: Zap,       color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'AI Replies Sent',        to: 4200000,suffix: '+',  prefix: '' },
  { icon: TrendingUp,color: 'text-green-600',  bg: 'bg-green-50',  label: 'Avg. Revenue Boost',     to: 340,    suffix: '%',  prefix: '' },
]

const LIVE_FEED = [
  { ago: '2m ago', text: 'Phishing site targeting PayPal users detected', sev: '🔴' },
  { ago: '8m ago', text: 'New QR code scam reported in Dubai malls', sev: '🟠' },
  { ago: '14m ago', text: 'AI voice cloning attack flagged in US/EU', sev: '🔴' },
  { ago: '21m ago', text: 'SIM swap campaign targeting crypto holders', sev: '🔴' },
  { ago: '35m ago', text: 'Fake LinkedIn recruiter malware spreading', sev: '🟠' },
]

export default function Stats() {
  const [feedIdx, setFeedIdx] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setFeedIdx(i => (i + 1) % LIVE_FEED.length), 3500)
    return () => clearInterval(t)
  }, [])

  return (
    <section className="bg-gray-50 py-16 sm:py-20 border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Live threat ticker */}
        <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="mb-10 bg-white border border-red-100 rounded-2xl px-5 py-3.5 flex items-center gap-3 shadow-sm overflow-hidden">
          <div className="flex-shrink-0 flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black text-red-600 uppercase tracking-widest whitespace-nowrap">Live Threat Feed</span>
          </div>
          <div className="flex-1 overflow-hidden">
            <motion.p
              key={feedIdx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="text-sm text-gray-700 truncate">
              {LIVE_FEED[feedIdx].sev} {LIVE_FEED[feedIdx].text}
              <span className="text-gray-400 ml-2 text-xs">{LIVE_FEED[feedIdx].ago}</span>
            </motion.p>
          </div>
          <span className="flex-shrink-0 text-[10px] font-bold bg-red-50 text-red-600 border border-red-100 px-2 py-1 rounded-lg whitespace-nowrap">
            {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {STATS.map((stat, i) => {
            const Icon = stat.icon
            return (
              <motion.div key={stat.label}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:-translate-y-0.5 transition-transform">
                <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <p className="font-display font-black text-2xl sm:text-3xl text-gray-900 leading-none mb-1">
                  <Counter to={stat.to} suffix={stat.suffix} prefix={stat.prefix} />
                </p>
                <p className="text-xs text-gray-500 font-medium leading-tight">{stat.label}</p>
              </motion.div>
            )
          })}
        </div>

        {/* Trust bar */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-gray-400">
          {[
            '🔒 Bank-grade encryption',
            '🌍 Used in 40+ countries',
            '⚡ 99.97% uptime SLA',
            '🛡️ GDPR compliant',
            '🤖 Powered by GPT-4o',
          ].map(item => (
            <span key={item} className="flex items-center gap-1.5">{item}</span>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
