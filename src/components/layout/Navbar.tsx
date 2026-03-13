'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Zap, Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Navbar() {
  const [scrolled, setScrolled]   = useState(false)
  const [menuOpen, setMenuOpen]   = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const links = ['Features', 'How It Works', 'Pricing', 'FAQ']

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 lg:h-18 items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center shadow-button group-hover:scale-110 transition-transform">
            <Zap className="w-4 h-4 text-white fill-white" />
          </div>
          <span className="font-display font-bold text-xl text-gray-900">
            Texti<span className="text-primary-600">fe</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8">
          {links.map(l => (
            <a key={l} href={`#${l.toLowerCase().replace(' ', '-')}`}
              className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
              {l}
            </a>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden lg:flex items-center gap-3">
          <Link href="/auth/login" className="btn-secondary text-sm py-2 px-4">Log In</Link>
          <Link href="/auth/register" className="btn-primary text-sm py-2 px-4">Start Free</Link>
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t border-gray-100 px-4 pb-4">
            {links.map(l => (
              <a key={l} href={`#${l.toLowerCase().replace(' ', '-')}`} onClick={() => setMenuOpen(false)}
                className="block py-3 text-sm font-medium text-gray-700 border-b border-gray-50 last:border-0">
                {l}
              </a>
            ))}
            <div className="pt-3 flex flex-col gap-2">
              <Link href="/auth/login" className="btn-secondary text-sm text-center">Log In</Link>
              <Link href="/auth/register" className="btn-primary text-sm text-center">Start Free</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
