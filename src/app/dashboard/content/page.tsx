'use client'
import { useState } from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { useAuth, apiFetch } from '@/hooks/useAuth'
import { motion, AnimatePresence } from 'framer-motion'
import { PenTool, Sparkles, Copy, Download, RefreshCw, Check } from 'lucide-react'
import toast from 'react-hot-toast'

const TOOLS = [
  { id: 'blog',      label: '📝 Blog Writer',         desc: 'Full blog posts' },
  { id: 'marketing', label: '📣 Marketing Copy',       desc: 'Ads & landing pages' },
  { id: 'product',   label: '🛍 Product Description',  desc: 'E-commerce copy' },
  { id: 'social',    label: '📱 Social Media',         desc: '5 platform captions' },
  { id: 'email',     label: '📧 Email Campaign',       desc: 'Full email sequence' },
]

const TONES = ['professional', 'friendly', 'persuasive', 'casual', 'urgent', 'inspirational']

export default function ContentPage() {
  const { user, loading, logout } = useAuth()
  const [tool, setTool]       = useState('blog')
  const [topic, setTopic]     = useState('')
  const [tone, setTone]       = useState('professional')
  const [audience, setAudience] = useState('')
  const [keywords, setKeywords] = useState('')
  const [content, setContent] = useState('')
  const [generating, setGenerating] = useState(false)
  const [copied, setCopied]   = useState(false)

  const generate = async () => {
    if (!topic.trim()) { toast.error('Enter a topic first'); return }
    setGenerating(true); setContent('')
    try {
      const res = await apiFetch('/api/ai/content', { method: 'POST', body: JSON.stringify({ type: tool, topic, tone, audience, keywords }) })
      setContent(res.content || '')
      apiFetch('/api/ai/streak', { method: 'POST', body: JSON.stringify({ action: 'use_tool' }) })
    } catch (e: any) { toast.error(e.message) }
    finally { setGenerating(false) }
  }

  const copy = () => { navigator.clipboard.writeText(content); setCopied(true); toast.success('Copied!'); setTimeout(() => setCopied(false), 2000) }
  const download = () => {
    const a = document.createElement('a')
    a.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(content)
    a.download = `textife-content-${Date.now()}.txt`
    a.click(); toast.success('Downloaded!')
  }

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center"><div className="spinner w-8 h-8" /></div>

  return (
    <DashboardLayout user={user} onLogout={logout}>
      <div className="max-w-4xl space-y-5">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center"><PenTool className="w-5 h-5 text-purple-600" /></div>
          <div>
            <h1 className="font-display font-bold text-2xl text-gray-900">AI Content Creation Hub</h1>
            <p className="text-gray-500 text-sm">Generate any content in seconds</p>
          </div>
        </motion.div>

        {/* Tool selector */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {TOOLS.map(t => (
            <button key={t.id} onClick={() => setTool(t.id)}
              className={`p-3 rounded-xl border-2 text-left transition-all ${tool === t.id ? 'border-purple-400 bg-purple-50' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
              <p className="font-semibold text-xs text-gray-900">{t.label}</p>
              <p className="text-[10px] text-gray-500 mt-0.5 hidden md:block">{t.desc}</p>
            </button>
          ))}
        </div>

        <div className="card p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Topic / Subject *</label>
            <input className="input-field" placeholder={`What is this ${tool} about?`} value={topic} onChange={e => setTopic(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Tone</label>
              <select className="input-field" value={tone} onChange={e => setTone(e.target.value)}>
                {TONES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Target Audience</label>
              <input className="input-field" placeholder="entrepreneurs, teens..." value={audience} onChange={e => setAudience(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Keywords (optional)</label>
              <input className="input-field" placeholder="seo, keyword1, keyword2" value={keywords} onChange={e => setKeywords(e.target.value)} />
            </div>
          </div>
        </div>

        <button onClick={generate} disabled={generating} className="btn-primary w-full py-4 text-base" style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
          {generating ? <><span className="spinner" /> Generating content...</> : <><Sparkles className="w-5 h-5" /> Generate Content</>}
        </button>

        <AnimatePresence>
          {content && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-bold text-gray-900">✨ Generated Content</h2>
                <div className="flex gap-2">
                  <button onClick={() => { generate() }} className="btn-secondary text-sm py-1.5"><RefreshCw className="w-3.5 h-3.5" /> Regenerate</button>
                  <button onClick={download} className="btn-secondary text-sm py-1.5"><Download className="w-3.5 h-3.5" /> Download</button>
                  <button onClick={copy} className="btn-primary text-sm py-1.5">
                    {copied ? <><Check className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                  </button>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 max-h-[500px] overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">{content}</pre>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                <span>{content.split(' ').length} words · {content.length} characters</span>
                <span>✅ Ready to publish</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  )
}
