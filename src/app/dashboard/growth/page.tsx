'use client'
import { useState } from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { useAuth, apiFetch } from '@/hooks/useAuth'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Sparkles, Copy, RefreshCw, Sun, Target, BookOpen, Zap, Brain, Trophy, Calendar, Copy as CopyIcon, Check, ChevronDown, ChevronUp } from 'lucide-react'
import toast from 'react-hot-toast'

const TOOLS = [
  { id:'motivation', emoji:'⚡', label:'Daily Motivation',    desc:'Personalized energy boost',   grad:'from-orange-500 to-rose-600',   bg:'bg-orange-50', text:'text-orange-700' },
  { id:'planner',    emoji:'📅', label:'Smart Day Planner',   desc:'AI-optimized daily schedule',  grad:'from-blue-500 to-indigo-600',   bg:'bg-blue-50',   text:'text-blue-700' },
  { id:'lesson',     emoji:'📚', label:'Micro Lesson',        desc:'5-min science-backed insight', grad:'from-purple-500 to-violet-600', bg:'bg-purple-50', text:'text-purple-700' },
  { id:'habits',     emoji:'💪', label:'Habit Builder',       desc:'30-day transformation plan',   grad:'from-green-500 to-emerald-600', bg:'bg-green-50',  text:'text-green-700' },
  { id:'challenge',  emoji:'🧠', label:'Challenge Solver',    desc:'Beat your biggest obstacle',   grad:'from-pink-500 to-rose-600',     bg:'bg-pink-50',   text:'text-pink-700' },
]

const MOODS = ['😴 Tired','😤 Frustrated','😐 Meh','🙂 Okay','😊 Good','🔥 Motivated']

export default function GrowthPage() {
  const { user, loading, logout } = useAuth()
  const [tool, setTool]       = useState('motivation')
  const [goals, setGoals]     = useState('')
  const [mood, setMood]       = useState('')
  const [challenge, setChallenge] = useState('')
  const [result, setResult]   = useState<any>(null)
  const [generating, setGenerating] = useState(false)
  const [copied, setCopied]   = useState(false)
  const [expandedHabit, setExpandedHabit] = useState<number|null>(null)

  const firstName = user?.fullName?.split(' ')[0] || 'there'
  const activeTool = TOOLS.find(t => t.id === tool)!

  const generate = async () => {
    setGenerating(true); setResult(null)
    try {
      const res = await apiFetch('/api/ai/growth', {
        method:'POST',
        body:JSON.stringify({ type:tool, goals, name:firstName, mood, challenge })
      })
      setResult(res)
      apiFetch('/api/ai/streak', { method:'POST', body:JSON.stringify({ action:'use_tool' }) })
    } catch (e: any) { toast.error(e.message || 'Something went wrong') }
    finally { setGenerating(false) }
  }

  const copy = (text: string) => { navigator.clipboard.writeText(text); setCopied(true); toast.success('Copied!'); setTimeout(() => setCopied(false), 2000) }

  if (loading || !user) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center mx-auto animate-pulse">
          <Heart className="w-7 h-7 text-white" />
        </div>
        <p className="text-sm text-gray-400">Loading Growth Coach...</p>
      </div>
    </div>
  )

  return (
    <DashboardLayout user={user} onLogout={logout}>
      <div className="max-w-3xl space-y-5 pb-10">

        {/* Hero */}
        <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}
          className="relative overflow-hidden rounded-2xl p-5 sm:p-7 text-white"
          style={{ background:'linear-gradient(135deg,#ec4899 0%,#f43f5e 50%,#f97316 100%)' }}>
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage:'radial-gradient(circle,white 1px,transparent 1px)', backgroundSize:'22px 22px' }} />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                <Heart className="w-4 h-4 text-white" />
              </div>
              <span className="text-pink-200 font-bold text-xs uppercase tracking-widest">AI Growth Coach</span>
            </div>
            <h1 className="font-display font-black text-2xl sm:text-3xl mb-1">Hey {firstName}! Ready to grow? 🚀</h1>
            <p className="text-pink-100 text-sm max-w-lg">Your personal AI coach gives realistic, science-backed guidance tailored to YOU — not generic advice.</p>
            <div className="flex flex-wrap gap-2 mt-4">
              {['Daily Motivation','Smart Planner','Micro Lessons','Habit Builder','Challenge Solver'].map(f => (
                <span key={f} className="bg-white/15 rounded-full px-3 py-1 text-xs font-semibold">{f}</span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Tool tabs */}
        <div className="grid grid-cols-5 gap-1.5">
          {TOOLS.map(t => (
            <button key={t.id} onClick={() => { setTool(t.id); setResult(null) }}
              className={`p-3 rounded-2xl border-2 text-center transition-all active:scale-95 ${tool === t.id ? `border-pink-400 ${t.bg}` : 'border-gray-100 bg-white hover:border-pink-200'}`}>
              <span className="text-xl block">{t.emoji}</span>
              <p className={`font-bold text-[10px] mt-1 leading-tight ${tool === t.id ? t.text : 'text-gray-600'}`}>{t.label}</p>
            </button>
          ))}
        </div>

        {/* Inputs */}
        <div className="card p-5 space-y-4">
          <div>
            <label className="block text-xs font-black text-gray-500 mb-1.5 uppercase tracking-widest">Your Goals <span className="text-gray-400 font-normal normal-case">(the more specific the better)</span></label>
            <input className="input-field" value={goals} onChange={e => setGoals(e.target.value)}
              placeholder="e.g. launch my business, lose 10kg, earn $5k/month, wake up at 6am..." />
          </div>

          {tool === 'motivation' && (
            <div>
              <label className="block text-xs font-black text-gray-500 mb-2 uppercase tracking-widest">How are you feeling today?</label>
              <div className="flex flex-wrap gap-2">
                {MOODS.map(m => (
                  <button key={m} onClick={() => setMood(mood === m ? '' : m)}
                    className={`px-3 py-2 rounded-xl text-sm border-2 font-semibold transition-all ${mood === m ? 'border-pink-400 bg-pink-50 text-pink-700' : 'border-gray-100 text-gray-600 hover:border-pink-200'}`}>
                    {m}
                  </button>
                ))}
              </div>
            </div>
          )}

          {(tool === 'challenge') && (
            <div>
              <label className="block text-xs font-black text-gray-500 mb-1.5 uppercase tracking-widest">What's your biggest challenge right now?</label>
              <textarea className="input-field resize-none h-20" value={challenge} onChange={e => setChallenge(e.target.value)}
                placeholder="e.g. I keep procrastinating on my business, I can't stay consistent, I'm overwhelmed by too many tasks..." />
            </div>
          )}
        </div>

        {/* Generate */}
        <button onClick={generate} disabled={generating}
          className="w-full py-4 rounded-xl font-black text-base flex items-center justify-center gap-2.5 text-white transition-all disabled:opacity-60"
          style={{
            background: generating ? '#f9a8d4' : `linear-gradient(135deg,#ec4899,#f43f5e)`,
            boxShadow: generating ? 'none' : '0 8px 24px rgba(236,72,153,0.35)'
          }}>
          {generating
            ? <><span className="spinner border-white/60" />Creating your personalized content...</>
            : <><Sparkles className="w-5 h-5" />Get My {activeTool.label}</>}
        </button>

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="space-y-4">

              {/* TEXT RESULT (motivation, lesson, challenge) */}
              {result.result && typeof result.result === 'string' && (
                <div className="card overflow-hidden">
                  <div className={`bg-gradient-to-br ${activeTool.grad} p-4 flex items-center justify-between`}>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{activeTool.emoji}</span>
                      <h2 className="font-display font-black text-white">{activeTool.label}</h2>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={generate} disabled={generating}
                        className="p-2 bg-white/20 rounded-xl text-white hover:bg-white/30 transition-all">
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <button onClick={() => copy(result.result)}
                        className={`p-2 rounded-xl transition-all ${copied ? 'bg-green-500' : 'bg-white/20 hover:bg-white/30'} text-white`}>
                        {copied ? <Check className="w-4 h-4" /> : <CopyIcon className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="p-5">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">{result.result}</pre>
                  </div>
                </div>
              )}

              {/* PLANNER result */}
              {result.type === 'planner' && result.result && typeof result.result === 'object' && (() => {
                const p = result.result
                return (
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="card p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
                      <p className="text-sm text-blue-700 font-medium mb-1">{p.greeting}</p>
                      <div className="inline-flex items-center gap-2 bg-blue-600 text-white rounded-xl px-3 py-1.5 text-sm font-bold">
                        <Target className="w-4 h-4" />Today's Theme: {p.focus_theme}
                      </div>
                    </div>

                    {/* Top 3 Priorities */}
                    <div className="card p-5">
                      <h3 className="font-display font-bold text-gray-900 mb-3 flex items-center gap-2"><Trophy className="w-4 h-4 text-amber-500" />Top 3 Priorities</h3>
                      <div className="space-y-3">
                        {p.top_3_priorities?.map((item: any, i: number) => (
                          <div key={i} className={`flex items-start gap-3 p-3 rounded-xl ${i===0 ? 'bg-amber-50 border border-amber-100' : 'bg-gray-50'}`}>
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${i===0 ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-700'}`}>{item.rank}</div>
                            <div className="flex-1">
                              <p className="font-bold text-sm text-gray-900">{item.task}</p>
                              <p className="text-xs text-gray-500 mt-0.5">{item.why}</p>
                              <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-semibold mt-1 inline-block">{item.time_estimate}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Morning Routine */}
                    <div className="card p-5">
                      <h3 className="font-display font-bold text-gray-900 mb-3 flex items-center gap-2"><Sun className="w-4 h-4 text-orange-500" />Morning Routine</h3>
                      <div className="space-y-2">
                        {p.morning_routine?.map((item: any, i: number) => (
                          <div key={i} className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl">
                            <span className="text-xs font-black text-orange-600 w-16 flex-shrink-0">{item.time}</span>
                            <div className="flex-1">
                              <p className="font-semibold text-sm text-gray-900">{item.task}</p>
                              <p className="text-xs text-gray-500">{item.why}</p>
                            </div>
                            <span className="text-[10px] text-orange-600 bg-orange-100 px-2 py-1 rounded-lg font-bold flex-shrink-0">{item.duration}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Power Hours */}
                    <div className="card p-5">
                      <h3 className="font-display font-bold text-gray-900 mb-3 flex items-center gap-2"><Zap className="w-4 h-4 text-indigo-500" />Power Blocks</h3>
                      <div className="space-y-2">
                        {p.power_hours?.map((item: any, i: number) => {
                          const typeColors: Record<string,string> = { deep_work:'bg-indigo-50 border-indigo-200', break:'bg-green-50 border-green-200', meetings:'bg-blue-50 border-blue-200', admin:'bg-gray-50 border-gray-200' }
                          return (
                            <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border ${typeColors[item.type] || 'bg-gray-50 border-gray-100'}`}>
                              <span className="text-xs font-black text-gray-500 w-28 flex-shrink-0">{item.block}</span>
                              <p className="font-semibold text-sm text-gray-900 flex-1">{item.task}</p>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Quote */}
                    {p.todays_quote && (
                      <div className="card p-5 bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100 text-center">
                        <p className="text-base font-bold text-gray-900 italic mb-1">"{p.todays_quote}"</p>
                        {p.quote_author && <p className="text-xs text-gray-400">— {p.quote_author}</p>}
                      </div>
                    )}
                  </div>
                )
              })()}

              {/* HABITS result */}
              {result.type === 'habits' && Array.isArray(result.result) && (
                <div className="space-y-3">
                  <h2 className="font-display font-bold text-gray-900 flex items-center gap-2">
                    <Brain className="w-5 h-5 text-green-600" />Your 30-Day Habit System
                  </h2>
                  {result.result.map((h: any, i: number) => (
                    <div key={i} className="card overflow-hidden">
                      <button onClick={() => setExpandedHabit(expandedHabit === i ? null : i)}
                        className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 transition-all">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                          {h.emoji || '💪'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-sm text-gray-900">{h.name}</p>
                            <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">{h.category}</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">{h.daily_action}</p>
                        </div>
                        {expandedHabit === i ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                      </button>
                      <AnimatePresence>
                        {expandedHabit === i && (
                          <motion.div initial={{ height:0 }} animate={{ height:'auto' }} exit={{ height:0 }} className="overflow-hidden border-t border-gray-100">
                            <div className="p-4 space-y-3 bg-gray-50">
                              {[
                                { label:'🔬 The Science', val:h.science },
                                { label:'⚡ Trigger', val:h.trigger },
                                { label:'📊 Track It', val:h.tracking },
                                { label:'📅 Week 1', val:h.week1 },
                                { label:'🏆 Week 4', val:h.week4 },
                                { label:'⚠️ Watch Out', val:h.pitfall },
                              ].filter(x => x.val).map(x => (
                                <div key={x.label} className="flex items-start gap-2">
                                  <span className="text-xs font-bold text-gray-500 w-24 flex-shrink-0 pt-0.5">{x.label}</span>
                                  <p className="text-xs text-gray-700 leading-relaxed flex-1">{x.val}</p>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              )}

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  )
}
