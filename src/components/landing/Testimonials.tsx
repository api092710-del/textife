'use client'
import { motion } from 'framer-motion'
import { Star, TrendingUp } from 'lucide-react'

const testimonials = [
  { name:'Ahmed Al-Rashid',  role:'E-commerce Owner, Dubai',          text:'Textife saved us 40 hours per week on customer support. Response time went from hours to seconds. Game changer.', metric:'+340% leads',       avatar:'AR', grad:'from-blue-500 to-indigo-600' },
  { name:'Priya Sharma',     role:'Marketing Director, Bangalore',    text:'The AI replies are so natural that customers cannot tell they are talking to a bot. Our satisfaction scores hit 98%.', metric:'2x revenue',        avatar:'PS', grad:'from-violet-500 to-purple-600' },
  { name:'Carlos Mendez',    role:'Restaurant Chain Owner, Mexico',   text:'Managing 5 locations with 3 bots. All orders, reservations, and inquiries automated. I sleep at night now.', metric:'98% satisfaction',  avatar:'CM', grad:'from-emerald-500 to-teal-600' },
  { name:'Sarah Chen',       role:'SaaS Founder, Singapore',          text:'Best investment I made for the startup. The lead capture alone paid for 10x the subscription cost in the first month.', metric:'$50K saved',        avatar:'SC', grad:'from-rose-500 to-pink-600' },
  { name:'Mohammed Farhan',  role:'Real Estate Agent, Sharjah',       text:'I used to miss leads while sleeping. Now Textife captures every single inquiry 24/7. My pipeline has never been fuller.', metric:'+180% conversions', avatar:'MF', grad:'from-orange-500 to-amber-600' },
  { name:'Jessica Williams', role:'Boutique Owner, London',           text:'Setup took under an hour. Within a day, my AI bot was handling customer questions better than I expected. Incredible.', metric:'10hr/week saved',   avatar:'JW', grad:'from-teal-500 to-cyan-600' },
]

export default function Testimonials() {
  return (
    <section className="py-20 sm:py-28 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} className="text-center mb-14">
          <span className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold px-4 py-1.5 rounded-full mb-4">
            ⭐ Testimonials
          </span>
          <h2 className="font-display font-black text-4xl lg:text-5xl text-gray-900 mb-4">Loved by businesses worldwide</h2>
          <p className="text-lg text-gray-500">Join 12,500+ businesses already growing with Textife</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <motion.div key={t.name}
              initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay: i * 0.07 }}
              className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
              <div className="flex gap-0.5 mb-3">
                {[...Array(5)].map((_,j) => <Star key={j} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />)}
              </div>
              <p className="text-sm text-gray-600 leading-relaxed mb-4 italic">"{t.text}"</p>
              <div className="inline-flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 text-xs font-bold px-3 py-1 rounded-full mb-4">
                <TrendingUp className="w-3 h-3" />{t.metric}
              </div>
              <div className="flex items-center gap-3 pt-3 border-t border-gray-50">
                <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${t.grad} flex items-center justify-center flex-shrink-0`}>
                  <span className="text-[10px] font-black text-white">{t.avatar}</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{t.name}</p>
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
