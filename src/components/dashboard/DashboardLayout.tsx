'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, MessageSquare, Bot, BarChart3, FileText, CreditCard, Settings, LogOut, Menu, X, Zap, Shield, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { AuthUser } from '@/hooks/useAuth'

const NAV = [
  { icon: LayoutDashboard, label: 'Dashboard',  href: '/dashboard' },
  { icon: MessageSquare,   label: 'AI Chat',    href: '/dashboard/chat' },
  { icon: Bot,             label: 'My Bots',    href: '/dashboard/bots' },
  { icon: BarChart3,       label: 'Analytics',  href: '/dashboard/analytics' },
  { icon: FileText,        label: 'Templates',  href: '/dashboard/templates' },
  { icon: CreditCard,      label: 'Billing',    href: '/dashboard/billing' },
  { icon: Settings,        label: 'Settings',   href: '/dashboard/settings' },
]

export default function DashboardLayout({ children, user, onLogout }: { children: React.ReactNode; user: AuthUser; onLogout: () => void }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const planColor = user.plan === 'BUSINESS' ? 'badge-purple' : user.plan === 'PRO' ? 'badge-blue' : 'badge-gray'

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-gray-100 flex items-center gap-2.5">
        <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center"><Zap className="w-4 h-4 text-white fill-white" /></div>
        <span className="font-display font-bold text-lg text-gray-900">Texti<span className="text-primary-600">fe</span></span>
      </div>

      {/* User */}
      <div className="px-4 py-4 border-b border-gray-100 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-bold text-primary-600">{user.fullName[0].toUpperCase()}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-900 truncate">{user.fullName}</p>
          <span className={`badge text-[10px] ${planColor}`}>{user.plan}</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {NAV.map(item => {
          const Icon  = item.icon
          const active = pathname === item.href
          return (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
              className={`nav-item ${active ? 'active' : ''}`}>
              <Icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
              {active && <ChevronRight className="w-3.5 h-3.5 ml-auto text-primary-400" />}
            </Link>
          )
        })}
        {user.role === 'ADMIN' && (
          <>
            <div className="pt-3 pb-1 px-3"><p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Admin</p></div>
            <Link href="/dashboard/admin" onClick={() => setOpen(false)} className={`nav-item ${pathname === '/dashboard/admin' ? 'active' : ''}`}>
              <Shield className="w-4 h-4" /> Admin Panel
            </Link>
          </>
        )}
      </nav>

      {/* Logout */}
      <div className="px-3 py-3 border-t border-gray-100">
        <button onClick={onLogout} className="nav-item w-full text-red-500 hover:bg-red-50 hover:text-red-600">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-56 border-r border-gray-200 fixed inset-y-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setOpen(false)} className="fixed inset-0 bg-black/30 z-40 lg:hidden" />
            <motion.aside initial={{ x: -240 }} animate={{ x: 0 }} exit={{ x: -240 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 w-56 z-50 lg:hidden shadow-2xl">
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 lg:ml-56 flex flex-col">
        {/* Mobile topbar */}
        <div className="lg:hidden sticky top-0 z-20 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <button onClick={() => setOpen(true)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"><Menu className="w-5 h-5" /></button>
          <Link href="/dashboard" className="flex items-center gap-1.5">
            <div className="w-6 h-6 bg-primary-600 rounded-md flex items-center justify-center"><Zap className="w-3.5 h-3.5 text-white fill-white" /></div>
            <span className="font-display font-bold text-gray-900">Textife</span>
          </Link>
          <div className="w-9" />
        </div>
        <main className="flex-1 p-5 lg:p-7">{children}</main>
      </div>
    </div>
  )
}
