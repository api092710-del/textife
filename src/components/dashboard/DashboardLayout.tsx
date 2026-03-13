'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, MessageSquare, Bot, BarChart3, FileText, CreditCard,
  Settings, LogOut, Menu, Zap, Shield, ChevronRight, Users, Gift,
  BookOpen, Moon, Sun, DollarSign, Lightbulb, PenTool, Star, Trophy, Send, X
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { AuthUser } from '@/hooks/useAuth'
import { useDarkMode } from '@/hooks/useDarkMode'

const NAV_GROUPS = [
  {
    label: 'AI TOOLS',
    items: [
      { label: 'Business Ideas',  href: '/dashboard/ideas',       emoji: '💡' },
      { label: 'Money Maker',     href: '/dashboard/money',       emoji: '💰' },
      { label: 'Content Hub',     href: '/dashboard/content',     emoji: '✍️' },
      { label: 'Sales Messages',  href: '/dashboard/sales',       emoji: '📣' },
      { label: 'Personal Growth', href: '/dashboard/growth',      emoji: '🌱' },
      { label: 'Quick Tools',     href: '/dashboard/quicktools',  emoji: '⚡' },
      { label: 'Prompt Library',  href: '/dashboard/prompts',     emoji: '📚' },
      { label: 'Voice Changer',   href: '/dashboard/voicechanger', emoji: '🎙️' },
    ]
  },
  {
    label: 'WHATSAPP',
    items: [
      { label: 'My Bots',         href: '/dashboard/bots',        emoji: '🤖' },
      { label: 'AI Chat',         href: '/dashboard/chat',        emoji: '💬' },
      { label: 'Templates',       href: '/dashboard/templates',   emoji: '📋' },
      { label: 'Leads',           href: '/dashboard/leads',       emoji: '👥' },
    ]
  },
  {
    label: 'ACCOUNT',
    items: [
      { label: 'Dashboard',       href: '/dashboard',             emoji: '🏠' },
      { label: 'Analytics',       href: '/dashboard/analytics',   emoji: '📊' },
      { label: 'Achievements',    href: '/dashboard/achievements', emoji: '🏆' },
      { label: 'Referral',        href: '/dashboard/referral',    emoji: '🎁' },
      { label: 'Billing',         href: '/dashboard/billing',     emoji: '💳' },
      { label: 'Settings',        href: '/dashboard/settings',    emoji: '⚙️' },
    ]
  }
]

const BOTTOM_NAV = [
  { label: 'Home',     href: '/dashboard',            emoji: '🏠' },
  { label: 'Tools',    href: '/dashboard/quicktools', emoji: '⚡' },
  { label: 'Bots',     href: '/dashboard/bots',       emoji: '🤖' },
  { label: 'Prompts',  href: '/dashboard/prompts',    emoji: '📚' },
  { label: 'Account',  href: '/dashboard/settings',   emoji: '⚙️' },
]

export default function DashboardLayout({
  children, user, onLogout
}: {
  children: React.ReactNode
  user: AuthUser
  onLogout: () => void
}) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { dark, toggle: toggleDark }  = useDarkMode()

  const planBadgeClass =
    user.plan === 'BUSINESS' ? 'bg-purple-100 text-purple-700 border-purple-200' :
    user.plan === 'PRO'      ? 'bg-blue-100 text-blue-700 border-blue-200' :
                               'bg-gray-100 text-gray-500 border-gray-200'

  /* ── Sidebar inner content (reused for desktop + mobile drawer) ── */
  const SidebarInner = () => (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">

      {/* Logo row */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
        <Link href="/dashboard" onClick={() => setSidebarOpen(false)} className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-sm">
            <Zap className="w-4 h-4 text-white fill-white" />
          </div>
          <span className="font-display font-black text-lg tracking-tight text-gray-900 dark:text-white">
            Texti<span className="text-indigo-600">fe</span>
          </span>
        </Link>
        <div className="flex items-center gap-1">
          <button onClick={toggleDark}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors">
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          {/* Close button – mobile only */}
          <button onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* User chip */}
      <div className="px-3 py-3 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
        <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 rounded-xl p-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="text-sm font-black text-white">{user.fullName[0]?.toUpperCase()}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user.fullName}</p>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${planBadgeClass}`}>
              {user.plan}
            </span>
          </div>
        </div>
      </div>

      {/* Nav — scrollable */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        {NAV_GROUPS.map(group => (
          <div key={group.label}>
            <p className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-3 pt-3 pb-1.5">
              {group.label}
            </p>
            {group.items.map(item => {
              const active = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors mb-0.5 ${
                    active
                      ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  <span className="text-base leading-none flex-shrink-0">{item.emoji}</span>
                  <span className="flex-1 truncate">{item.label}</span>
                  {active && <ChevronRight className="w-3 h-3 text-indigo-400 flex-shrink-0" />}
                </Link>
              )
            })}
          </div>
        ))}

        {user.role === 'ADMIN' && (
          <>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-3 pt-3 pb-1.5">ADMIN</p>
            <Link href="/dashboard/admin" onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                pathname === '/dashboard/admin' ? 'bg-red-50 text-red-700' : 'text-gray-600 hover:bg-gray-50'
              }`}>
              <Shield className="w-4 h-4 flex-shrink-0" />
              <span>Admin Panel</span>
            </Link>
          </>
        )}
      </nav>

      {/* Upgrade nudge for FREE */}
      {user.plan === 'FREE' && (
        <div className="px-3 pb-2 flex-shrink-0">
          <Link href="/dashboard/billing" onClick={() => setSidebarOpen(false)}
            className="block p-3.5 rounded-xl text-white transition-opacity hover:opacity-95"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
            <div className="flex items-center gap-2 mb-1.5">
              <Zap className="w-4 h-4 text-yellow-300 fill-yellow-300" />
              <p className="text-xs font-black">Upgrade to Pro ⚡</p>
            </div>
            <p className="text-[11px] text-indigo-200 mb-2 leading-relaxed">
              2,000 replies · 3 bots · 24 Pro prompts
            </p>
            <div className="bg-white/20 rounded-lg py-1.5 text-center text-xs font-black">
              Upgrade Now →
            </div>
          </Link>
        </div>
      )}

      {/* Sign out */}
      <div className="px-3 pb-3 pt-2 border-t border-gray-100 dark:border-gray-800 flex-shrink-0">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </div>
  )

  return (
    /* Root: full viewport height, no overflow on mobile */
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* ── Desktop sidebar (fixed, left, hidden on < lg) ── */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 w-60 z-30 border-r border-gray-200 dark:border-gray-800 shadow-sm">
        <SidebarInner />
      </aside>

      {/* ── Mobile: dim overlay + slide-in drawer ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Overlay */}
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            {/* Drawer */}
            <motion.aside
              key="drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-64 shadow-2xl lg:hidden"
            >
              <SidebarInner />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main area: offset by sidebar on desktop, full-width on mobile ── */}
      <div className="lg:ml-60 flex flex-col min-h-screen">

        {/* Mobile topbar */}
        <header className="lg:hidden sticky top-0 z-20 flex items-center justify-between px-4 py-3 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white fill-white" />
            </div>
            <span className="font-display font-black text-lg tracking-tight text-gray-900 dark:text-white">
              Texti<span className="text-indigo-600">fe</span>
            </span>
          </Link>

          <button
            onClick={toggleDark}
            className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle theme"
          >
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </header>

        {/* Page content — padded bottom to clear mobile bottom nav */}
        <main className="flex-1 w-full px-4 py-5 lg:px-7 lg:py-7 pb-28 lg:pb-8 overflow-x-hidden">
          {children}
        </main>

        {/* ── Mobile bottom nav (fixed) ── */}
        <nav
          className="lg:hidden fixed bottom-0 left-0 right-0 z-20 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-800"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          <div className="flex items-stretch justify-around">
            {BOTTOM_NAV.map(item => {
              const active = pathname === item.href ||
                (item.href !== '/dashboard' && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-2.5 transition-colors ${
                    active ? 'text-indigo-600' : 'text-gray-400 dark:text-gray-500'
                  }`}
                >
                  <span className={`text-xl leading-none transition-transform ${active ? 'scale-110' : ''}`}>
                    {item.emoji}
                  </span>
                  <span className={`text-[9px] font-bold leading-tight ${active ? 'text-indigo-600' : 'text-gray-400'}`}>
                    {item.label}
                  </span>
                  {active && (
                    <div className="w-1 h-1 rounded-full bg-indigo-600 mt-0.5" />
                  )}
                </Link>
              )
            })}

            {/* More button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex flex-col items-center justify-center gap-0.5 flex-1 py-2.5 text-gray-400 dark:text-gray-500 transition-colors"
            >
              <span className="text-xl leading-none">☰</span>
              <span className="text-[9px] font-bold leading-tight">More</span>
            </button>
          </div>
        </nav>

      </div>
    </div>
  )
}
