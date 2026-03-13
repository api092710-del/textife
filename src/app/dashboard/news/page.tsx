'use client'
import { useState, useEffect, useCallback } from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { useAuth, apiFetch } from '@/hooks/useAuth'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  Shield, AlertTriangle, RefreshCw, Crown, ChevronDown, ChevronUp,
  Copy, Check, Zap, Eye, Bell, TrendingUp, Lock, Globe, Wifi
} from 'lucide-react'
import toast from 'react-hot-toast'

const SEVERITY_CONFIG = {
  CRITICAL: { bg: 'bg-red-50',    border: 'border-red-200',    badge: 'bg-red-500',    text: 'text-red-700',    label: '🔴 CRITICAL' },
  HIGH:     { bg: 'bg-orange-50', border: 'border-orange-200', badge: 'bg-orange-500', text: 'text-orange-700', label: '🟠 HIGH' },
  MEDIUM:   { bg: 'bg-yellow-50', border: 'border-yellow-200', badge: 'bg-yellow-500', text: 'text-yellow-700', label: '🟡 MEDIUM' },
}

const TYPE_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  SCAM:     { bg: 'bg-red-100',    text: 'text-red-700',    label: 'SCAM' },
  HACK:     { bg: 'bg-purple-100', text: 'text-purple-700', label: 'HACK' },
  PHISHING: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'PHISHING' },
  FRAUD:    { bg: 'bg-rose-100',   text: 'text-rose-700',   label: 'FRAUD' },
  WARNING:  { bg: 'bg-amber-100',  text: 'text-amber-700',  label: 'WARNING' },
}

const TREND_CONFIG: Record<string, { bg: string; text: string }> = {
  RISING: { bg: 'bg-red-100',    text: 'text-red-600' },
  ACTIVE: { bg: 'bg-orange-100', text: 'text-orange-600' },
  NEW:    { bg: 'bg-blue-100',   text: 'text-blue-600' },
}

function AlertCard({ alert, index, isPro }: { alert: any; index: number; isPro: boolean }) {
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied]     = useState(false)

  const severity = SEVERITY_CONFIG[alert.severity as keyof typeof SEVERITY_CONFIG] || SEVERITY_CONFIG.MEDIUM
  const type     = TYPE_CONFIG[alert.type] || TYPE_CONFIG.WARNING
  const trend    = TREND_CONFIG[alert.trend] || TREND_CONFIG.ACTIVE

  const shareText = `🚨 SECURITY ALERT: ${alert.title}\n\n${alert.summary}\n\nStay safe with Textife — textife.com`

  const copy = () => {
    navigator.clipboard.writeText(shareText)
    setCopied(true)
    toast.success('Alert copied — warn your friends!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`rounded-2xl border-2 overflow-hidden ${severity.border} ${severity.bg}`}
    >
      {/* Alert header */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full text-left p-4"
      >
        <div className="flex items-start gap-3">
          {/* Emoji + severity dot */}
          <div className="relative flex-shrink-0">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm text-2xl">
              {alert.emoji || '⚠️'}
            </div>
            <div className={`absolute -top-1 -right-1 w-4 h-4 ${severity.badge} rounded-full border-2 border-white flex items-center justify-center`}>
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${type.bg} ${type.text}`}>
                {type.label}
              </span>
              <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${trend.bg} ${trend.text}`}>
                {alert.trend === 'RISING' ? '📈' : alert.trend === 'NEW' ? '🆕' : '⚡'} {alert.trend}
              </span>
              <span className={`text-[9px] font-bold ${severity.text}`}>{severity.label}</span>
            </div>
            <h3 className="font-display font-black text-sm text-gray-900 leading-snug">{alert.title}</h3>
            <p className="text-xs text-gray-600 mt-1 leading-relaxed line-clamp-2">{alert.summary}</p>

            {/* Platform chips */}
            {alert.affectedPlatforms?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {alert.affectedPlatforms.map((p: string) => (
                  <span key={p} className="text-[9px] font-bold bg-white/80 border border-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">
                    {p}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Expand icon */}
          <div className="flex-shrink-0 mt-1">
            {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
          </div>
        </div>
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-white/60"
          >
            <div className="p-4 bg-white/70 space-y-4">
              {/* How it works */}
              <div>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">How This Attack Works</p>
                <p className="text-sm text-gray-700 leading-relaxed">{alert.description}</p>
              </div>

              {/* How to protect */}
              {alert.howToProtect?.length > 0 && (
                <div>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">🛡️ Protect Yourself Now</p>
                  <div className="space-y-2">
                    {alert.howToProtect.map((tip: string, i: number) => (
                      <div key={i} className="flex items-start gap-2.5 bg-green-50 border border-green-100 rounded-xl px-3 py-2.5">
                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                        <p className="text-xs text-gray-700 leading-relaxed">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Share button */}
              <button onClick={copy}
                className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all border ${
                  copied
                    ? 'bg-green-500 text-white border-green-500'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}>
                {copied
                  ? <><Check className="w-3.5 h-3.5" /> Copied — paste to warn your contacts!</>
                  : <><Copy className="w-3.5 h-3.5" /> Share this alert with friends</>
                }
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function NewsPage() {
  const { user, loading, logout } = useAuth()
  const [alerts, setAlerts]       = useState<any[]>([])
  const [tip, setTip]             = useState<string>('')
  const [fetching, setFetching]   = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const [isPro, setIsPro]         = useState(false)

  const fetchAlerts = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setFetching(true)
    try {
      const res = await apiFetch('/api/news')
      setAlerts(res.alerts || [])
      setTip(res.tip || '')
      setIsPro(res.isPro || false)
      setLastUpdated(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }))
    } catch (e: any) {
      toast.error('Failed to load alerts')
    } finally {
      setFetching(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { if (user) fetchAlerts() }, [user])

  if (loading || !user) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <DashboardLayout user={user} onLogout={logout}>
      <div className="w-full max-w-2xl mx-auto space-y-5 pb-8">

        {/* ── HERO ── */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl p-5 text-white"
          style={{ background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 40%, #7f1d1d 100%)' }}>
          <div className="absolute inset-0 opacity-[0.08]"
            style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
          <div className="relative flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-red-300" />
                <span className="text-red-200 font-bold text-xs uppercase tracking-widest">Live Security Feed</span>
                <div className="w-2 h-2 bg-red-300 rounded-full animate-pulse" />
              </div>
              <h1 className="font-display font-black text-2xl sm:text-3xl mb-1">Scam & Hack Alerts 🚨</h1>
              <p className="text-red-200 text-sm leading-relaxed">
                Real threats targeting people like you — updated daily. Stay one step ahead.
              </p>
            </div>
            <button onClick={() => fetchAlerts(true)} disabled={refreshing}
              className="flex-shrink-0 flex items-center gap-1.5 bg-white/15 hover:bg-white/25 border border-white/20 rounded-xl px-3 py-2 text-xs font-bold text-white transition-all">
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Updating...' : 'Refresh'}
            </button>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-2 mt-4 flex-wrap">
            <div className="bg-white/15 rounded-xl px-3 py-1.5 flex items-center gap-1.5">
              <Bell className="w-3 h-3 text-red-200" />
              <span className="text-xs font-bold">{alerts.length} Active Alerts</span>
            </div>
            <div className="bg-white/15 rounded-xl px-3 py-1.5 flex items-center gap-1.5">
              <Eye className="w-3 h-3 text-red-200" />
              <span className="text-xs font-bold">Updated {lastUpdated || 'today'}</span>
            </div>
            {!isPro && (
              <div className="bg-yellow-400/20 border border-yellow-400/30 rounded-xl px-3 py-1.5 flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-yellow-300" />
                <span className="text-xs font-bold text-yellow-200">+3 Pro alerts locked</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* ── DAILY TIP ── */}
        {tip && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 p-4 flex items-start gap-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Zap className="w-4 h-4 text-yellow-300 fill-yellow-300" />
            </div>
            <div>
              <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">💡 Today's Security Tip</p>
              <p className="text-sm text-gray-800 font-semibold leading-relaxed">{tip}</p>
            </div>
          </motion.div>
        )}

        {/* ── ALERTS LIST ── */}
        {fetching ? (
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-100 rounded-full w-3/4" />
                    <div className="h-4 bg-gray-100 rounded-full" />
                    <div className="h-3 bg-gray-100 rounded-full w-5/6" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert, i) => (
              <AlertCard key={alert.id || i} alert={alert} index={i} isPro={isPro} />
            ))}
          </div>
        )}

        {/* ── PRO LOCKED SECTION ── */}
        {!isPro && !fetching && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="relative overflow-hidden rounded-2xl border-2 border-dashed border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50">

            {/* Blurred fake alerts behind */}
            <div className="p-4 space-y-3 select-none pointer-events-none" style={{ filter: 'blur(3px)', opacity: 0.4 }}>
              {[
                { title: 'New Deepfake WhatsApp Video Scam Circulating in Gulf Region', type: 'HACK', sev: '🔴 CRITICAL' },
                { title: 'Fake Job Offers Stealing LinkedIn Credentials at Scale', type: 'PHISHING', sev: '🟠 HIGH' },
                { title: 'SIM Swap Attack Targets Crypto Wallets — 3 Steps to Block It', type: 'FRAUD', sev: '🔴 CRITICAL' },
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-xl p-3.5 border border-gray-200">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] font-black bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">{item.type}</span>
                    <span className="text-[9px] text-gray-500">{item.sev}</span>
                  </div>
                  <p className="text-sm font-bold text-gray-900">{item.title}</p>
                </div>
              ))}
            </div>

            {/* Overlay CTA */}
            <div className="absolute inset-0 flex items-center justify-center p-5">
              <div className="text-center">
                <div className="w-14 h-14 bg-white border-2 border-amber-300 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <Lock className="w-7 h-7 text-amber-500" />
                </div>
                <h3 className="font-display font-black text-lg text-gray-900 mb-1">3 More Critical Alerts Locked</h3>
                <p className="text-sm text-gray-500 mb-4 max-w-xs mx-auto leading-relaxed">
                  Pro members see <strong>5 daily alerts</strong> with full descriptions, protection tips, and platform-specific warnings.
                </p>
                <Link href="/dashboard/billing"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl px-6 py-3 font-black text-sm hover:opacity-90 transition-all shadow-lg">
                  <Crown className="w-4 h-4" /> Upgrade to See All Alerts
                </Link>
                <p className="text-xs text-gray-400 mt-2">Includes scam alerts, hack warnings, phishing detection & more</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── PROTECTION CHECKLIST ── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-display font-bold text-sm text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-green-600" /> 🛡️ Daily Security Checklist
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { icon: '🔒', tip: 'Check for suspicious logins on your bank app' },
              { icon: '📱', tip: 'Review app permissions on your phone weekly' },
              { icon: '🔑', tip: 'Never share OTPs — not even with "bank staff"' },
              { icon: '🌐', tip: 'Use a VPN on public WiFi networks always' },
              { icon: '👁️', tip: 'Check privacy settings on Instagram & TikTok' },
              { icon: '💳', tip: 'Enable instant transaction alerts on all cards' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2.5 p-2.5 bg-gray-50 rounded-xl">
                <span className="text-base flex-shrink-0 leading-none mt-0.5">{item.icon}</span>
                <p className="text-xs text-gray-700 leading-relaxed">{item.tip}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── FOMO FOOTER ── */}
        {!isPro && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            className="relative overflow-hidden rounded-2xl p-5 text-white"
            style={{ background: 'linear-gradient(135deg, #dc2626 0%, #9333ea 100%)' }}>
            <div className="absolute inset-0 opacity-[0.06]"
              style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "18px 18px" }} />
            <div className="relative flex flex-col sm:flex-row items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <TrendingUp className="w-4 h-4 text-yellow-300" />
                  <span className="text-yellow-300 font-black text-xs uppercase tracking-widest">Pro members are safer</span>
                </div>
                <h3 className="font-display font-black text-lg mb-1">5 alerts/day vs your 2</h3>
                <p className="text-red-200 text-xs leading-relaxed mb-3">
                  Pro users see 3 more critical threats daily — the attacks you don't know about are the ones that get you.
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {['5 daily alerts', 'Full descriptions', 'Platform-specific', 'Protection steps', 'Weekly digest'].map(f => (
                    <span key={f} className="bg-white/15 rounded-lg px-2 py-0.5 text-[11px] font-semibold">{f}</span>
                  ))}
                </div>
              </div>
              <Link href="/dashboard/billing"
                className="flex-shrink-0 flex items-center gap-2 bg-yellow-400 text-yellow-900 rounded-xl px-5 py-3 font-black text-sm hover:bg-yellow-300 transition-all shadow-lg w-full sm:w-auto justify-center">
                <Crown className="w-4 h-4" /> Upgrade Now
              </Link>
            </div>
          </motion.div>
        )}

      </div>
    </DashboardLayout>
  )
}
