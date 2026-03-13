'use client'
import { motion } from 'framer-motion'
import { Zap, Users, ShoppingCart, BarChart3, Megaphone, Clock, Repeat, Shield } from 'lucide-react'

const features = [
  { icon: Zap,          title: 'AI Auto Reply',        color: 'bg-yellow-50 text-yellow-600', desc: 'Instantly respond to customer messages 24/7 with intelligent, context-aware replies that sound human.' },
  { icon: Users,        title: 'Lead Capture',          color: 'bg-blue-50 text-blue-600',    desc: 'Automatically collect customer info and qualify leads without any manual effort.' },
  { icon: ShoppingCart, title: 'Sales Assistant',       color: 'bg-green-50 text-green-600',  desc: 'Guide customers through your catalog, answer questions, and close sales automatically.' },
  { icon: Megaphone,    title: 'Marketing Generator',   color: 'bg-purple-50 text-purple-600',desc: 'Create targeted campaigns, broadcast messages, and generate promotional content with AI.' },
  { icon: BarChart3,    title: 'Advanced Analytics',    color: 'bg-red-50 text-red-600',      desc: 'Track messages, leads, revenue estimates, and bot performance in real-time.' },
  { icon: Clock,        title: '24/7 Always On',        color: 'bg-indigo-50 text-indigo-600',desc: 'Never miss an inquiry. Your AI works around the clock including weekends and holidays.' },
  { icon: Repeat,       title: 'Automation Workflows',  color: 'bg-teal-50 text-teal-600',    desc: 'Build custom sequences for follow-ups, onboarding, and repeat sales cycles.' },
  { icon: Shield,       title: 'Enterprise Security',   color: 'bg-gray-50 text-gray-600',    desc: 'Bank-grade encryption, GDPR compliant data handling, secure message processing.' },
]

export default function Features() {
  return (
    <section id="features" className="section bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <span className="badge badge-blue mb-4">Features</span>
          <h2 className="font-display font-extrabold text-4xl lg:text-5xl text-gray-900 mb-4">Everything your business needs</h2>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">From auto-replies to advanced analytics — all in one platform.</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f, i) => {
            const Icon = f.icon
            return (
              <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                className="card card-hover p-6 group">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-4 ${f.color} group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-display font-bold text-base text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            )
          })}
        </div>

        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mt-14">
          <a href="/auth/register" className="btn-primary px-8 py-3.5 text-base">Get Started Free — No Credit Card Required</a>
        </motion.div>
      </div>
    </section>
  )
}
