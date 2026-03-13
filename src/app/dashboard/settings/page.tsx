'use client'
import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { useAuth, apiFetch } from '@/hooks/useAuth'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Shield, Bell, Palette, Key, Save, Check, Moon, Sun, Zap, Globe, Trash2, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { useDarkMode } from '@/hooks/useDarkMode'

const TABS = [
  { id: 'profile',   label: 'Profile',       icon: User,    emoji: '👤' },
  { id: 'security',  label: 'Security',      icon: Shield,  emoji: '🔒' },
  { id: 'appearance',label: 'Appearance',    icon: Palette, emoji: '🎨' },
  { id: 'api',       label: 'API Keys',      icon: Key,     emoji: '🔑' },
]

export default function SettingsPage() {
  const { user, loading, logout } = useAuth()
  const { dark, toggle: toggleDark } = useDarkMode()
  const [tab, setTab]         = useState('profile')
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)
  const [fullName, setFullName] = useState('')
  const [email, setEmail]     = useState('')
  const [oldPwd, setOldPwd]   = useState('')
  const [newPwd, setNewPwd]   = useState('')
  const [confPwd, setConfPwd] = useState('')
  const [apiKey, setApiKey]   = useState('')
  const [showApiKey, setShowApiKey] = useState(false)
  const [language, setLanguage] = useState('en')

  useEffect(() => {
    if (user) { setFullName(user.fullName); setEmail(user.email) }
  }, [user])

  const save = async () => {
    setSaving(true)
    try {
      await apiFetch('/api/users/me', { method: 'PATCH', body: JSON.stringify({ fullName, email }) })
      setSaved(true); toast.success('Settings saved! ✅')
      setTimeout(() => setSaved(false), 3000)
    } catch (e: any) { toast.error(e.message) }
    finally { setSaving(false) }
  }

  const changePassword = async () => {
    if (newPwd !== confPwd) { toast.error('Passwords do not match'); return }
    if (newPwd.length < 8) { toast.error('Password must be at least 8 characters'); return }
    setSaving(true)
    try {
      await apiFetch('/api/auth/change-password', { method: 'POST', body: JSON.stringify({ oldPassword: oldPwd, newPassword: newPwd }) })
      toast.success('Password updated! 🔒'); setOldPwd(''); setNewPwd(''); setConfPwd('')
    } catch (e: any) { toast.error(e.message) }
    finally { setSaving(false) }
  }

  if (loading || !user) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="spinner w-10 h-10 border-indigo-600" />
    </div>
  )

  return (
    <DashboardLayout user={user} onLogout={logout}>
      <div className="max-w-3xl space-y-6 page-enter pb-10">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-md">
            <Zap className="w-5 h-5 text-white fill-white" />
          </div>
          <div>
            <h1 className="font-display font-black text-2xl text-gray-900 dark:text-white">Settings</h1>
            <p className="text-gray-400 text-sm">Manage your account & preferences</p>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                tab === t.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-indigo-300'
              }`}>
              <span>{t.emoji}</span> {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          {tab === 'profile' && (
            <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="card p-6 space-y-5 dark:bg-gray-800">
              <h2 className="font-display font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-500" /> Profile Info
              </h2>

              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl font-black text-white">{user.fullName[0]?.toUpperCase()}</span>
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">{user.fullName}</p>
                  <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
                    user.plan === 'BUSINESS' ? 'bg-purple-100 text-purple-700' :
                    user.plan === 'PRO' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                  }`}>{user.plan} Plan</span>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Full Name</label>
                  <input className="input-field" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your name" />
                </div>
                <div>
                  <label className="form-label">Email Address</label>
                  <input className="input-field" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" />
                </div>
              </div>

              <div>
                <label className="form-label">Language</label>
                <select className="input-field" value={language} onChange={e => setLanguage(e.target.value)}>
                  <option value="en">🇺🇸 English</option>
                  <option value="ar">🇦🇪 Arabic</option>
                  <option value="fr">🇫🇷 French</option>
                  <option value="es">🇪🇸 Spanish</option>
                  <option value="de">🇩🇪 German</option>
                </select>
              </div>

              <button onClick={save} disabled={saving}
                className="btn-primary w-full sm:w-auto">
                {saving ? <><span className="spinner" /> Saving...</> : saved ? <><Check className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> Save Changes</>}
              </button>
            </motion.div>
          )}

          {tab === 'security' && (
            <motion.div key="security" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="space-y-4">
              <div className="card p-6 space-y-4 dark:bg-gray-800">
                <h2 className="font-display font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                  <Shield className="w-5 h-5 text-indigo-500" /> Change Password
                </h2>
                <div className="space-y-3">
                  <div>
                    <label className="form-label">Current Password</label>
                    <input className="input-field" type="password" value={oldPwd} onChange={e => setOldPwd(e.target.value)} placeholder="••••••••" />
                  </div>
                  <div>
                    <label className="form-label">New Password</label>
                    <input className="input-field" type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} placeholder="Min. 8 characters" />
                  </div>
                  <div>
                    <label className="form-label">Confirm New Password</label>
                    <input className="input-field" type="password" value={confPwd} onChange={e => setConfPwd(e.target.value)} placeholder="Repeat new password" />
                  </div>
                </div>
                <button onClick={changePassword} disabled={saving || !oldPwd || !newPwd} className="btn-primary w-full sm:w-auto">
                  {saving ? <><span className="spinner" /> Updating...</> : '🔒 Update Password'}
                </button>
              </div>

              <div className="card p-5 border-red-100 dark:bg-gray-800">
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-red-500" /> Danger Zone
                </h3>
                <p className="text-sm text-gray-400 mb-3">These actions are permanent and cannot be undone.</p>
                <button onClick={logout}
                  className="flex items-center gap-2 bg-red-50 text-red-600 border border-red-100 rounded-xl px-4 py-2.5 text-sm font-bold hover:bg-red-100 transition-all">
                  Sign Out of All Devices
                </button>
              </div>
            </motion.div>
          )}

          {tab === 'appearance' && (
            <motion.div key="appearance" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="card p-6 space-y-5 dark:bg-gray-800">
              <h2 className="font-display font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                <Palette className="w-5 h-5 text-indigo-500" /> Appearance
              </h2>

              <div>
                <label className="form-label mb-3">Color Theme</label>
                <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <button onClick={toggleDark}
                    className={`flex items-center gap-3 flex-1 p-3 rounded-xl border-2 transition-all ${!dark ? 'border-indigo-400 bg-white shadow-sm' : 'border-transparent'}`}>
                    <Sun className="w-5 h-5 text-amber-500" />
                    <div className="text-left">
                      <p className="font-bold text-sm text-gray-900">Light Mode</p>
                      <p className="text-[11px] text-gray-400">Clean and bright</p>
                    </div>
                    {!dark && <Check className="w-4 h-4 text-indigo-600 ml-auto" />}
                  </button>
                  <button onClick={toggleDark}
                    className={`flex items-center gap-3 flex-1 p-3 rounded-xl border-2 transition-all ${dark ? 'border-indigo-400 bg-gray-800 shadow-sm' : 'border-transparent'}`}>
                    <Moon className="w-5 h-5 text-indigo-400" />
                    <div className="text-left">
                      <p className={`font-bold text-sm ${dark ? 'text-white' : 'text-gray-900'}`}>Dark Mode</p>
                      <p className="text-[11px] text-gray-400">Easy on eyes</p>
                    </div>
                    {dark && <Check className="w-4 h-4 text-indigo-400 ml-auto" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="form-label">Accent Color</label>
                <div className="flex gap-3 flex-wrap">
                  {[
                    { name: 'Indigo', color: '#4f46e5' }, { name: 'Purple', color: '#7c3aed' },
                    { name: 'Blue', color: '#2563eb' },   { name: 'Teal', color: '#0d9488' },
                    { name: 'Rose', color: '#e11d48' },
                  ].map(c => (
                    <button key={c.name} title={c.name}
                      className="w-9 h-9 rounded-xl border-2 border-transparent hover:border-gray-300 transition-all hover:scale-110"
                      style={{ backgroundColor: c.color }} />
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2">Accent color customization coming in v3</p>
              </div>
            </motion.div>
          )}

          {tab === 'api' && (
            <motion.div key="api" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="card p-6 space-y-5 dark:bg-gray-800">
              <h2 className="font-display font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-indigo-500" /> API Configuration
              </h2>

              <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-amber-800">API keys are server-side only</p>
                  <p className="text-xs text-amber-600 mt-0.5">Your OpenAI API key is configured in the server environment and is never exposed to the browser for security.</p>
                </div>
              </div>

              <div>
                <label className="form-label">OpenAI API Key (server .env)</label>
                <div className="flex gap-2">
                  <input
                    className="input-field flex-1 font-mono text-xs"
                    type={showApiKey ? 'text' : 'password'}
                    placeholder="sk-••••••••••••••••••••••••••••••••"
                    readOnly
                    value="sk-configured-server-side"
                  />
                  <button onClick={() => setShowApiKey(!showApiKey)}
                    className="px-3 py-2 bg-gray-100 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-200 transition-all flex-shrink-0">
                    {showApiKey ? 'Hide' : 'Show'}
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1.5">Configure via OPENAI_API_KEY in your .env file</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { label: 'AI Model', value: 'gpt-4o-mini', status: 'active' },
                  { label: 'Max Tokens', value: '2,000', status: 'active' },
                  { label: 'Webhooks', value: 'WhatsApp + PayPal', status: 'active' },
                  { label: 'API Version', value: 'v2.1', status: 'active' },
                ].map(s => (
                  <div key={s.label} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400">{s.label}</p>
                      <p className="font-bold text-sm text-gray-900 dark:text-white">{s.value}</p>
                    </div>
                    <div className="flex items-center gap-1 bg-green-100 text-green-700 rounded-full px-2 py-0.5">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-[10px] font-bold">{s.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  )
}
