'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Star, Shield, CheckCircle, Zap, Bot, TrendingUp, Users } from 'lucide-react'
import { useState, useEffect } from 'react'

const ROTATING = ['AI Auto-Replies 24/7','Lead Capture Bot','Content Generator','Smart Prompt Library','Voice Changer','Growth Coach']

export default function Hero() {
  const [idx, setIdx] = useState(0)
  useEffect(() => { const t = setInterval(() => setIdx(i => (i+1) % ROTATING.length), 2200); return () => clearInterval(t) }, [])

  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* bg */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-200/30 rounded-full blur-3xl" />
        <div className="absolute inset-0" style={{ backgroundImage:'radial-gradient(circle,rgba(99,102,241,0.06) 1px,transparent 1px)', backgroundSize:'32px 32px' }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Left */}
          <motion.div initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6 }}>
            <motion.div initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} transition={{ delay:0.1 }}
              className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-200 rounded-full px-4 py-1.5 mb-5">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-bold text-indigo-700">#1 AI WhatsApp Business Platform</span>
            </motion.div>

            <h1 className="font-display font-black text-[2.6rem] sm:text-5xl lg:text-[3.2rem] text-gray-900 leading-[1.1] mb-3">
              Automate Your<br />
              <span style={{ background:'linear-gradient(135deg,#4f46e5,#7c3aed,#a855f7)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                WhatsApp Business
              </span><br />With AI
            </h1>

            {/* Rotating feature pill */}
            <div className="flex items-center gap-2 mb-5 h-9">
              <Zap className="w-4 h-4 text-indigo-600 flex-shrink-0" />
              <motion.span key={idx} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }}
                className="text-sm font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full">
                {ROTATING[idx]}
              </motion.span>
            </div>

            <p className="text-base sm:text-lg text-gray-500 leading-relaxed mb-8 max-w-lg">
              Textife turns WhatsApp into a 24/7 AI machine — auto-replies, captures leads, generates content, coaches your growth, and changes voices for viral content. All in one platform.
            </p>

            <div className="flex flex-wrap gap-3 mb-8">
              <Link href="/auth/register"
                className="inline-flex items-center gap-2 text-white font-bold px-6 py-3.5 rounded-xl text-base transition-all active:scale-95"
                style={{ background:'linear-gradient(135deg,#4f46e5,#7c3aed)', boxShadow:'0 8px 25px rgba(79,70,229,0.4)' }}>
                Start Free Trial <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="#pricing"
                className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 font-semibold px-6 py-3.5 rounded-xl text-base hover:border-indigo-300 hover:text-indigo-700 transition-all">
                See Pricing
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1.5"><Shield className="w-4 h-4 text-green-500" />SSL Secured</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-500" />No credit card</span>
              <span className="flex items-center gap-1">
                {[...Array(5)].map((_,i) => <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />)}
                <span className="ml-1 font-semibold">4.9/5</span>
              </span>
            </div>

            {/* Mini stat row */}
            <div className="flex flex-wrap gap-3 mt-6">
              {[{ n:'12.8K+', l:'Active users' },{ n:'4.2M+', l:'AI replies sent' },{ n:'340%', l:'Avg revenue boost' }].map(s => (
                <div key={s.l} className="bg-white border border-gray-100 rounded-xl px-4 py-2.5 shadow-sm">
                  <p className="font-black text-gray-900 text-sm">{s.n}</p>
                  <p className="text-[10px] text-gray-400">{s.l}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right — dashboard mockup */}
          <motion.div initial={{ opacity:0, x:30 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.7, delay:0.15 }}
            className="relative">

            {/* Floating notification chips */}
            <motion.div animate={{ y:[-5,5,-5] }} transition={{ duration:3.5, repeat:Infinity, ease:'easeInOut' }}
              className="absolute -top-4 -left-2 z-10 bg-white rounded-2xl shadow-lg border border-gray-100 px-3.5 py-2 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs font-semibold text-gray-700">New lead captured! 🎯</span>
            </motion.div>

            <motion.div animate={{ y:[5,-5,5] }} transition={{ duration:4, repeat:Infinity, ease:'easeInOut', delay:0.8 }}
              className="absolute -bottom-2 -right-2 z-10 bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-2xl shadow-xl px-3.5 py-2 text-xs font-bold">
              ⚡ 12,500+ businesses growing
            </motion.div>

            {/* Main card */}
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
              {/* Header bar */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-700 px-5 py-4 flex items-center gap-3">
                <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">Textife AI Dashboard</p>
                  <p className="text-indigo-200 text-xs flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block animate-pulse" />All systems active
                  </p>
                </div>
                <div className="ml-auto flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400 opacity-80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400 opacity-80" />
                  <div className="w-3 h-3 rounded-full bg-green-400 opacity-80" />
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-0 border-b border-gray-100">
                {[
                  { label:'Replies Today', val:'247', icon:'💬', color:'text-indigo-600' },
                  { label:'Leads Caught', val:'18',  icon:'🎯', color:'text-green-600' },
                  { label:'Revenue Est.', val:'$840', icon:'💰', color:'text-purple-600' },
                ].map((s,i) => (
                  <div key={i} className={`px-4 py-3 text-center ${i < 2 ? 'border-r border-gray-100' : ''}`}>
                    <p className="text-lg">{s.icon}</p>
                    <p className={`font-black text-sm ${s.color}`}>{s.val}</p>
                    <p className="text-[9px] text-gray-400">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* WhatsApp-style chat */}
              <div className="bg-[#f0f2f5] p-4 space-y-2 h-48 overflow-hidden">
                {[
                  { from:'user', text:"Hi, is your Pro plan worth it?" },
                  { from:'bot',  text:"Absolutely! 🚀 Pro gives you 2,000 AI replies, 3 bots, lead capture + all 24 premium prompts. Most users see ROI in week 1." },
                  { from:'user', text:"How do I start?" },
                  { from:'bot',  text:"Easy! Click 'Start Free Trial' → connect WhatsApp in 5 steps → your bot goes live in minutes. Zero tech skills needed 💪" },
                ].map((msg,i) => (
                  <div key={i} className={`flex ${msg.from==='user' ? 'justify-end' : 'gap-2'}`}>
                    {msg.from==='bot' && <div className="w-6 h-6 rounded-full bg-indigo-600 flex-shrink-0 flex items-center justify-center text-white text-xs self-end font-bold">T</div>}
                    <div className={`text-xs leading-relaxed px-3 py-2 rounded-2xl shadow-sm max-w-[75%] ${msg.from==='user' ? 'bg-[#d9fdd3] rounded-tr-sm' : 'bg-white rounded-tl-sm'}`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                <div className="flex gap-2">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 flex-shrink-0 flex items-center justify-center text-white text-xs self-end font-bold">T</div>
                  <div className="bg-white rounded-2xl rounded-tl-sm px-3 py-2.5 shadow-sm">
                    <div className="flex gap-1">{[0,150,300].map(d=><span key={d} className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce inline-block" style={{ animationDelay:`${d}ms` }} />)}</div>
                  </div>
                </div>
              </div>

              {/* Tool chips */}
              <div className="px-4 py-3 flex gap-2 flex-wrap border-t border-gray-100">
                {['💡 Ideas','✍️ Content','🎙️ Voice','📚 Prompts','📊 Analytics'].map(t => (
                  <span key={t} className="text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-1 rounded-lg">{t}</span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
