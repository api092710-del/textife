'use client'
import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Shield, Zap, Users } from 'lucide-react'

function Counter({ to, suffix='', prefix='' }: { to:number; suffix?:string; prefix?:string }) {
  const [val, setVal] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const [started, setStarted] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStarted(true) }, { threshold:0.5 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  useEffect(() => {
    if (!started) return
    let cur = 0
    const step = to / 60
    const t = setInterval(() => {
      cur += step
      if (cur >= to) { setVal(to); clearInterval(t) }
      else setVal(Math.floor(cur))
    }, 16)
    return () => clearInterval(t)
  }, [started, to])
  return <span ref={ref}>{prefix}{val >= 1000 ? val.toLocaleString() : val}{suffix}</span>
}

const STATS = [
  { icon:Users,      color:'text-indigo-600', bg:'from-indigo-500 to-blue-600',     label:'Active Businesses',    to:12847,  suffix:'+' },
  { icon:Shield,     color:'text-red-600',    bg:'from-red-500 to-rose-600',         label:'Scams Blocked Monthly', to:340000, suffix:'+' },
  { icon:Zap,        color:'text-yellow-600', bg:'from-amber-500 to-yellow-500',     label:'AI Replies Sent',      to:4200000,suffix:'+' },
  { icon:TrendingUp, color:'text-green-600',  bg:'from-emerald-500 to-green-600',   label:'Avg. Revenue Boost',   to:340,    suffix:'%' },
]

const LIVE_FEED = [
  { ago:'2m ago',  text:'Phishing site targeting PayPal users detected',   sev:'🔴' },
  { ago:'8m ago',  text:'New QR code scam reported in Gulf region malls',   sev:'🟠' },
  { ago:'14m ago', text:'AI voice cloning attack flagged across EU',         sev:'🔴' },
  { ago:'21m ago', text:'SIM swap campaign targeting crypto holders active', sev:'🔴' },
  { ago:'35m ago', text:'Fake LinkedIn recruiter malware spreading fast',    sev:'🟠' },
]

export default function Stats() {
  const [feedIdx, setFeedIdx] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setFeedIdx(i => (i + 1) % LIVE_FEED.length), 3500)
    return () => clearInterval(t)
  }, [])

  return (
    <section className="py-16 sm:py-20 bg-gray-50 border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Live threat ticker */}
        <motion.div initial={{ opacity:0, y:10 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
          className="mb-10 bg-white border border-red-100 rounded-2xl px-5 py-3.5 flex items-center gap-3 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black text-red-600 uppercase tracking-widest whitespace-nowrap">Live Threat Feed</span>
          </div>
          <div className="flex-1 overflow-hidden">
            <motion.p key={feedIdx} initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} className="text-sm text-gray-700 truncate">
              {LIVE_FEED[feedIdx].sev} {LIVE_FEED[feedIdx].text}
              <span className="text-gray-400 ml-2 text-xs">{LIVE_FEED[feedIdx].ago}</span>
            </motion.p>
          </div>
          <span className="flex-shrink-0 text-[10px] font-bold bg-red-50 text-red-600 border border-red-100 px-2 py-1 rounded-lg">
            {new Date().toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' })}
          </span>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {STATS.map((stat, i) => {
            const Icon = stat.icon
            return (
              <motion.div key={stat.label}
                initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay: i * 0.08 }}
                className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:-translate-y-0.5 transition-transform">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.bg} flex items-center justify-center mb-3 shadow-sm`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <p className="font-display font-black text-2xl sm:text-3xl text-gray-900 leading-none mb-1">
                  <Counter to={stat.to} suffix={stat.suffix} />
                </p>
                <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
              </motion.div>
            )
          })}
        </div>

        {/* Trust bar */}
        <motion.div initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }}
          className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-gray-400">
          {['🔒 Bank-grade encryption','🌍 Used in 40+ countries','⚡ 99.97% uptime SLA','🛡️ GDPR compliant','🤖 Powered by GPT-4o'].map(item => (
            <span key={item} className="flex items-center gap-1.5 font-medium">{item}</span>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
