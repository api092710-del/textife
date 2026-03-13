'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Zap, Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', fn, { passive:true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const links = [
    { label:'Features', href:'#features' },
    { label:'How It Works', href:'#how-it-works' },
    { label:'Pricing', href:'#pricing' },
    { label:'FAQ', href:'#faq' },
  ]

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"
            style={{ background:'linear-gradient(135deg,#4f46e5,#7c3aed)' }}>
            <Zap className="w-4 h-4 text-white fill-white" />
          </div>
          <span className="font-display font-black text-xl text-gray-900">
            Texti<span className="text-indigo-600">fe</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-8">
          {links.map(l => (
            <a key={l.label} href={l.href} className="text-sm font-medium text-gray-500 hover:text-indigo-700 transition-colors">{l.label}</a>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <Link href="/auth/login" className="text-sm font-semibold text-gray-600 hover:text-gray-900 px-4 py-2 rounded-xl hover:bg-gray-50 transition-all">Log In</Link>
          <Link href="/auth/register"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-white px-5 py-2.5 rounded-xl transition-all active:scale-95"
            style={{ background:'linear-gradient(135deg,#4f46e5,#7c3aed)', boxShadow:'0 4px 14px rgba(79,70,229,0.35)' }}>
            Start Free <span className="text-indigo-200">→</span>
          </Link>
        </div>

        <button onClick={() => setOpen(!open)} className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-xl">
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }}
            className="lg:hidden bg-white border-t border-gray-100 shadow-lg">
            <div className="px-4 py-4 space-y-1">
              {links.map(l => (
                <a key={l.label} href={l.href} onClick={() => setOpen(false)}
                  className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-xl transition-all">
                  {l.label}
                </a>
              ))}
              <div className="pt-3 flex flex-col gap-2 border-t border-gray-100 mt-2">
                <Link href="/auth/login" onClick={() => setOpen(false)}
                  className="block text-center py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                  Log In
                </Link>
                <Link href="/auth/register" onClick={() => setOpen(false)}
                  className="block text-center py-3 rounded-xl text-sm font-bold text-white"
                  style={{ background:'linear-gradient(135deg,#4f46e5,#7c3aed)' }}>
                  Start Free Trial
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
