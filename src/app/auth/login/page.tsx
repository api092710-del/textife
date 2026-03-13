'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Zap, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading]     = useState(false)
  const [showPw, setShowPw]       = useState(false)
  const [form, setForm]           = useState({ identifier: '', password: '' })

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res  = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user',  JSON.stringify(data.user))
      toast.success(`Welcome back, ${data.user.fullName.split(' ')[0]}! 👋`)
      router.push('/dashboard')
    } catch (e: any) {
      toast.error(e.message)
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="card p-8">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-5">
              <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center shadow-button">
                <Zap className="w-4.5 h-4.5 text-white fill-white" />
              </div>
              <span className="font-display font-bold text-xl text-gray-900">Texti<span className="text-primary-600">fe</span></span>
            </Link>
            <h1 className="font-display font-bold text-2xl text-gray-900">Welcome back</h1>
            <p className="text-gray-500 text-sm mt-1">Sign in to your account</p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email or Username</label>
              <input type="text" className="input-field" placeholder="you@example.com or username"
                value={form.identifier} onChange={e => setForm({ ...form, identifier: e.target.value })} required />
            </div>
            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-sm font-medium text-gray-700">Password</label>
                <a href="#" className="text-xs text-primary-600 hover:text-primary-700">Forgot password?</a>
              </div>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} className="input-field pr-11" placeholder="••••••••"
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? <><span className="spinner" /> Signing in...</> : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Don't have an account? <Link href="/auth/register" className="text-primary-600 font-semibold hover:text-primary-700">Sign up free</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
