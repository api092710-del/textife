'use client'
import { useState } from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { useAuth, apiFetch } from '@/hooks/useAuth'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Copy, Check, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'

const TOOLS = [
  { id: 'summarize',  label: '📝 Summarize',      desc: 'Condense any text',         placeholder: 'Paste text to summarize...' },
  { id: 'rewrite',    label: '✏️ Rewrite',         desc: 'Improve your writing',      placeholder: 'Paste text to rewrite...' },
  { id: 'ideas',      label: '💡 Generate Ideas',  desc: '8 ideas on any topic',      placeholder: 'Topic to brainstorm...' },
  { id: 'translate',  label: '🌍 Translate',       desc: 'Translate to any language', placeholder: 'Text to translate...' },
  { id: 'explain',    label: '🎓 Explain',         desc: 'Simplify complex topics',   placeholder: 'What should I explain?' },
  { id: 'actionplan', label: '🎯 Action Plan',     desc: 'Step-by-step plan',         placeholder: 'What goal to plan for?' },
  { id: 'hashtags',   label: '#️⃣ Hashtags',        desc: '30 relevant hashtags',      placeholder: 'Topic or content...' },
  { id: 'headline',   label: '📢 Headlines',       desc: '10 click-worthy titles',    placeholder: 'Topic for headlines...' },
]

export default function QuickToolsPage() {
  const { user, loading, logout } = useAuth()
  const [tool, setTool]     = useState('summarize')
  const [input, setInput]   = useState('')
  const [language, setLanguage] = useState('Arabic')
  const [style, setStyle]   = useState('professional')
  const [result, setResult] = useState('')
  const [running, setRunning] = useState(false)
  const [copied, setCopied] = useState(false)

  const run = async () => {
    if (!input.trim()) { toast.error('Enter some text first'); return }
    setRunning(true); setResult('')
    try {
      const options: any = {}
      if (tool === 'translate') options.language = language
      if (tool === 'rewrite') options.style = style
      const res = await apiFetch('/api/ai/quicktools', { method: 'POST', body: JSON.stringify({ tool, input, options }) })
      setResult(res.result || '')
      apiFetch('/api/ai/streak', { method: 'POST', body: JSON.stringify({ action: 'use_tool' }) })
    } catch (e: any) { toast.error(e.message) }
    finally { setRunning(false) }
  }

  const copy = () => { navigator.clipboard.writeText(result); setCopied(true); toast.success('Copied!'); setTimeout(() => setCopied(false), 2000) }
  const selectedTool = TOOLS.find(t => t.id === tool)!
  if (loading || !user) return <div className="min-h-screen flex items-center justify-center"><div className="spinner w-8 h-8" /></div>

  return (
    <DashboardLayout user={user} onLogout={logout}>
      <div className="max-w-4xl space-y-5">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center"><Zap className="w-5 h-5 text-amber-500" /></div>
          <div>
            <h1 className="font-display font-bold text-2xl text-gray-900">Quick AI Tools</h1>
            <p className="text-gray-500 text-sm">8 instant AI tools — results in seconds</p>
          </div>
        </motion.div>

        {/* Tool grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {TOOLS.map(t => (
            <button key={t.id} onClick={() => { setTool(t.id); setInput(''); setResult('') }}
              className={`p-3 rounded-xl border-2 text-left transition-all ${tool === t.id ? 'border-amber-400 bg-amber-50' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
              <p className="font-semibold text-xs text-gray-900">{t.label}</p>
              <p className="text-[10px] text-gray-500 mt-0.5 hidden md:block">{t.desc}</p>
            </button>
          ))}
        </div>

        {/* Input area */}
        <div className="card p-5 space-y-3">
          {tool === 'translate' && (
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Target Language</label>
              <select className="input-field w-48" value={language} onChange={e => setLanguage(e.target.value)}>
                {['Arabic', 'French', 'Spanish', 'German', 'Chinese', 'Japanese', 'Portuguese', 'Hindi', 'Turkish', 'Russian'].map(l => (
                  <option key={l}>{l}</option>
                ))}
              </select>
            </div>
          )}
          {tool === 'rewrite' && (
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Rewrite Style</label>
              <div className="flex gap-2 flex-wrap">
                {['professional', 'casual', 'persuasive', 'simple', 'formal'].map(s => (
                  <button key={s} onClick={() => setStyle(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${style === s ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">{selectedTool.label}</label>
            <textarea className="input-field resize-none h-32" placeholder={selectedTool.placeholder} value={input} onChange={e => setInput(e.target.value)} />
          </div>
          <button onClick={run} disabled={running} className="btn-primary w-full py-3" style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}>
            {running ? <><span className="spinner" /> Processing...</> : <><Sparkles className="w-4 h-4" /> Run {selectedTool.label}</>}
          </button>
        </div>

        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-display font-bold text-gray-900">✨ Result</h2>
                <button onClick={copy} className="btn-primary text-sm py-1.5">
                  {copied ? <><Check className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                </button>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 max-h-[400px] overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">{result}</pre>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  )
}
