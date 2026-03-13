'use client'
import { useState } from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { useAuth, apiFetch } from '@/hooks/useAuth'
import { motion, AnimatePresence } from 'framer-motion'
import { Lightbulb, Sparkles, DollarSign, Clock, Zap, ChevronDown, ChevronUp, Copy, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

const TYPES = [
  { id: 'startup', label: '🚀 Startup Ideas', desc: 'Build a real business' },
  { id: 'sidehustle', label: '💰 Side Hustles', desc: 'Extra income fast' },
  { id: 'online', label: '🌐 Online Business', desc: 'Work from anywhere' },
]

export default function IdeasPage() {
  const { user, loading, logout } = useAuth()
  const [type, setType]       = useState('startup')
  const [niche, setNiche]     = useState('')
  const [budget, setBudget]   = useState('low')
  const [skills, setSkills]   = useState('')
  const [ideas, setIdeas]     = useState<any[]>([])
  const [generating, setGenerating] = useState(false)
  const [expanded, setExpanded] = useState<number | null>(0)

  const generate = async () => {
    setGenerating(true); setIdeas([])
    try {
      const res = await apiFetch('/api/ai/ideas', { method: 'POST', body: JSON.stringify({ type, niche, budget, skills }) })
      setIdeas(res.ideas || []); setExpanded(0)
      apiFetch('/api/ai/streak', { method: 'POST', body: JSON.stringify({ action: 'use_tool' }) })
    } catch (e: any) { toast.error(e.message) }
    finally { setGenerating(false) }
  }
  const copy = (text: string) => { navigator.clipboard.writeText(text); toast.success('Copied!') }
  if (loading || !user) return <div className="min-h-screen flex items-center justify-center"><div className="spinner w-8 h-8" /></div>
  const diffColor: Record<string, string> = { Easy: 'badge-green', Medium: 'badge-orange', Hard: 'badge-red' }

  return (
    <DashboardLayout user={user} onLogout={logout}>
      <div className="max-w-4xl space-y-5">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center"><Lightbulb className="w-5 h-5 text-yellow-500" /></div>
          <div>
            <h1 className="font-display font-bold text-2xl text-gray-900">AI Business Idea Generator</h1>
            <p className="text-gray-500 text-sm">Generate profitable business ideas tailored to you</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-3 gap-2 md:gap-3">
          {TYPES.map(t => (
            <button key={t.id} onClick={() => setType(t.id)}
              className={`p-3 md:p-4 rounded-2xl border-2 text-left transition-all ${type === t.id ? 'border-primary-400 bg-primary-50' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
              <p className="font-semibold text-sm text-gray-900">{t.label}</p>
              <p className="text-xs text-gray-500 mt-0.5 hidden md:block">{t.desc}</p>
            </button>
          ))}
        </div>

        <div className="card p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Niche / Industry</label>
            <input className="input-field" placeholder="fitness, tech, food..." value={niche} onChange={e => setNiche(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Your Skills</label>
            <input className="input-field" placeholder="design, coding, writing..." value={skills} onChange={e => setSkills(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Budget</label>
            <select className="input-field" value={budget} onChange={e => setBudget(e.target.value)}>
              <option value="zero">$0 - No budget</option>
              <option value="low">$1 - $500</option>
              <option value="medium">$500 - $5,000</option>
              <option value="high">$5,000+</option>
            </select>
          </div>
        </div>

        <button onClick={generate} disabled={generating} className="btn-primary w-full py-4 text-base">
          {generating ? <><span className="spinner" /> Generating ideas with AI...</> : <><Sparkles className="w-5 h-5" /> Generate 5 Ideas</>}
        </button>

        <AnimatePresence>
          {ideas.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-display font-bold text-lg text-gray-900">✨ Your Ideas</h2>
                <button onClick={generate} disabled={generating} className="btn-secondary text-sm py-1.5">
                  <RefreshCw className="w-3.5 h-3.5" /> Regenerate
                </button>
              </div>
              {ideas.map((idea, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                  className="card p-5 cursor-pointer hover:shadow-md transition-all" onClick={() => setExpanded(expanded === i ? null : i)}>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">{i + 1}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-display font-bold text-gray-900">{idea.name}</h3>
                        {idea.difficulty && <span className={`badge ${diffColor[idea.difficulty] || 'badge-gray'}`}>{idea.difficulty}</span>}
                      </div>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{idea.description}</p>
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        {idea.earning && <span className="flex items-center gap-1 text-xs text-green-600 font-bold"><DollarSign className="w-3 h-3" />{idea.earning}/mo</span>}
                        {idea.timeToRevenue && <span className="flex items-center gap-1 text-xs text-blue-600"><Clock className="w-3 h-3" />{idea.timeToRevenue}</span>}
                        {idea.hoursPerWeek && <span className="flex items-center gap-1 text-xs text-purple-600"><Clock className="w-3 h-3" />{idea.hoursPerWeek}h/week</span>}
                        {idea.startupCost && <span className="flex items-center gap-1 text-xs text-orange-600"><Zap className="w-3 h-3" />Start: {idea.startupCost}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={e => { e.stopPropagation(); copy(`${idea.name}\n\n${idea.description}\n\nEarning: ${idea.earning}\n\nSteps:\n${idea.steps?.join('\n')}`) }}
                        className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-500 transition-all">
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      {expanded === i ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </div>
                  </div>
                  <AnimatePresence>
                    {expanded === i && idea.steps && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden mt-4 pt-4 border-t border-gray-100">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">🚀 Action Steps to Start Today</p>
                        <div className="space-y-2">
                          {idea.steps.map((step: string, si: number) => (
                            <div key={si} className="flex items-start gap-3 bg-green-50 rounded-xl p-3">
                              <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{si + 1}</span>
                              <p className="text-sm text-gray-700">{step}</p>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  )
}
