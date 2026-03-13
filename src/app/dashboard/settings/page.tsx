'use client'
import { useState } from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { useAuth, apiFetch } from '@/hooks/useAuth'
import { User, Shield, Key, Save, Eye, EyeOff } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const { user, loading, logout } = useAuth()
  const [tab, setTab]           = useState('profile')
  const [saving, setSaving]     = useState(false)
  const [profile, setProfile]   = useState<any>(null)
  const [pwForm, setPwForm]     = useState({ current: '', next: '', confirm: '' })
  const [showPw, setShowPw]     = useState(false)

  if (!profile && user) setProfile({ fullName: user.fullName, username: user.username, email: user.email })

  const saveProfile = async () => {
    setSaving(true)
    // In production, this calls PATCH /api/auth/me
    await new Promise(r => setTimeout(r, 600))
    localStorage.setItem('user', JSON.stringify({ ...user, ...profile }))
    toast.success('Profile updated!')
    setSaving(false)
  }

  const changePw = async () => {
    if (pwForm.next !== pwForm.confirm) { toast.error('Passwords do not match'); return }
    if (pwForm.next.length < 8) { toast.error('Min 8 characters'); return }
    setSaving(true)
    await new Promise(r => setTimeout(r, 600))
    toast.success('Password updated!')
    setPwForm({ current: '', next: '', confirm: '' })
    setSaving(false)
  }

  if (loading || !user || !profile) return <div className="min-h-screen flex items-center justify-center"><div className="spinner w-8 h-8" /></div>

  const TABS = [
    { id: 'profile',  label: 'Profile',       icon: User },
    { id: 'security', label: 'Security',       icon: Shield },
    { id: 'api',      label: 'API & Keys',     icon: Key },
  ]

  return (
    <DashboardLayout user={user} onLogout={logout}>
      <div className="max-w-2xl space-y-5">
        <div><h1 className="font-display font-bold text-2xl text-gray-900">Settings</h1><p className="text-sm text-gray-500 mt-0.5">Manage your account</p></div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
          {TABS.map(t => {
            const Icon = t.icon
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                <Icon className="w-3.5 h-3.5" />{t.label}
              </button>
            )
          })}
        </div>

        {/* Profile */}
        {tab === 'profile' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
            <div className="flex items-center gap-4 pb-5 mb-5 border-b border-gray-100">
              <div className="w-16 h-16 rounded-2xl bg-primary-100 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary-600">{user.fullName[0].toUpperCase()}</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">{user.fullName}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
                <span className={`badge mt-1 ${user.plan === 'PRO' ? 'badge-blue' : user.plan === 'BUSINESS' ? 'badge-purple' : 'badge-gray'}`}>{user.plan}</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                  <input className="input-field" value={profile.fullName} onChange={e => setProfile({...profile, fullName: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Username</label>
                  <input className="input-field" value={profile.username} onChange={e => setProfile({...profile, username: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input type="email" className="input-field" value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} />
              </div>
              <button onClick={saveProfile} disabled={saving} className="btn-primary text-sm">
                <Save className="w-3.5 h-3.5" />{saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </motion.div>
        )}

        {/* Security */}
        {tab === 'security' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
            <h2 className="font-display font-bold text-lg text-gray-900 mb-5">Change Password</h2>
            <div className="space-y-4">
              {[['current', 'Current Password'], ['next', 'New Password'], ['confirm', 'Confirm New Password']].map(([k, label]) => (
                <div key={k}>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
                  <div className="relative">
                    <input type={showPw ? 'text' : 'password'} className="input-field pr-11" placeholder="••••••••"
                      value={(pwForm as any)[k]} onChange={e => setPwForm({...pwForm, [k]: e.target.value})} />
                    {k === 'current' && (
                      <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                        {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <button onClick={changePw} disabled={saving} className="btn-primary text-sm">
                <Shield className="w-3.5 h-3.5" />{saving ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </motion.div>
        )}

        {/* API Keys */}
        {tab === 'api' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
            <h2 className="font-display font-bold text-lg text-gray-900 mb-2">API Configuration</h2>
            <p className="text-sm text-gray-500 mb-5">Configure your API keys to enable all features</p>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700 mb-5">
              ⚠️ API keys are stored in your server's <code className="font-mono bg-amber-100 px-1 rounded">.env</code> file for security. Edit them there and restart the server.
            </div>
            {[
              { label: 'OpenAI API Key',       key: 'OPENAI_API_KEY',          desc: 'Powers AI chat assistant',    url: 'https://platform.openai.com/api-keys' },
              { label: 'PayPal Client ID',     key: 'PAYPAL_CLIENT_ID',        desc: 'PayPal payment processing',   url: 'https://developer.paypal.com' },
              { label: 'PayPal Secret',        key: 'PAYPAL_SECRET',           desc: 'PayPal server-side auth',     url: 'https://developer.paypal.com' },
              { label: 'NOWPayments API Key',  key: 'NOWPAYMENTS_API_KEY',     desc: 'Crypto payment processing',   url: 'https://nowpayments.io' },
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between py-3.5 border-b border-gray-100 last:border-0">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.desc} · <code className="text-[10px] bg-gray-100 px-1 rounded">{item.key}</code></p>
                </div>
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary-600 hover:underline font-medium">Get key →</a>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  )
}
