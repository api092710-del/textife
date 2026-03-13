'use client'
// src/components/landing/Testimonials.tsx
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'

const testimonials = [
  { name: 'Ahmed Al-Rashid',    role: 'E-commerce Owner, Dubai',           text: 'Textife saved us 40 hours/week on support. Response time went from hours to seconds!',              metric: '+340% leads',       avatar: 'AR' },
  { name: 'Priya Sharma',       role: 'Marketing Director, Bangalore',      text: 'AI replies are so natural, customers don\'t realize they\'re chatting with a bot. Incredible!',          metric: '2x revenue',        avatar: 'PS' },
  { name: 'Carlos Mendez',      role: 'Restaurant Chain Owner, Mexico',     text: 'We manage 5 locations with 3 bots. All orders, reservations, and inquiries are automated.',              metric: '98% satisfaction',  avatar: 'CM' },
  { name: 'Sarah Chen',         role: 'SaaS Founder, Singapore',            text: 'Best investment for our startup. Lead capture feature alone paid for itself 10x in the first month.',    metric: '$50K saved',        avatar: 'SC' },
  { name: 'Mohammed Farhan',    role: 'Real Estate Agent, Sharjah',         text: 'I used to miss leads while sleeping. Now Textife captures every inquiry 24/7.',                       metric: '+180% conversions', avatar: 'MF' },
  { name: 'Jessica Williams',   role: 'Boutique Owner, London',             text: 'Setup was incredibly easy. Within an hour my AI bot was handling questions better than expected.',         metric: '10hr/week saved',   avatar: 'JW' },
]

export default function Testimonials() {
  return (
    <section className="section bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
          <span className="badge badge-blue mb-4">Testimonials</span>
          <h2 className="font-display font-extrabold text-4xl lg:text-5xl text-gray-900 mb-4">Loved by businesses worldwide</h2>
          <p className="text-xl text-gray-500">Join 12,500+ businesses already growing with Textife</p>
        </motion.div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <motion.div key={t.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
              className="card card-hover p-6">
              <div className="flex gap-0.5 mb-3">
                {[...Array(5)].map((_, j) => <Star key={j} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />)}
              </div>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">"{t.text}"</p>
              <span className="badge badge-green mb-4">{t.metric}</span>
              <div className="flex items-center gap-3 pt-3 border-t border-gray-50">
                <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary-600">{t.avatar}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                  <p className="text-xs text-gray-500">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
