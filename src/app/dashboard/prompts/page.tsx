'use client'
import { useState } from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { useAuth, apiFetch } from '@/hooks/useAuth'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, Play, Copy, Check, Search, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'

const PROMPTS = [
  { id: 1, cat: 'Business', title: 'Business Plan Generator', prompt: 'Create a detailed business plan for {business_idea}. Include: executive summary, market analysis, revenue model, marketing strategy, 90-day action plan.', vars: ['business_idea'] },
  { id: 2, cat: 'Business', title: 'Competitor Analysis', prompt: 'Analyze the top 5 competitors for {business}. For each: strengths, weaknesses, pricing, unique value proposition. Then suggest how to beat them.', vars: ['business'] },
  { id: 3, cat: 'Business', title: 'Pricing Strategy', prompt: 'Help me price my {product_or_service}. Current cost: {cost}. Target market: {market}. Suggest 3 pricing strategies with rationale.', vars: ['product_or_service', 'cost', 'market'] },
  { id: 4, cat: 'Marketing', title: 'Marketing Campaign', prompt: 'Create a 30-day marketing campaign for {product} targeting {audience}. Budget: {budget}. Include: channels, content calendar, KPIs, expected results.', vars: ['product', 'audience', 'budget'] },
  { id: 5, cat: 'Marketing', title: 'Brand Voice', prompt: 'Define the brand voice and messaging for {company} in the {industry} industry. Target audience: {audience}. Create: tagline, value proposition, key messages, do/don\'t list.', vars: ['company', 'industry', 'audience'] },
  { id: 6, cat: 'Marketing', title: 'Launch Strategy', prompt: 'Create a product launch strategy for {product}. Launch date: {date}. Budget: {budget}. Include pre-launch, launch day, and post-launch activities.', vars: ['product', 'date', 'budget'] },
  { id: 7, cat: 'Freelancing', title: 'Client Proposal', prompt: 'Write a professional freelance proposal for {service} to {client_type}. Project scope: {scope}. Make it compelling, professional, and include pricing justification.', vars: ['service', 'client_type', 'scope'] },
  { id: 8, cat: 'Freelancing', title: 'Rate Calculator', prompt: 'Help me set my freelance rate for {skill}. My experience: {years} years. Location: {location}. I need to earn {monthly_target} per month. Calculate hourly/project rates.', vars: ['skill', 'years', 'location', 'monthly_target'] },
  { id: 9, cat: 'Freelancing', title: 'Cold Pitch Template', prompt: 'Write 3 cold pitch variations for {service} targeting {industry} businesses. Make them short, value-focused, and personalized. Include subject lines.', vars: ['service', 'industry'] },
  { id: 10, cat: 'Productivity', title: 'Weekly Planner', prompt: 'Create an optimized weekly schedule for someone who wants to {goals}. Work hours: {hours}. Include deep work blocks, breaks, and habits. Make it realistic and sustainable.', vars: ['goals', 'hours'] },
  { id: 11, cat: 'Productivity', title: 'Problem Solver', prompt: 'Help me solve this problem: {problem}. Provide: root cause analysis, 5 possible solutions ranked by effectiveness, implementation steps for the best solution.', vars: ['problem'] },
  { id: 12, cat: 'Productivity', title: 'Decision Framework', prompt: 'Help me decide: {decision}. Consider: pros and cons, risks, alternatives, short and long-term impact. Give me a clear recommendation with reasoning.', vars: ['decision'] },
  { id: 13, cat: 'Learning', title: 'Learning Roadmap', prompt: 'Create a 90-day learning roadmap for {skill}. Current level: {level}. Daily time available: {time}. Include resources, milestones, and projects to build.', vars: ['skill', 'level', 'time'] },
  { id: 14, cat: 'Learning', title: 'Explain Like 5', prompt: 'Explain {topic} in the simplest way possible. First explain it to a 5-year-old, then to a beginner, then give an expert-level explanation. Use analogies and examples.', vars: ['topic'] },
  { id: 15, cat: 'Learning', title: 'Study Guide', prompt: 'Create a comprehensive study guide for {subject}. Include: key concepts, common questions and answers, memory tricks, practice exercises, and a quick-reference cheat sheet.', vars: ['subject'] },
]

const CATS = ['All', 'Business', 'Marketing', 'Freelancing', 'Productivity', 'Learning']
const catColors: Record<string, string> = {
  Business: 'bg-blue-50 text-blue-700', Marketing: 'bg-purple-50 text-purple-700',
  Freelancing: 'bg-green-50 text-green-700', Productivity: 'bg-orange-50 text-orange-700', Learning: 'bg-pink-50 text-pink-700'
}

export default function PromptsPage() {
  const { user, loading, logout } = useAuth()
  const [cat, setCat]       = useState('All')
  const [search, setSearch] = useState('')
  const [active, setActive] = useState<any>(null)
  const [vars, setVars]     = useState<Record<string, string>>({})
  const [result, setResult] = useState('')
  const [running, setRunning] = useState(false)
  const [copied, setCopied] = useState(false)

  const filtered = PROMPTS.filter(p =>
    (cat === 'All' || p.cat === cat) &&
    (search === '' || p.title.toLowerCase().includes(search.toLowerCase()))
  )

  const runPrompt = async () => {
    setRunning(true); setResult('')
    try {
      const res = await apiFetch('/api/ai/prompts', { method: 'POST', body: JSON.stringify({ prompt: active.prompt, variables: vars }) })
      setResult(res.result || '')
      apiFetch('/api/ai/streak', { method: 'POST', body: JSON.stringify({ action: 'use_tool' }) })
    } catch (e: any) { toast.error(e.message) }
    finally { setRunning(false) }
  }

  const copy = () => { navigator.clipboard.writeText(result); setCopied(true); toast.success('Copied!'); setTimeout(() => setCopied(false), 2000) }
  const selectPrompt = (p: any) => { setActive(p); setVars({}); setResult('') }
  if (loading || !user) return <div className="min-h-screen flex items-center justify-center"><div className="spinner w-8 h-8" /></div>

  return (
    <DashboardLayout user={user} onLogout={logout}>
      <div className="max-w-5xl space-y-5">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center"><BookOpen className="w-5 h-5 text-indigo-600" /></div>
          <div>
            <h1 className="font-display font-bold text-2xl text-gray-900">Smart Prompt Library</h1>
            <p className="text-gray-500 text-sm">{PROMPTS.length} powerful AI prompts — run with one click</p>
          </div>
        </motion.div>

        {/* Search + filter */}
        <div className="flex gap-3 flex-col md:flex-row">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input-field pl-9" placeholder="Search prompts..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-1 overflow-x-auto">
            {CATS.map(c => (
              <button key={c} onClick={() => setCat(c)}
                className={`px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${cat === c ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          {filtered.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className={`card p-4 cursor-pointer hover:shadow-md transition-all ${active?.id === p.id ? 'border-indigo-300 bg-indigo-50/50' : ''}`}
              onClick={() => selectPrompt(p)}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`badge text-xs ${catColors[p.cat] || 'badge-gray'}`}>{p.cat}</span>
                  </div>
                  <h3 className="font-semibold text-sm text-gray-900">{p.title}</h3>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">{p.prompt.substring(0, 80)}...</p>
                </div>
                <button onClick={e => { e.stopPropagation(); selectPrompt(p) }}
                  className={`p-2 rounded-lg transition-all flex-shrink-0 ${active?.id === p.id ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                  <Play className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Active prompt runner */}
        <AnimatePresence>
          {active && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6 border-indigo-200">
              <h2 className="font-display font-bold text-gray-900 mb-4">▶ Run: {active.title}</h2>
              {active.vars.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  {active.vars.map((v: string) => (
                    <div key={v}>
                      <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">{v.replace(/_/g, ' ')}</label>
                      <input className="input-field" placeholder={`Enter ${v.replace(/_/g, ' ')}...`} value={vars[v] || ''} onChange={e => setVars(prev => ({...prev, [v]: e.target.value}))} />
                    </div>
                  ))}
                </div>
              )}
              <button onClick={runPrompt} disabled={running} className="btn-primary w-full py-3" style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
                {running ? <><span className="spinner" /> Running prompt...</> : <><Sparkles className="w-4 h-4" /> Run This Prompt</>}
              </button>

              {result && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-gray-900">✨ Result</h3>
                    <button onClick={copy} className="btn-primary text-sm py-1.5">
                      {copied ? <><Check className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                    </button>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 max-h-[400px] overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">{result}</pre>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  )
}
