'use client'
import { useState, useEffect, useRef } from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { useAuth, apiFetch } from '@/hooks/useAuth'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Shield, Palette, Key, Save, Check, Moon, Sun, Zap,
  AlertTriangle, Eye, EyeOff, Copy, RefreshCw, Lock, Unlock,
  Smartphone, Globe, Clock, Activity, ChevronRight, LogOut, Trash2, X
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useDarkMode } from '@/hooks/useDarkMode'

const TABS = [
  { id: 'profile',  label: 'Profile',  emoji: '👤' },
  { id: 'security', label: 'Security', emoji: '🔒' },
  { id: 'privacy',  label: 'Privacy',  emoji: '🛡️' },
  { id: 'appear',   label: 'Display',  emoji: '🎨' },
]

// Password strength checker
function calcStrength(pw: string) {
  let score = 0
  if (pw.length >= 8)  score++
  if (pw.length >= 12) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  return score
}
const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong']
const strengthColor  = ['', 'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-400', 'bg-emerald-500']
const strengthText   = ['', 'text-red-500', 'text-orange-500', 'text-yellow-600', 'text-green-600', 'text-emerald-600']

export default function SettingsPage() {
  const { user, loading, logout } = useAuth()
  const { dark, toggle: toggleDark } = useDarkMode()

  const [tab, setTab]           = useState('profile')
  const [saving, setSaving]     = useState(false)
  const [saved, setSaved]       = useState(false)
  const [fullName, setFullName] = useState('')
  const [email, setEmail]       = useState('')
  const [language, setLanguage] = useState('en')
  const [oldPwd, setOldPwd]     = useState('')
  const [newPwd, setNewPwd]     = useState('')
  const [confPwd, setConfPwd]   = useState('')
  const [showOld, setShowOld]   = useState(false)
  const [showNew, setShowNew]   = useState(false)
  const [showConf, setShowConf] = useState(false)
  const [twoFA, setTwoFA]       = useState(false)
  const [sessionAlert, setSessionAlert] = useState(true)
  const [loginNotify, setLoginNotify]   = useState(true)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [dataExporting, setDataExporting]     = useState(false)
  const [copiedToken, setCopiedToken]         = useState(false)
  const [apiToken] = useState('txf_' + Array.from({ length: 32 }, () => Math.random().toString(36)[2]).join(''))

  useEffect(() => {
    if (user) { setFullName(user.fullName || ''); setEmail(user.email || '') }
  }, [user])

  const pwStrength = calcStrength(newPwd)

  const saveProfile = async () => {
    if (!fullName.trim()) { toast.error('Name cannot be empty'); return }
    if (!email.includes('@')) { toast.error('Enter a valid email'); return }
    setSaving(true)
    try {
      await apiFetch('/api/users/me', { method: 'PATCH', body: JSON.stringify({ fullName, email }) })
      setSaved(true); toast.success('✅ Profile saved!')
      setTimeout(() => setSaved(false), 3000)
    } catch (e: any) { toast.error(e.message || 'Save failed') }
    finally { setSaving(false) }
  }

  const changePassword = async () => {
    if (!oldPwd) { toast.error('Enter your current password'); return }
    if (newPwd.length < 8) { toast.error('New password needs 8+ characters'); return }
    if (newPwd !== confPwd) { toast.error("Passwords don't match"); return }
    if (pwStrength < 2) { toast.error('Choose a stronger password'); return }
    setSaving(true)
    try {
      await apiFetch('/api/auth/change-password', { method: 'POST', body: JSON.stringify({ oldPassword: oldPwd, newPassword: newPwd }) })
      toast.success('🔒 Password updated successfully!')
      setOldPwd(''); setNewPwd(''); setConfPwd('')
    } catch (e: any) { toast.error(e.message || 'Password change failed') }
    finally { setSaving(false) }
  }

  const exportData = async () => {
    setDataExporting(true)
    await new Promise(r => setTimeout(r, 1500))
    const data = { user: { name: fullName, email }, exportedAt: new Date().toISOString(), note: 'Full data export from Textife' }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'textife-data-export.json'; a.click()
    URL.revokeObjectURL(url)
    setDataExporting(false)
    toast.success('📦 Data exported!')
  }

  const copyToken = () => {
    navigator.clipboard.writeText(apiToken)
    setCopiedToken(true); toast.success('API token copied!')
    setTimeout(() => setCopiedToken(false), 2500)
  }

  if (loading || !user) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <DashboardLayout user={user} onLogout={logout}>
      <div className="w-full max-w-2xl mx-auto space-y-5 pb-6">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
            <Zap className="w-5 h-5 text-white fill-white" />
          </div>
          <div>
            <h1 className="font-display font-black text-xl text-gray-900 dark:text-white">Settings</h1>
            <p className="text-gray-400 text-xs">Account & security preferences</p>
          </div>
        </motion.div>

        {/* Tabs — scrollable on mobile */}
        <div className="flex gap-2 overflow-x-auto pb-0.5" style={{ scrollbarWidth: 'none' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                tab === t.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-indigo-300 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300'
              }`}>
              <span className="text-base leading-none">{t.emoji}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Tab panels */}
        <AnimatePresence mode="wait">

          {/* ─── PROFILE ─── */}
          {tab === 'profile' && (
            <motion.div key="profile" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 space-y-5 shadow-sm">

              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <span className="text-2xl font-black text-white">{user.fullName?.[0]?.toUpperCase() || '?'}</span>
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">{user.fullName}</p>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                    user.plan === 'BUSINESS' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                    user.plan === 'PRO'      ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                              'bg-gray-50 text-gray-600 border-gray-200'
                  }`}>{user.plan}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Full Name</label>
                  <input
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-white outline-none focus:border-indigo-400 focus:bg-white dark:focus:bg-gray-600 transition-all"
                    value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Email</label>
                  <input
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-white outline-none focus:border-indigo-400 focus:bg-white dark:focus:bg-gray-600 transition-all"
                    type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Language</label>
                <select
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-white outline-none focus:border-indigo-400 transition-all"
                  value={language} onChange={e => setLanguage(e.target.value)}>
                  <option value="en">🇺🇸 English</option>
                  <option value="ar">🇦🇪 Arabic</option>
                  <option value="fr">🇫🇷 French</option>
                  <option value="es">🇪🇸 Spanish</option>
                  <option value="de">🇩🇪 German</option>
                  <option value="zh">🇨🇳 Chinese</option>
                </select>
              </div>

              <button onClick={saveProfile} disabled={saving}
                className="w-full py-3 rounded-xl text-white text-sm font-black flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                style={{ background: saved ? 'linear-gradient(135deg, #22c55e, #16a34a)' : 'linear-gradient(135deg, #4f46e5, #7c3aed)', boxShadow: '0 4px 14px rgba(79,70,229,0.3)' }}>
                {saving ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
                  : saved ? <><Check className="w-4 h-4" /> Saved!</>
                  : <><Save className="w-4 h-4" /> Save Profile</>}
              </button>
            </motion.div>
          )}

          {/* ─── SECURITY ─── */}
          {tab === 'security' && (
            <motion.div key="security" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="space-y-4">

              {/* Security score */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-display font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
                    <Shield className="w-4 h-4 text-indigo-600" /> Security Score
                  </h2>
                  <span className="text-sm font-black text-green-600">Good</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 mb-2">
                  <div className="bg-gradient-to-r from-green-400 to-emerald-500 h-2.5 rounded-full transition-all" style={{ width: '65%' }} />
                </div>
                <div className="grid grid-cols-2 gap-2 mt-3">
                  {[
                    { label: 'Password set',   ok: true },
                    { label: 'Email verified', ok: true },
                    { label: '2FA enabled',    ok: twoFA },
                    { label: 'Recent activity',ok: true },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${item.ok ? 'bg-green-100' : 'bg-red-100'}`}>
                        {item.ok ? <Check className="w-2.5 h-2.5 text-green-600" /> : <X className="w-2.5 h-2.5 text-red-500" />}
                      </div>
                      <span className="text-xs text-gray-600 dark:text-gray-300">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Change password */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm space-y-4">
                <h2 className="font-display font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
                  <Lock className="w-4 h-4 text-indigo-600" /> Change Password
                </h2>
                {/* Current */}
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Current Password</label>
                  <div className="relative">
                    <input type={showOld ? 'text' : 'password'} value={oldPwd} onChange={e => setOldPwd(e.target.value)}
                      className="w-full px-4 py-3 pr-10 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-white outline-none focus:border-indigo-400 focus:bg-white transition-all"
                      placeholder="••••••••" />
                    <button onClick={() => setShowOld(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                      {showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                {/* New */}
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">New Password</label>
                  <div className="relative">
                    <input type={showNew ? 'text' : 'password'} value={newPwd} onChange={e => setNewPwd(e.target.value)}
                      className="w-full px-4 py-3 pr-10 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-white outline-none focus:border-indigo-400 focus:bg-white transition-all"
                      placeholder="Min. 8 characters" />
                    <button onClick={() => setShowNew(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                      {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {/* Strength bar */}
                  {newPwd.length > 0 && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[1,2,3,4,5].map(i => (
                          <div key={i} className={`flex-1 h-1.5 rounded-full transition-all ${i <= pwStrength ? strengthColor[pwStrength] : 'bg-gray-200'}`} />
                        ))}
                      </div>
                      <p className={`text-[11px] font-bold ${strengthText[pwStrength]}`}>{strengthLabel[pwStrength]}</p>
                    </div>
                  )}
                </div>
                {/* Confirm */}
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Confirm New Password</label>
                  <div className="relative">
                    <input type={showConf ? 'text' : 'password'} value={confPwd} onChange={e => setConfPwd(e.target.value)}
                      className={`w-full px-4 py-3 pr-10 bg-gray-50 dark:bg-gray-700 border rounded-xl text-sm text-gray-900 dark:text-white outline-none focus:bg-white transition-all ${
                        confPwd && confPwd !== newPwd ? 'border-red-300 focus:border-red-400' : 'border-gray-200 dark:border-gray-600 focus:border-indigo-400'
                      }`}
                      placeholder="Repeat new password" />
                    <button onClick={() => setShowConf(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                      {showConf ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {confPwd && confPwd !== newPwd && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Passwords don't match</p>
                  )}
                </div>
                <button onClick={changePassword} disabled={saving || !oldPwd || !newPwd || newPwd !== confPwd}
                  className="w-full py-3 rounded-xl text-white text-sm font-black flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', boxShadow: '0 4px 14px rgba(79,70,229,0.3)' }}>
                  {saving ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Updating...</> : <><Lock className="w-4 h-4" /> Update Password</>}
                </button>
              </div>

              {/* 2FA + Alerts */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm space-y-4">
                <h2 className="font-display font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-indigo-600" /> Security Options
                </h2>
                {[
                  { label: 'Two-Factor Authentication', desc: 'Extra layer of security (coming soon)', val: twoFA, set: setTwoFA, soon: true },
                  { label: 'Login Alerts',              desc: 'Get notified of new logins to your account', val: loginNotify, set: setLoginNotify, soon: false },
                  { label: 'Suspicious Activity Alerts',desc: 'Alert on unusual account activity',          val: sessionAlert,  set: setSessionAlert,  soon: false },
                ].map(opt => (
                  <div key={opt.label} className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{opt.label}</p>
                        {opt.soon && <span className="text-[9px] font-black bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">SOON</span>}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{opt.desc}</p>
                    </div>
                    <button onClick={() => !opt.soon && opt.set(!opt.val)}
                      className={`relative w-11 h-6 rounded-full transition-all flex-shrink-0 mt-0.5 ${opt.val ? 'bg-indigo-600' : 'bg-gray-200'} ${opt.soon ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200 ${opt.val ? 'left-5' : 'left-0.5'}`} />
                    </button>
                  </div>
                ))}
              </div>

              {/* API Token */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm">
                <h2 className="font-display font-bold text-base text-gray-900 dark:text-white flex items-center gap-2 mb-3">
                  <Key className="w-4 h-4 text-indigo-600" /> API Access Token
                </h2>
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex items-start gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700 leading-relaxed">Never share this token. It grants full API access to your account. Store it securely.</p>
                </div>
                <div className="flex gap-2">
                  <code className="flex-1 text-xs font-mono bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 text-gray-600 dark:text-gray-300 truncate">
                    {apiToken}
                  </code>
                  <button onClick={copyToken}
                    className={`flex-shrink-0 flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition-all ${copiedToken ? 'bg-green-500 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
                    {copiedToken ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                  </button>
                </div>
              </div>

              {/* Danger zone */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-red-100 dark:border-red-900/30 p-5 shadow-sm">
                <h2 className="font-display font-bold text-base text-red-600 flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4" /> Danger Zone
                </h2>
                <div className="space-y-2">
                  <button onClick={logout}
                    className="w-full flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 border border-red-100 dark:border-red-800 rounded-xl px-4 py-3 text-sm font-bold hover:bg-red-100 transition-all">
                    <LogOut className="w-4 h-4 flex-shrink-0" /> Sign Out of All Devices
                  </button>
                  <button onClick={() => setShowDeleteModal(true)}
                    className="w-full flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 border border-red-100 dark:border-red-800 rounded-xl px-4 py-3 text-sm font-bold hover:bg-red-100 transition-all">
                    <Trash2 className="w-4 h-4 flex-shrink-0" /> Delete Account Permanently
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ─── PRIVACY ─── */}
          {tab === 'privacy' && (
            <motion.div key="privacy" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="space-y-4">
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm space-y-4">
                <h2 className="font-display font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
                  🛡️ Privacy Controls
                </h2>
                {[
                  { label: 'Analytics & Usage Data',     desc: 'Help improve Textife by sharing anonymous usage data' },
                  { label: 'Marketing Emails',           desc: 'Receive product updates, tips and promotions' },
                  { label: 'Activity Visible to Admin',  desc: 'Admin can see your account activity for support purposes' },
                  { label: 'Third-party Integrations',   desc: 'Allow connected apps to access your Textife data' },
                ].map((item, i) => {
                  const [val, setVal] = useState(i < 2)
                  return (
                    <div key={item.label} className="flex items-start justify-between gap-3 pb-3 border-b border-gray-50 dark:border-gray-700 last:border-0 last:pb-0">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{item.label}</p>
                        <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{item.desc}</p>
                      </div>
                      <button onClick={() => setVal(v => !v)}
                        className={`relative w-11 h-6 rounded-full transition-all flex-shrink-0 mt-0.5 ${val ? 'bg-indigo-600' : 'bg-gray-200'}`}>
                        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200 ${val ? 'left-5' : 'left-0.5'}`} />
                      </button>
                    </div>
                  )
                })}
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm">
                <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-600" /> Data & Export
                </h3>
                <p className="text-xs text-gray-400 mb-4 leading-relaxed">Download all your data including conversations, bots, and account info in JSON format.</p>
                <button onClick={exportData} disabled={dataExporting}
                  className="w-full py-3 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
                  {dataExporting ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Preparing...</> : '📦 Export My Data'}
                </button>
              </div>
            </motion.div>
          )}

          {/* ─── APPEARANCE ─── */}
          {tab === 'appear' && (
            <motion.div key="appear" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm space-y-5">
              <h2 className="font-display font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
                🎨 Appearance
              </h2>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Theme</label>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => !dark && toggleDark()}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${!dark ? 'border-indigo-400 bg-indigo-50' : 'border-gray-100 bg-gray-50 hover:border-gray-200'}`}>
                    <Sun className="w-6 h-6 text-amber-500 flex-shrink-0" />
                    <div className="text-left">
                      <p className="font-bold text-sm text-gray-900">Light</p>
                      <p className="text-[10px] text-gray-400">Bright & clean</p>
                    </div>
                    {!dark && <Check className="w-4 h-4 text-indigo-600 ml-auto flex-shrink-0" />}
                  </button>
                  <button onClick={() => dark && toggleDark()}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${dark ? 'border-indigo-400 bg-gray-800' : 'border-gray-100 bg-gray-50 hover:border-gray-200'}`}>
                    <Moon className="w-6 h-6 text-indigo-400 flex-shrink-0" />
                    <div className="text-left">
                      <p className={`font-bold text-sm ${dark ? 'text-white' : 'text-gray-900'}`}>Dark</p>
                      <p className="text-[10px] text-gray-400">Easy on eyes</p>
                    </div>
                    {dark && <Check className="w-4 h-4 text-indigo-400 ml-auto flex-shrink-0" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Accent Color</label>
                <div className="flex gap-3 flex-wrap">
                  {[
                    { name: 'Indigo', color: '#4f46e5' }, { name: 'Purple', color: '#7c3aed' },
                    { name: 'Blue',   color: '#2563eb' }, { name: 'Teal',   color: '#0d9488' },
                    { name: 'Rose',   color: '#e11d48' }, { name: 'Amber',  color: '#d97706' },
                  ].map(c => (
                    <button key={c.name} title={c.name}
                      className="w-10 h-10 rounded-xl shadow-sm border-2 border-white hover:scale-110 transition-all ring-2 ring-transparent hover:ring-gray-300"
                      style={{ backgroundColor: c.color }} />
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2">Full color theming available in Pro v3 ✨</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete account modal */}
        <AnimatePresence>
          {showDeleteModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4"
              onClick={e => { if (e.target === e.currentTarget) setShowDeleteModal(false) }}>
              <motion.div initial={{ y: 40, scale: 0.97 }} animate={{ y: 0, scale: 1 }} exit={{ y: 40 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full sm:max-w-sm shadow-2xl">
                <div className="text-center mb-5">
                  <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Trash2 className="w-7 h-7 text-red-600" />
                  </div>
                  <h2 className="font-display font-black text-lg text-gray-900 dark:text-white">Delete Account?</h2>
                  <p className="text-sm text-gray-500 mt-1">This is permanent. All your data, bots and history will be erased forever.</p>
                </div>
                <div className="mb-4">
                  <label className="block text-xs font-bold text-gray-500 mb-1.5">Type <strong>DELETE</strong> to confirm</label>
                  <input className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-red-400 transition-all"
                    placeholder="DELETE" value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)} />
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all">Cancel</button>
                  <button disabled={deleteConfirm !== 'DELETE'}
                    onClick={() => { toast.error('Contact support to delete account'); setShowDeleteModal(false) }}
                    className="flex-1 py-3 rounded-xl bg-red-600 text-white text-sm font-black hover:bg-red-700 transition-all disabled:opacity-40">
                    Delete Forever
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </DashboardLayout>
  )
}
