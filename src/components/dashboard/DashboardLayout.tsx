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
      { icon: Lightbulb,    label: 'Business Ideas',  href: '/dashboard/ideas',      emoji: '💡' },
      { icon: DollarSign,   label: 'Money Maker',     href: '/dashboard/money',      emoji: '💰' },
      { icon: PenTool,      label: 'Content Hub',     href: '/dashboard/content',    emoji: '✍️' },
      { icon: Send,         label: 'Sales Messages',  href: '/dashboard/sales',      emoji: '📣' },
      { icon: Star,         label: 'Personal Growth', href: '/dashboard/growth',     emoji: '🌱' },
      { icon: Zap,          label: 'Quick Tools',     href: '/dashboard/quicktools', emoji: '⚡' },
      { icon: BookOpen,     label: 'Prompt Library',  href: '/dashboard/prompts',    emoji: '📚' },
    ]
  },
  {
    label: 'WHATSAPP',
    items: [
      { icon: Bot,           label: 'My Bots',        href: '/dashboard/bots',       emoji: '🤖' },
      { icon: MessageSquare, label: 'AI Chat',        href: '/dashboard/chat',       emoji: '💬' },
      { icon: FileText,      label: 'Templates',      href: '/dashboard/templates',  emoji: '📋' },
      { icon: Users,         label: 'Leads',          href: '/dashboard/leads',      emoji: '👥' },
    ]
  },
  {
    label: 'ACCOUNT',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard',   href: '/dashboard',             emoji: '🏠' },
      { icon: BarChart3,     label: 'Analytics',     href: '/dashboard/analytics',   emoji: '📊' },
      { icon: Trophy,        label: 'Achievements',  href: '/dashboard/achievements',emoji: '🏆' },
      { icon: Gift,          label: 'Referral',      href: '/dashboard/referral',    emoji: '🎁' },
      { icon: CreditCard,    label: 'Billing',       href: '/dashboard/billing',     emoji: '💳' },
      { icon: Settings,      label: 'Settings',      href: '/dashboard/settings',    emoji: '⚙️' },
    ]
  }
]

// Bottom nav items for mobile (most used)
const BOTTOM_NAV = [
  { icon: LayoutDashboard, label: 'Home',    href: '/dashboard',         emoji: '🏠' },
  { icon: Zap,             label: 'Tools',   href: '/dashboard/quicktools', emoji: '⚡' },
  { icon: Bot,             label: 'Bots',    href: '/dashboard/bots',    emoji: '🤖' },
  { icon: BookOpen,        label: 'Prompts', href: '/dashboard/prompts', emoji: '📚' },
  { icon: Settings,        label: 'Settings',href: '/dashboard/settings',emoji: '⚙️' },
]

export default function DashboardLayout({ children, user, onLogout }: {
  children: React.ReactNode; user: AuthUser; onLogout: () => void
}) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const { dark, toggle: toggleDark } = useDarkMode()

  const planBadge = user.plan === 'BUSINESS'
    ? 'bg-purple-100 text-purple-700 border border-purple-200'
    : user.plan === 'PRO'
    ? 'bg-blue-100 text-blue-700 border border-blue-200'
    : 'bg-gray-100 text-gray-600 border border-gray-200'

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 overflow-hidden">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center shadow-sm">
              <Zap className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="font-display font-black text-lg text-gray-900 dark:text-white tracking-tight">
              Texti<span className="text-primary-600">fe</span>
            </span>
          </Link>
          <div className="flex items-center gap-1">
            <button onClick={toggleDark} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-all">
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-all lg:hidden">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* User card */}
      <div className="px-3 py-3 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3 p-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-400 to-purple-500 flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="text-sm font-black text-white">{user.fullName[0].toUpperCase()}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user.fullName}</p>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${planBadge}`}>{user.plan}</span>
          </div>
        </div>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto space-y-0.5 scrollbar-hide">
        {NAV_GROUPS.map(group => (
          <div key={group.label}>
            <p className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-3 pt-3 pb-1.5">{group.label}</p>
            {group.items.map(item => {
              const Icon = item.icon
              const active = pathname === item.href
              return (
                <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                    active
                      ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}>
                  <span className="text-base flex-shrink-0">{item.emoji}</span>
                  <span className="truncate">{item.label}</span>
                  {active && <ChevronRight className="w-3 h-3 ml-auto text-primary-400 flex-shrink-0" />}
                </Link>
              )
            })}
          </div>
        ))}
        {user.role === 'ADMIN' && (
          <>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-3 pt-3 pb-1.5">ADMIN</p>
            <Link href="/dashboard/admin" onClick={() => setOpen(false)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${pathname === '/dashboard/admin' ? 'bg-red-50 text-red-700' : 'text-gray-600 hover:bg-gray-50'}`}>
              <Shield className="w-4 h-4 flex-shrink-0" /> Admin Panel
            </Link>
          </>
        )}
      </nav>

      {/* Upgrade nudge */}
      {user.plan === 'FREE' && (
        <div className="mx-3 mb-3">
          <Link href="/dashboard/billing"
            className="block p-3.5 bg-gradient-to-br from-primary-600 to-purple-600 rounded-xl text-white hover:opacity-95 transition-all shadow-md">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-5 h-5 bg-white/20 rounded-lg flex items-center justify-center">
                <Zap className="w-3 h-3 text-yellow-300 fill-yellow-300" />
              </div>
              <p className="text-xs font-black">Upgrade to Pro ⚡</p>
            </div>
            <p className="text-[11px] text-primary-100 mb-2 leading-relaxed">2,000 replies · 3 bots · All 24 Pro prompts</p>
            <div className="bg-white/20 rounded-lg px-3 py-1.5 text-center text-xs font-black text-white">
              Upgrade Now →
            </div>
          </Link>
        </div>
      )}

      {/* Logout */}
      <div className="px-3 pb-3 border-t border-gray-100 dark:border-gray-800 pt-2">
        <button onClick={onLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 border-r border-gray-200 dark:border-gray-800 fixed inset-y-0 z-30 shadow-sm">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm" />
            <motion.aside
              initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="fixed inset-y-0 left-0 w-64 z-50 lg:hidden shadow-2xl">
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        {/* Mobile topbar */}
        <div className="lg:hidden sticky top-0 z-20 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between">
          <button onClick={() => setOpen(true)} className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all">
            <Menu className="w-5 h-5" />
          </button>
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white fill-white" />
            </div>
            <span className="font-display font-black text-gray-900 dark:text-white text-lg tracking-tight">
              Texti<span className="text-primary-600">fe</span>
            </span>
          </Link>
          <button onClick={toggleDark} className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all">
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-5 lg:p-7 pb-24 lg:pb-7">
          {children}
        </main>

        {/* Mobile bottom navigation */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-20 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 safe-area-bottom">
          <div className="flex items-center justify-around px-2 py-2">
            {BOTTOM_NAV.map(item => {
              const active = pathname === item.href
              return (
                <Link key={item.href} href={item.href}
                  className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all min-w-0 ${
                    active ? 'text-primary-600' : 'text-gray-400 dark:text-gray-500'
                  }`}>
                  <span className={`text-lg ${active ? 'scale-110' : ''} transition-transform`}>{item.emoji}</span>
                  <span className={`text-[9px] font-bold truncate ${active ? 'text-primary-600' : 'text-gray-400'}`}>{item.label}</span>
                  {active && <div className="w-1 h-1 bg-primary-600 rounded-full" />}
                </Link>
              )
            })}
            <button onClick={() => setOpen(true)}
              className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-gray-400">
              <span className="text-lg">☰</span>
              <span className="text-[9px] font-bold">More</span>
            </button>
          </div>
        </nav>
      </div>
    </div>
  )
}
