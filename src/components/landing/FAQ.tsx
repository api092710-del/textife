'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, MessageCircle } from 'lucide-react'

const faqs = [
  { q:'What exactly is Textife?',              a:'Textife is an all-in-one AI platform for businesses. It includes WhatsApp automation bots, AI content creation, a smart prompt library, personal growth coaching, a voice changer for viral content, an AI business chat, lead capture, analytics, and real-time scam alerts — all powered by GPT-4o.' },
  { q:'Do I need any technical skills?',        a:'Not at all. Textife is built for business owners, not developers. Our step-by-step setup wizard gets you running in under 30 minutes with zero coding needed.' },
  { q:'How does the WhatsApp bot work?',        a:'You connect your WhatsApp Business number, configure your bot with your business info, and the AI handles customer messages 24/7. It auto-replies, captures leads, answers FAQs, and assists with sales — completely automatically.' },
  { q:'What AI tools are included?',            a:'Blog writer, marketing copy generator, product descriptions, social media content packs, email sequences, 24 premium prompts, personal growth planner & habit builder, voice changer with 8 effects, AI business chat, quick tools (translate, summarize, rewrite), and money maker idea generator.' },
  { q:'Is my data secure?',                     a:'Yes. We use end-to-end encryption, comply with GDPR, and never sell your data. All message processing is encrypted and stored securely on Supabase with bank-grade protection.' },
  { q:'Can I cancel anytime?',                  a:'Absolutely. No contracts, no lock-in. Upgrade, downgrade, or cancel instantly from your dashboard. If you cancel within 7 days, you get a full refund — no questions asked.' },
  { q:'What payment methods do you accept?',    a:'We accept PayPal (credit/debit cards worldwide) and cryptocurrency via NOWPayments (Bitcoin, USDT, ETH, and 70+ coins). All transactions are secured and encrypted.' },
  { q:'How many WhatsApp numbers can I connect?', a:'Free plan: 1 number. Pro plan: 3 numbers. Business plan: unlimited. Each number gets its own dedicated AI bot with custom configuration.' },
  { q:'What languages does the AI support?',    a:'50+ languages including Arabic, English, Spanish, French, Hindi, Portuguese, Turkish, and many more. The AI automatically detects and responds in the customer\'s language.' },
  { q:'What happens if I hit my reply limit?',  a:'Your bot pauses auto-replies and you receive an email notification. Upgrade your plan anytime to instantly resume — there is no data loss and your bot configuration is preserved.' },
]

export default function FAQ() {
  const [open, setOpen] = useState<number|null>(0)

  return (
    <section id="faq" className="py-20 sm:py-28 bg-white">
      <div className="max-w-3xl mx-auto px-4">
        <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} className="text-center mb-14">
          <span className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold px-4 py-1.5 rounded-full mb-4">
            FAQ
          </span>
          <h2 className="font-display font-black text-4xl lg:text-5xl text-gray-900 mb-4">Frequently asked questions</h2>
          <p className="text-lg text-gray-500">Everything you need to know about Textife.</p>
        </motion.div>

        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <motion.div key={i}
              initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }} transition={{ delay: i * 0.03 }}
              className="border border-gray-200 rounded-2xl overflow-hidden">
              <button onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors gap-4">
                <span className="font-semibold text-gray-900 text-sm leading-snug">{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200 ${open === i ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div initial={{ height:0 }} animate={{ height:'auto' }} exit={{ height:0 }} className="overflow-hidden">
                    <p className="px-5 pb-4 text-sm text-gray-500 leading-relaxed">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Still have questions CTA */}
        <motion.div initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }}
          className="mt-10 text-center bg-indigo-50 border border-indigo-100 rounded-2xl p-6">
          <MessageCircle className="w-8 h-8 text-indigo-600 mx-auto mb-3" />
          <h3 className="font-display font-bold text-gray-900 mb-1">Still have questions?</h3>
          <p className="text-sm text-gray-500 mb-4">Our team typically replies within 2 hours.</p>
          <a href="mailto:support@textife.com"
            className="inline-flex items-center gap-2 text-white font-bold px-6 py-3 rounded-xl text-sm transition-all active:scale-95"
            style={{ background:'linear-gradient(135deg,#4f46e5,#7c3aed)' }}>
            Chat with Support
          </a>
        </motion.div>
      </div>
    </section>
  )
}
