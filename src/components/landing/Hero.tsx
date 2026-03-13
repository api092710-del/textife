'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Play, Star, Shield, CheckCircle } from 'lucide-react'

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-white">
      {/* Gradient bg */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(37,99,235,0.1),transparent)]" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-50/40 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">

          {/* Left */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 bg-primary-50 border border-primary-200 rounded-full px-4 py-1.5 mb-6">
              <Star className="w-3 h-3 text-primary-600 fill-primary-600" />
              <span className="text-xs font-semibold text-primary-700">#1 AI WhatsApp Business Platform</span>
            </motion.div>

            <h1 className="font-display font-extrabold text-5xl lg:text-[3.5rem] xl:text-6xl text-gray-900 leading-[1.1] mb-6">
              Automate Your <br />
              <span className="gradient-text">WhatsApp Business</span>
              <br />With AI
            </h1>

            <p className="text-lg lg:text-xl text-gray-500 leading-relaxed mb-8 max-w-lg">
              Textife turns your WhatsApp into a 24/7 AI assistant that replies instantly, captures leads, and grows your business automatically.
            </p>

            <div className="flex flex-wrap gap-3 mb-10">
              <Link href="/auth/register" className="btn-primary px-7 py-3.5 text-base">
                Start Free Trial
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button className="btn-secondary px-6 py-3.5 text-base">
                <div className="w-7 h-7 bg-primary-50 rounded-full flex items-center justify-center">
                  <Play className="w-3 h-3 text-primary-600 fill-primary-600 ml-0.5" />
                </div>
                Watch Demo
              </button>
            </div>

            {/* Trust row */}
            <div className="flex flex-wrap items-center gap-5 text-sm text-gray-500">
              <span className="flex items-center gap-1.5"><Shield className="w-4 h-4 text-green-500" /> SSL Secured</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-500" /> No credit card</span>
              <span className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />)}
                <span className="ml-1">4.9/5</span>
              </span>
            </div>
          </motion.div>

          {/* Right - Chat mockup */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.15 }}
            className="relative">

            {/* Floating chips */}
            <motion.div animate={{ y: [-6, 6, -6] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-3 -left-4 z-10 bg-white rounded-2xl shadow-card border border-gray-100 px-4 py-2.5 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-gray-700">New lead captured!</span>
            </motion.div>

            <motion.div animate={{ y: [6, -6, 6] }} transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              className="absolute -bottom-3 -right-2 z-10 bg-primary-600 text-white rounded-2xl shadow-lg px-4 py-2.5 text-sm font-medium">
              ⚡ 12,500+ businesses
            </motion.div>

            {/* Phone mockup */}
            <div className="bg-gradient-to-br from-primary-50 via-blue-50 to-indigo-50 rounded-3xl p-6 border border-primary-100/50 shadow-glass">
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 max-w-72 mx-auto">

                {/* Header */}
                <div className="bg-primary-600 px-4 py-3 flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white text-sm font-bold">T</div>
                  <div>
                    <p className="text-white text-sm font-semibold">Textife AI</p>
                    <p className="text-primary-200 text-xs flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block" />
                      Online
                    </p>
                  </div>
                </div>

                {/* Chat messages */}
                <div className="bg-[#f0f2f5] p-3 space-y-2 h-56 overflow-hidden">
                  {[
                    { from: 'user', text: 'Hi, what\'s your pricing?' },
                    { from: 'bot',  text: 'Hey! 👋 We have 3 plans:\n• Free – 50 AI replies\n• Pro – $19/mo (2000 replies)\n• Business – $49/mo (unlimited)\n\nWhich suits you best?' },
                    { from: 'user', text: 'Tell me more about Pro' },
                    { from: 'bot',  text: 'Pro gives you 2,000 AI replies, 3 bots, lead capture, analytics & priority support! Most popular for growing businesses 🚀' },
                  ].map((msg, i) => (
                    <div key={i} className={`flex ${msg.from === 'user' ? 'justify-end' : 'gap-2'}`}>
                      {msg.from === 'bot' && (
                        <div className="w-6 h-6 rounded-full bg-primary-600 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold self-end">T</div>
                      )}
                      <div className={`text-xs leading-relaxed px-3 py-2 rounded-2xl shadow-sm max-w-48 whitespace-pre-line ${
                        msg.from === 'user' ? 'bg-[#d9fdd3] rounded-tr-none' : 'bg-white rounded-tl-none'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary-600 flex-shrink-0 flex items-center justify-center text-white text-xs self-end">T</div>
                    <div className="bg-white rounded-2xl rounded-tl-none px-3 py-3 shadow-sm">
                      <div className="flex gap-1">
                        <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Input bar */}
                <div className="px-3 py-2.5 bg-white border-t border-gray-100 flex items-center gap-2">
                  <div className="flex-1 bg-gray-100 rounded-full px-3 py-1.5 text-xs text-gray-400">Type a message...</div>
                  <div className="w-7 h-7 bg-primary-600 rounded-full flex items-center justify-center">
                    <ArrowRight className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
