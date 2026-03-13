'use client'
// src/components/landing/Stats.tsx
import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

function Count({ n, prefix='', suffix='' }: { n: number; prefix?: string; suffix?: string }) {
  const [v, setV] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    let start = 0
    const steps = 60
    const timer = setInterval(() => {
      start += n / steps
      if (start >= n) { setV(n); clearInterval(timer) }
      else setV(Math.floor(start))
    }, 2000 / steps)
    return () => clearInterval(timer)
  }, [inView, n])

  const fmt = v >= 1000 ? `${(v/1000).toFixed(1)}K` : String(v)
  return <span ref={ref}>{prefix}{fmt}{suffix}</span>
}

export default function Stats() {
  const items = [
    { label: 'Businesses Using',    n: 12500, suffix: '+' },
    { label: 'Messages Handled',    n: 4800000, suffix: '+' },
    { label: 'Revenue Generated',   n: 28, prefix: '$', suffix: 'M+' },
    { label: 'Satisfaction Rate',   n: 98, suffix: '%' },
  ]
  return (
    <section className="py-14 bg-gray-50 border-y border-gray-100">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 lg:grid-cols-4 gap-8">
        {items.map((it, i) => (
          <motion.div key={it.label} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
            <div className="font-display font-extrabold text-4xl text-gray-900 mb-1">
              <Count n={it.n} prefix={it.prefix} suffix={it.suffix} />
            </div>
            <p className="text-sm text-gray-500">{it.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
