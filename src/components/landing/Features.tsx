'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Bot, Zap, PenTool, Brain, Mic, Shield, BarChart3, Users, TrendingUp, MessageSquare, Crown, Sparkles } from 'lucide-react'

const FEATURES = [
  { icon:Bot,         emoji:'🤖', title:'AI WhatsApp Bot',         desc:'Auto-reply 24/7 in any language. Handles FAQs, sales, support — all on autopilot.',                     grad:'from-teal-500 to-cyan-600',    bg:'bg-teal-50',   text:'text-teal-700',   free:true },
  { icon:PenTool,     emoji:'✍️', title:'AI Content Hub',          desc:'Blog posts, marketing copy, product descriptions, email sequences — all in seconds.',                     grad:'from-purple-500 to-violet-600', bg:'bg-purple-50', text:'text-purple-700', free:true },
  { icon:Brain,       emoji:'📚', title:'Smart Prompt Library',     desc:'24 expert AI prompts across business, marketing, freelancing, productivity. Fill → Run → Get results.',  grad:'from-indigo-500 to-blue-600',   bg:'bg-indigo-50', text:'text-indigo-700', free:true },
  { icon:TrendingUp,  emoji:'🌱', title:'Personal Growth Coach',    desc:'Daily motivation, personalized day planners, 5-min lessons, 30-day habit builders.',                     grad:'from-pink-500 to-rose-600',     bg:'bg-pink-50',   text:'text-pink-700',   free:true },
  { icon:Mic,         emoji:'🎙️', title:'Voice Changer',            desc:'7 hilarious voice effects — Baby, Chipmunk, Robot, Wizard. Create viral content to share anywhere.',     grad:'from-amber-500 to-orange-600',  bg:'bg-amber-50',  text:'text-amber-700',  free:true },
  { icon:Zap,         emoji:'⚡', title:'Quick Tools (8-in-1)',      desc:'Summarize, Translate, Rewrite, Generate Ideas, Explain, Action Plan, Hashtags, Headlines — instantly.',   grad:'from-blue-500 to-indigo-600',   bg:'bg-blue-50',   text:'text-blue-700',   free:true },
  { icon:Users,       emoji:'🎯', title:'Lead Capture CRM',          desc:'Automatically capture and qualify leads from WhatsApp conversations. Export to CSV anytime.',            grad:'from-green-500 to-emerald-600', bg:'bg-green-50',  text:'text-green-700',  free:false },
  { icon:BarChart3,   emoji:'📊', title:'Advanced Analytics',        desc:'Real-time dashboard: messages, leads, revenue estimates, bot performance and ROI metrics.',              grad:'from-orange-500 to-amber-600',  bg:'bg-orange-50', text:'text-orange-700', free:false },
  { icon:Shield,      emoji:'🚨', title:'Live Scam Alerts',          desc:'Real-time threat feed. Daily scam alert digests. Protect yourself and your customers 24/7.',            grad:'from-red-500 to-rose-600',      bg:'bg-red-50',    text:'text-red-700',    free:true },
  { icon:MessageSquare,emoji:'💬',title:'AI Chat Assistant',         desc:'Persistent AI business assistant. Asks the right questions, gives smart short answers, remembers context.',grad:'from-violet-500 to-purple-600', bg:'bg-violet-50', text:'text-violet-700', free:true },
  { icon:Crown,       emoji:'📋', title:'WhatsApp Templates',        desc:'Pre-built message templates for sales, support, follow-ups, promos. One-click send.',                    grad:'from-cyan-500 to-teal-600',     bg:'bg-cyan-50',   text:'text-cyan-700',   free:false },
  { icon:Sparkles,    emoji:'💰', title:'Money Maker Tool',          desc:'AI-powered income ideas tailored to your skills, time, and budget. New ideas every day.',                grad:'from-emerald-500 to-green-600', bg:'bg-emerald-50',text:'text-emerald-700',free:true },
]

export default function Features() {
  return (
    <section id="features" className="py-20 sm:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} className="text-center mb-14">
          <span className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold px-4 py-1.5 rounded-full mb-4">
            <Zap className="w-3 h-3" />12 Powerful Features
          </span>
          <h2 className="font-display font-black text-4xl lg:text-5xl text-gray-900 mb-4">Everything your business needs</h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">One subscription replaces 8+ separate tools. From WhatsApp bots to voice changers — all AI-powered.</p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {FEATURES.map((f, i) => {
            const Icon = f.icon
            return (
              <motion.div key={f.title}
                initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:i*0.04 }}
                className="relative group bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                {!f.free && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-amber-500 text-yellow-900 px-2 py-0.5 rounded-full text-[9px] font-black">
                    <Crown className="w-2.5 h-2.5" />PRO
                  </div>
                )}
                <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${f.grad} flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-base">{f.emoji}</span>
                  <h3 className="font-display font-bold text-sm text-gray-900">{f.title}</h3>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            )
          })}
        </div>

        <motion.div initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }} className="text-center mt-12">
          <Link href="/auth/register"
            className="inline-flex items-center gap-2 text-white font-bold px-8 py-4 rounded-xl text-base transition-all active:scale-95"
            style={{ background:'linear-gradient(135deg,#4f46e5,#7c3aed)', boxShadow:'0 8px 25px rgba(79,70,229,0.35)' }}>
            Start Free — No Credit Card <span className="text-indigo-200">→</span>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
