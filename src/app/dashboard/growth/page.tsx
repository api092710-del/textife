'use client'
import { useState } from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { useAuth, apiFetch } from '@/hooks/useAuth'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Sparkles, Copy, RefreshCw, Sun, Target, BookOpen, Zap } from 'lucide-react'
import toast from 'react-hot-toast'

const TOOLS = [
  { id: 'motivation', label: '⚡ Daily Motivation', desc: 'Start your day right', icon: Sun },
  { id: 'planner',    label: '📅 Day Planner',      desc: 'Plan your perfect day', icon: Target },
  { id: 'lesson',     label: '📚 Micro Lesson',     desc: '5-min power lesson', icon: BookOpen },
  { id: 'habits',     label: '💪 Habit Plan',       desc: '30-day habit builder', icon: Zap },
]

export default function GrowthPage() {
  const { user, loading, logout } = useAuth()
  const [tool, setTool]   = useState('motivation')
  const [goals, setGoals] = useState('')
  const [result, setResult] = useState<any>(null)
  const [generating, setGenerating] = useState(false)

  const generate = async () => {
    setGenerating(true); setResult(null)
    try {
      const res = await apiFetch('/api/ai/growth', { method: 'POST', body: JSON.stringify({ type: tool, goals, name: user?.fullName?.split(' ')[0] }) })
      setResult(res)
      apiFetch('/api/ai/streak', { method: 'POST', body: JSON.stringify({ action: 'use_tool' }) })
    } catch (e: any) { toast.error(e.message) }
    finally { setGenerating(false) }
  }
  const copy = (text: string) => { navigator.clipboard.writeText(text); toast.success('Copied!') }
  if (loading || !user) return <div className="min-h-screen flex items-center justify-center"><div className="spinner w-8 h-8" /></div>

  return (
    <DashboardLayout user={user} onLogout={logout}>
      <div className="max-w-3xl space-y-5">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
          <div className="w-10 h-10 bg-pink-50 rounded-xl flex items-center justify-center"><Heart className="w-5 h-5 text-pink-500" /></div>
          <div>
            <h1 className="font-display font-bold text-2xl text-gray-900">AI Personal Growth Assistant</h1>
            <p className="text-gray-500 text-sm">Your AI coach for productivity and success</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {TOOLS.map(t => {
            const Icon = t.icon
            return (
              <button key={t.id} onClick={() => setTool(t.id)}
                className={`p-3 rounded-xl border-2 text-left transition-all ${tool === t.id ? 'border-pink-400 bg-pink-50' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
                <Icon className={`w-5 h-5 mb-1.5 ${tool === t.id ? 'text-pink-500' : 'text-gray-400'}`} />
                <p className="font-semibold text-xs text-gray-900">{t.label}</p>
                <p className="text-[10px] text-gray-500 mt-0.5 hidden md:block">{t.desc}</p>
              </button>
            )
          })}
        </div>

        <div className="card p-5">
          <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Your Goals (optional)</label>
          <input className="input-field" placeholder="build a business, lose weight, learn coding, earn $10k/month..." value={goals} onChange={e => setGoals(e.target.value)} />
        </div>

        <button onClick={generate} disabled={generating} className="btn-primary w-full py-4 text-base" style={{ background: 'linear-gradient(135deg, #ec4899, #f43f5e)' }}>
          {generating ? <><span className="spinner" /> Creating your personalized content...</> : <><Sparkles className="w-5 h-5" /> Generate</>}
        </button>

        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">

              {/* Motivation result */}
              {tool === 'motivation' && result.result && typeof result.result === 'string' && (
                <div className="card p-6 bg-gradient-to-br from-orange-50 to-pink-50 border-orange-100">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-display font-bold text-gray-900">⚡ Your Daily Motivation</h2>
                    <button onClick={() => copy(result.result)} className="btn-secondary text-sm py-1.5"><Copy className="w-3.5 h-3.5" /> Copy</button>
                  </div>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{result.result}</p>
                </div>
              )}

              {/* Planner result */}
              {tool === 'planner' && result.result && typeof result.result === 'object' && (
                <div className="space-y-4">
                  {result.result.quote && (
                    <div className="card p-4 bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-100">
                      <p className="text-sm italic text-amber-800 font-medium">"{result.result.quote}"</p>
                    </div>
                  )}
                  {result.result.priorities && (
                    <div className="card p-5">
                      <h3 className="font-bold text-gray-900 mb-3">🎯 Top 3 Priorities Today</h3>
                      {result.result.priorities.map((p: string, i: number) => (
                        <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                          <span className="w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-bold">{i+1}</span>
                          <p className="text-sm text-gray-700">{p}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {result.result.timeBlocks && (
                    <div className="card p-5">
                      <h3 className="font-bold text-gray-900 mb-3">⏰ Time Blocks</h3>
                      <div className="space-y-2">
                        {result.result.timeBlocks.map((block: any, i: number) => (
                          <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                            <span className="text-xs font-bold text-primary-600 w-16 flex-shrink-0">{block.time}</span>
                            <p className="text-sm text-gray-700">{block.task}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Lesson result */}
              {tool === 'lesson' && result.result && typeof result.result === 'string' && (
                <div className="card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-display font-bold text-gray-900">📚 Your 5-Minute Lesson</h2>
                    <button onClick={() => copy(result.result)} className="btn-secondary text-sm py-1.5"><Copy className="w-3.5 h-3.5" /> Copy</button>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">{result.result}</pre>
                  </div>
                </div>
              )}

              {/* Habits result */}
              {tool === 'habits' && Array.isArray(result.result) && (
                <div className="space-y-3">
                  <h2 className="font-display font-bold text-lg text-gray-900">💪 Your 30-Day Habit Plan</h2>
                  {result.result.map((habit: any, i: number) => (
                    <div key={i} className="card p-5">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0">{i+1}</div>
                        <div>
                          <h3 className="font-bold text-gray-900">{habit.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{habit.description}</p>
                          <div className="mt-2 space-y-1">
                            <p className="text-xs text-green-600"><span className="font-bold">Why:</span> {habit.why}</p>
                            <p className="text-xs text-blue-600"><span className="font-bold">Daily action:</span> {habit.dailyAction}</p>
                            <p className="text-xs text-purple-600"><span className="font-bold">Track:</span> {habit.tracking}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Fallback for string results */}
              {typeof result.result === 'string' && tool !== 'motivation' && tool !== 'lesson' && (
                <div className="card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-display font-bold text-gray-900">✨ Result</h2>
                    <div className="flex gap-2">
                      <button onClick={generate} className="btn-secondary text-sm py-1.5"><RefreshCw className="w-3.5 h-3.5" /> Redo</button>
                      <button onClick={() => copy(result.result)} className="btn-secondary text-sm py-1.5"><Copy className="w-3.5 h-3.5" /> Copy</button>
                    </div>
                  </div>
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">{result.result}</pre>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  )
}
