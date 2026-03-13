'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

const faqs = [
  { q: 'What is Trendygene?',                  a: 'Trendygene is an AI-powered WhatsApp business automation platform. It turns your WhatsApp Business number into a 24/7 intelligent assistant that auto-replies, captures leads, assists with sales, and generates marketing content.' },
  { q: 'Do I need technical skills?',          a: 'Not at all! Trendygene is designed for business owners, not developers. Our step-by-step setup wizard guides you through everything. You\'ll be up and running in under 30 minutes.' },
  { q: 'Is my WhatsApp data secure?',          a: 'Absolutely. We use end-to-end encryption for all messages, comply with GDPR regulations, and never sell your data. All data is processed securely and stored encrypted.' },
  { q: 'Can I cancel anytime?',                a: 'Yes! No long-term contracts. Upgrade, downgrade, or cancel at any time from your dashboard. No questions asked.' },
  { q: 'What payment methods are accepted?',   a: 'We accept PayPal (credit/debit cards) and cryptocurrency payments via NOWPayments. All transactions are secured and encrypted.' },
  { q: 'How many WhatsApp numbers can I connect?', a: 'Free plan: 1 number. Pro plan: 3 numbers. Business plan: unlimited WhatsApp numbers.' },
  { q: 'Does the AI understand other languages?',  a: 'Yes! Powered by OpenAI, the AI supports 50+ languages including Arabic, English, Spanish, French, Hindi, and many more.' },
  { q: 'What happens when I hit my reply limit?',  a: 'Your bot pauses auto-replies and you\'ll receive an email notification. Upgrade your plan to continue uninterrupted service.' },
]

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <section id="faq" className="section bg-white">
      <div className="max-w-3xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
          <span className="badge badge-blue mb-4">FAQ</span>
          <h2 className="font-display font-extrabold text-4xl lg:text-5xl text-gray-900 mb-4">Frequently asked questions</h2>
        </motion.div>
        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <motion.div key={i} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}
              className="border border-gray-200 rounded-2xl overflow-hidden">
              <button onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors">
                <span className="font-semibold text-gray-900 text-sm pr-4">{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${open === i ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                    <p className="px-6 pb-4 text-sm text-gray-500 leading-relaxed">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
