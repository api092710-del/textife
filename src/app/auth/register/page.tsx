'use client'
import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, Zap, ArrowLeft, CheckSquare, Square } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

function RegisterForm() {
  const router = useRouter()
  const params = useSearchParams()
  const plan   = params.get('plan') || 'free'

  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw]   = useState(false)
  const [form, setForm]       = useState({ fullName: '', username: '', email: '', dateOfBirth: '', password: '', confirmPassword: '', terms: false })
  const [errors, setErrors]   = useState<Record<string, string>>({})

  const set = (k: string, v: string | boolean) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })) }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.fullName.trim())             e.fullName        = 'Full name required'
    if (form.username.length < 3)          e.username        = 'Min 3 characters'
    if (!/\S+@\S+\.\S+/.test(form.email)) e.email           = 'Valid email required'
    if (!form.dateOfBirth)                 e.dateOfBirth     = 'Date of birth required'
    if (form.password.length < 8)          e.password        = 'Min 8 characters'
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match'
    if (!form.terms)                       e.terms           = 'You must agree to terms'
    setErrors(e)
    return !Object.keys(e).length
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const res  = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, plan }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user',  JSON.stringify(data.user))
      toast.success('Account created! Welcome 🎉')
      router.push('/dashboard')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const Field = ({ name, label, type = 'text', placeholder }: { name: string; label: string; type?: string; placeholder: string }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <input
        type={type}
        className={`input-field ${errors[name] ? 'error' : ''}`}
        placeholder={placeholder}
        value={String((form as Record<string, unknown>)[name] ?? '')}
        onChange={e => set(name, e.target.value)}
      />
      {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name]}</p>}
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="card p-8">
          <div className="text-center mb-7">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center shadow-button">
                <Zap className="w-4 h-4 text-white fill-white" />
              </div>
              <span className="font-display font-bold text-xl text-gray-900">Trendy<span className="text-primary-600">gene</span></span>
            </Link>
            <h1 className="font-display font-bold text-2xl text-gray-900">Create your account</h1>
            <p className="text-gray-500 text-sm mt-1">
              {plan !== 'free'
                ? <span>Starting <strong className="text-primary-600 capitalize">{plan}</strong> plan trial</span>
                : 'Start free — no credit card required'}
            </p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field name="fullName" label="Full Name *" placeholder="John Doe" />
              <Field name="username" label="Username *"  placeholder="johndoe" />
            </div>
            <Field name="email"       label="Email Address *" type="email" placeholder="you@example.com" />
            <Field name="dateOfBirth" label="Date of Birth *" type="date"  placeholder="" />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password *</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  className={`input-field pr-11 ${errors.password ? 'error' : ''}`}
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password *</label>
              <input
                type="password"
                className={`input-field ${errors.confirmPassword ? 'error' : ''}`}
                placeholder="Repeat your password"
                value={form.confirmPassword}
                onChange={e => set('confirmPassword', e.target.value)}
              />
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>

            <div>
              <button type="button" onClick={() => set('terms', !form.terms)} className="flex items-start gap-3 text-left w-full">
                {form.terms
                  ? <CheckSquare className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                  : <Square className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" />}
                <span className="text-sm text-gray-600">
                  I agree to the <a href="#" className="text-primary-600 hover:underline">Terms of Service</a> and{' '}
                  <a href="#" className="text-primary-600 hover:underline">Privacy Policy</a>
                </span>
              </button>
              {errors.terms && <p className="text-red-500 text-xs mt-1">{errors.terms}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-1">
              {loading ? <><span className="spinner" /> Creating account...</> : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-primary-600 font-semibold hover:text-primary-700">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    }>
      <RegisterForm />
    </Suspense>
  )
}
