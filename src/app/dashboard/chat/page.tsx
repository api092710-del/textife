'use client'
import { useState, useRef, useEffect } from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { useAuth, apiFetch } from '@/hooks/useAuth'
import { Send, Bot, User, Sparkles, RefreshCw, Copy, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface Msg { id: string; role: 'user' | 'assistant'; content: string; ts: Date }

const SUGGESTIONS = [
  'How can I automate WhatsApp customer support?',
  'Write a promotional message for Eid offers',
  'What tools should I use for lead generation?',
  'Create a 5-step follow-up sequence for leads',
  'How to increase WhatsApp reply rates?',
]

function MsgBubble({ msg }: { msg: Msg }) {
  const isBot = msg.role === 'assistant'
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-2.5 ${isBot ? '' : 'flex-row-reverse'}`}>
      <div className={`w-7 h-7 rounded-xl flex-shrink-0 flex items-center justify-center self-end ${isBot ? 'bg-primary-600' : 'bg-gray-200'}`}>
        {isBot ? <Bot className="w-3.5 h-3.5 text-white" /> : <User className="w-3.5 h-3.5 text-gray-600" />}
      </div>
      <div className={`max-w-2xl group flex flex-col ${isBot ? '' : 'items-end'}`}>
        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
          isBot ? 'bg-gray-50 text-gray-800 border border-gray-100 rounded-tl-sm' : 'bg-primary-600 text-white rounded-tr-sm'
        }`}>
          {msg.content}
        </div>
        <div className={`flex items-center gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity ${isBot ? '' : 'flex-row-reverse'}`}>
          <span className="text-[10px] text-gray-400">{msg.ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          {isBot && (
            <button onClick={() => { navigator.clipboard.writeText(msg.content); toast.success('Copied!') }}
              className="text-gray-400 hover:text-gray-600 p-0.5 rounded"><Copy className="w-3 h-3" /></button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default function ChatPage() {
  const { user, loading, logout } = useAuth()
  const [messages, setMessages]   = useState<Msg[]>([{ id: '0', role: 'assistant', content: "Hi! I'm your Textife AI Business Assistant powered by OpenAI. I can help you with:\n\n• WhatsApp automation strategies\n• Lead generation techniques\n• Marketing campaigns & copywriting\n• Business growth recommendations\n• Tool and workflow suggestions\n\nWhat would you like to work on today? 🚀", ts: new Date() }])
  const [input, setInput]         = useState('')
  const [busy, setBusy]           = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [usage, setUsage]         = useState<{ used: number; limit: number } | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLInputElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const send = async (text?: string) => {
    const msg = (text || input).trim()
    if (!msg || busy) return
    setInput('')
    setBusy(true)

    const userMsg: Msg = { id: Date.now().toString(), role: 'user', content: msg, ts: new Date() }
    setMessages(m => [...m, userMsg])

    try {
      const data = await apiFetch('/api/chat', { method: 'POST', body: JSON.stringify({ message: msg, sessionId }) })
      if (data.sessionId) setSessionId(data.sessionId)
      if (data.usedReplies !== undefined) setUsage({ used: data.usedReplies, limit: data.limit })
      setMessages(m => [...m, { id: Date.now().toString(), role: 'assistant', content: data.reply, ts: new Date() }])
    } catch (e: any) {
      toast.error(e.message)
      setMessages(m => [...m, { id: Date.now().toString(), role: 'assistant', content: `⚠️ ${e.message}`, ts: new Date() }])
    } finally {
      setBusy(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }

  const reset = () => { setMessages([{ id: '0', role: 'assistant', content: "New conversation started! How can I help you today? 🚀", ts: new Date() }]); setSessionId(null) }

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center"><div className="spinner w-10 h-10 border-indigo-600" /></div>

  return (
    <DashboardLayout user={user} onLogout={logout}>
      <div className="flex flex-col h-[calc(100vh-100px)] max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-primary-100 rounded-xl flex items-center justify-center"><Sparkles className="w-4.5 h-4.5 text-primary-600" /></div>
            <div>
              <h1 className="font-display font-bold text-xl text-gray-900">AI Business Assistant</h1>
              <p className="text-xs text-gray-500">Powered by OpenAI GPT</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {usage && (
              <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
                {usage.used}/{usage.limit === Infinity ? '∞' : usage.limit} replies
              </span>
            )}
            <button onClick={reset} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 px-3 py-1.5 rounded-xl hover:bg-gray-100 transition-all">
              <RefreshCw className="w-3.5 h-3.5" /> New chat
            </button>
          </div>
        </div>

        {/* Limit warning */}
        {user.plan === 'FREE' && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 mb-3 flex items-center justify-between">
            <p className="text-xs text-amber-700">Free plan: 50 AI replies/month</p>
            <Link href="/dashboard/billing" className="text-xs font-semibold text-amber-700 underline">Upgrade</Link>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 card overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {messages.map(m => <MsgBubble key={m.id} msg={m} />)}

            {busy && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2.5">
                <div className="w-7 h-7 bg-primary-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Bot className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="bg-gray-50 border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex gap-1"><span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" /></div>
                </div>
              </motion.div>
            )}

            {/* Suggestions */}
            {messages.length <= 1 && !busy && (
              <div className="mt-2">
                <p className="text-xs text-gray-400 mb-2 font-medium">💡 Try asking:</p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTIONS.map(s => (
                    <button key={s} onClick={() => send(s)} className="text-xs bg-white border border-gray-200 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 text-gray-600 px-3 py-1.5 rounded-full transition-all">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-100 flex gap-2.5">
            <input ref={inputRef} type="text" value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
              placeholder="Ask anything about your business..."
              className="flex-1 input-field py-2.5"
              disabled={busy}
            />
            <button onClick={() => send()} disabled={busy || !input.trim()}
              className="w-11 h-11 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 rounded-xl flex items-center justify-center transition-colors">
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
