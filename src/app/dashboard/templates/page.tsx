'use client'
import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { useAuth, apiFetch } from '@/hooks/useAuth'
import { FileText, Plus, Copy, Search, Tag, X, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

const CATS = ['All', 'Onboarding', 'Sales', 'E-commerce', 'Marketing', 'Service']

export default function TemplatesPage() {
  const { user, loading, logout } = useAuth()
  const [templates, setTemplates] = useState<any[]>([])
  const [search, setSearch]       = useState('')
  const [cat, setCat]             = useState('All')
  const [modal, setModal]         = useState(false)
  const [form, setForm]           = useState({ title: '', category: 'Sales', content: '', description: '' })
  const [saving, setSaving]       = useState(false)

  useEffect(() => {
    if (!user) return
    apiFetch('/api/templates').then(d => setTemplates(d.templates)).catch(() => {})
  }, [user])

  const copy = (content: string) => { navigator.clipboard.writeText(content); toast.success('Copied to clipboard!') }

  const create = async () => {
    if (!form.title || !form.content) { toast.error('Title and content required'); return }
    setSaving(true)
    try {
      const d = await apiFetch('/api/templates', { method: 'POST', body: JSON.stringify(form) })
      setTemplates(t => [d.template, ...t])
      setModal(false); setForm({ title: '', category: 'Sales', content: '', description: '' })
      toast.success('Template created!')
    } catch (e: any) { toast.error(e.message) }
    finally { setSaving(false) }
  }

  const filtered = templates.filter(t =>
    (cat === 'All' || t.category === cat) &&
    (t.title.toLowerCase().includes(search.toLowerCase()) || t.content.toLowerCase().includes(search.toLowerCase()))
  )

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center"><div className="spinner w-8 h-8" /></div>

  return (
    <DashboardLayout user={user} onLogout={logout}>
      <div className="max-w-5xl space-y-5">
        <div className="flex items-center justify-between">
          <div><h1 className="font-display font-bold text-2xl text-gray-900">Templates</h1><p className="text-sm text-gray-500 mt-0.5">Ready-to-use message templates for your bots</p></div>
          <button onClick={() => setModal(true)} className="btn-primary text-sm"><Plus className="w-4 h-4" />New Template</button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="text" placeholder="Search templates..." className="input-field pl-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {CATS.map(c => (
              <button key={c} onClick={() => setCat(c)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${cat === c ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="card p-10 text-center">
            <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No templates found</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((t, i) => (
              <motion.div key={t.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="card p-5 group hover:border-primary-200 hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-2.5">
                  <h3 className="font-semibold text-sm text-gray-900">{t.title}</h3>
                  <span className="badge badge-blue text-[10px] ml-2 flex-shrink-0"><Tag className="w-2.5 h-2.5" />{t.category}</span>
                </div>
                {t.description && <p className="text-xs text-gray-500 mb-2">{t.description}</p>}
                <p className="text-xs text-gray-500 line-clamp-3 whitespace-pre-line mb-4">{t.content}</p>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => copy(t.content)} className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-xl transition-colors">
                    <Copy className="w-3.5 h-3.5" />Copy
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">
                    <FileText className="w-3.5 h-3.5" />Use in Bot
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Create modal */}
      <AnimatePresence>
        {modal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="card p-6 w-full max-w-lg">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display font-bold text-xl text-gray-900">Create Template</h2>
                <button onClick={() => setModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4 text-gray-500" /></button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Title *</label>
                    <input className="input-field" placeholder="Template name" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                    <select className="input-field" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                      {CATS.slice(1).map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Content *</label>
                  <textarea className="input-field h-36 resize-none" placeholder="Template message content..." value={form.content} onChange={e => setForm({...form, content: e.target.value})} />
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={create} disabled={saving} className="btn-primary flex-1">
                  {saving ? <><span className="spinner" />Saving...</> : <><Check className="w-4 h-4" />Create</>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  )
}
