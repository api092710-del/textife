'use client'
import { motion } from 'framer-motion'
import { UserPlus, Settings, Bot, TrendingUp, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const steps = [
  { n:'01', icon:UserPlus,   title:'Sign Up Free',          desc:'Create your account in 60 seconds. No credit card, no technical skills needed.',                       color:'from-blue-500 to-blue-600',    bg:'bg-blue-50',   dot:'bg-blue-500' },
  { n:'02', icon:Settings,   title:'Connect WhatsApp',      desc:'Link your WhatsApp Business number in minutes. Our wizard guides you step-by-step.',                    color:'from-violet-500 to-violet-600', bg:'bg-violet-50', dot:'bg-violet-500' },
  { n:'03', icon:Bot,        title:'AI Goes Live',           desc:'Your bot handles replies, captures leads, creates content, and coaches you — all instantly.',            color:'from-emerald-500 to-emerald-600',bg:'bg-emerald-50',dot:'bg-emerald-500' },
  { n:'04', icon:TrendingUp, title:'Watch Revenue Grow',    desc:'Track messages, leads, and revenue from your dashboard. Most users see ROI within 24 hours.',            color:'from-orange-500 to-orange-600', bg:'bg-orange-50', dot:'bg-orange-500' },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 sm:py-28 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} className="text-center mb-16">
          <span className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold px-4 py-1.5 rounded-full mb-4">
            How It Works
          </span>
          <h2 className="font-display font-black text-4xl lg:text-5xl text-gray-900 mb-4">Up and running in minutes</h2>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">Four simple steps to transform your WhatsApp into an AI business machine.</p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connector line (desktop) */}
          <div className="hidden lg:block absolute top-10 left-0 right-0 h-0.5 bg-gray-200 mx-32" />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((s, i) => {
              const Icon = s.icon
              return (
                <motion.div key={s.n}
                  initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:i * 0.12 }}
                  className="relative flex flex-col items-center text-center group">
                  {/* Step number dot */}
                  <div className={`relative z-10 w-20 h-20 bg-gradient-to-br ${s.color} rounded-2xl flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="w-9 h-9 text-white" />
                    <div className="absolute -top-2.5 -right-2.5 w-7 h-7 bg-white rounded-full border-2 border-gray-200 flex items-center justify-center">
                      <span className="text-xs font-black text-gray-500">{i+1}</span>
                    </div>
                  </div>
                  <h3 className="font-display font-bold text-lg text-gray-900 mb-2">{s.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* CTA */}
        <motion.div initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }} className="text-center mt-14">
          <Link href="/auth/register"
            className="inline-flex items-center gap-2 text-white font-bold px-8 py-4 rounded-xl text-base transition-all active:scale-95"
            style={{ background:'linear-gradient(135deg,#4f46e5,#7c3aed)', boxShadow:'0 8px 25px rgba(79,70,229,0.35)' }}>
            Start in 60 Seconds — Free <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
