'use client'
// HowItWorks
import { motion } from 'framer-motion'
import { UserPlus, Settings, Bot, TrendingUp } from 'lucide-react'

const steps = [
  { n: '01', icon: UserPlus,    title: 'Create Account',      desc: 'Sign up in 60 seconds. No technical skills required.', color: 'from-blue-500 to-blue-600' },
  { n: '02', icon: Settings,    title: 'Connect & Configure', desc: 'Link your WhatsApp and customize your AI assistant.', color: 'from-violet-500 to-violet-600' },
  { n: '03', icon: Bot,         title: 'AI Goes Live',         desc: 'Your bot handles inquiries, captures leads, closes sales.', color: 'from-emerald-500 to-emerald-600' },
  { n: '04', icon: TrendingUp,  title: 'Watch Business Grow', desc: 'Monitor with analytics and watch your revenue expand.', color: 'from-orange-500 to-orange-600' },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="section bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <span className="badge badge-blue mb-4">How It Works</span>
          <h2 className="font-display font-extrabold text-4xl lg:text-5xl text-gray-900 mb-4">Up and running in minutes</h2>
          <p className="text-xl text-gray-500">Four steps to transform your WhatsApp into an AI business machine.</p>
        </motion.div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((s, i) => {
            const Icon = s.icon
            return (
              <motion.div key={s.n} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }} className="text-center">
                <div className={`w-14 h-14 bg-gradient-to-br ${s.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Step {s.n}</span>
                <h3 className="font-display font-bold text-lg text-gray-900 mt-1 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
