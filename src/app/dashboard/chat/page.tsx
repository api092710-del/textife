'use client'
import { useState, useRef, useEffect } from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { useAuth, apiFetch } from '@/hooks/useAuth'
import { Send, Bot, User, Sparkles, RefreshCw, Copy, Check, Crown, Zap } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface Msg { id: string; role: 'user'|'assistant'; content: string; ts: Date }

const STARTERS = [
  { emoji:'🤖', text:'How do I set up my WhatsApp bot?' },
  { emoji:'📣', text:'Write a promo message for Eid offers' },
  { emoji:'💰', text:'How can I make money with AI tools?' },
  { emoji:'📈', text:'5 ways to grow my business this week' },
  { emoji:'✍️', text:'Write a cold email to get new clients' },
  { emoji:'🧠', text:'Best habits for entrepreneurs' },
]

function Bubble({ msg, onCopy }: { msg: Msg; onCopy: (t: string) => void }) {
  const isBot = msg.role === 'assistant'
  return (
    <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
      className={`flex gap-2.5 ${isBot ? '' : 'flex-row-reverse'}`}>
      <div className={`w-7 h-7 rounded-xl flex-shrink-0 flex items-center justify-center self-end ${isBot ? 'bg-gradient-to-br from-indigo-500 to-purple-600' : 'bg-gradient-to-br from-gray-200 to-gray-300'}`}>
        {isBot ? <Bot className="w-3.5 h-3.5 text-white" /> : <User className="w-3.5 h-3.5 text-gray-600" />}
      </div>
      <div className={`max-w-[75%] sm:max-w-[70%] group flex flex-col ${isBot ? '' : 'items-end'}`}>
        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
          isBot
            ? 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm'
            : 'text-white rounded-tr-sm shadow-sm'
        }`}
        style={!isBot ? { background:'linear-gradient(135deg,#4f46e5,#7c3aed)' } : {}}>
          {msg.content}
        </div>
        <div className={`flex items-center gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity ${isBot ? '' : 'flex-row-reverse'}`}>
          <span className="text-[10px] text-gray-400">{msg.ts.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}</span>
          {isBot && (
            <button onClick={() => onCopy(msg.content)} className="text-gray-400 hover:text-gray-600 p-0.5 rounded transition-all">
              <Copy className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default function ChatPage() {
  const { user, loading, logout } = useAuth()
  const firstName = user?.fullName?.split(' ')[0] || 'there'
  const [messages, setMessages] = useState<Msg[]>([{
    id:'0', role:'assistant', ts:new Date(),
    content:`Hey ${firstName}! 👋 I'm your Textife AI assistant. I'm here to give you short, practical, direct answers — no fluff.\n\nAsk me anything about:\n• WhatsApp automation & bots\n• Lead generation & sales\n• Marketing & content ideas\n• Business growth strategies\n• Using Textife tools\n\nWhat do you need? 🚀`
  }])
  const [input, setInput]   = useState('')
  const [busy, setBusy]     = useState(false)
  const [sessionId, setSid] = useState<string|null>(null)
  const [usage, setUsage]   = useState<{ used:number; limit:number }|null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLInputElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }) }, [messages])

  const send = async (text?: string) => {
    const msg = (text || input).trim()
    if (!msg || busy) return
    setInput(''); setBusy(true)
    setMessages(m => [...m, { id:Date.now().toString(), role:'user', content:msg, ts:new Date() }])
    try {
      const data = await apiFetch('/api/chat', { method:'POST', body:JSON.stringify({ message:msg, sessionId }) })
      if (data.sessionId) setSid(data.sessionId)
      if (data.usedReplies !== undefined) setUsage({ used:data.usedReplies, limit:data.limit })
      setMessages(m => [...m, { id:(Date.now()+1).toString(), role:'assistant', content:data.reply, ts:new Date() }])
    } catch (e: any) {
      toast.error(e.message)
      setMessages(m => [...m, { id:(Date.now()+1).toString(), role:'assistant', content:`⚠️ ${e.message}`, ts:new Date() }])
    } finally {
      setBusy(false)
      setTimeout(() => inputRef.current?.focus(), 80)
    }
  }

  const copyMsg = (text: string) => { navigator.clipboard.writeText(text); toast.success('Copied!') }
  const reset = () => {
    setMessages([{ id:'0', role:'assistant', ts:new Date(), content:`Fresh start! What's on your mind? 🚀` }])
    setSid(null)
  }

  if (loading || !user) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto animate-pulse">
          <Bot className="w-7 h-7 text-white" />
        </div>
        <p className="text-sm text-gray-400">Loading AI Chat...</p>
      </div>
    </div>
  )

  const isPro = user.plan === 'PRO' || user.plan === 'BUSINESS'
  const usagePercent = usage ? Math.min((usage.used / usage.limit) * 100, 100) : 0
  const nearLimit = usage && usage.limit !== Infinity && usagePercent >= 80

  return (
    <DashboardLayout user={user} onLogout={logout}>
      <div className="max-w-3xl flex flex-col" style={{ height:'calc(100svh - 120px)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-1 mb-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-md">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-display font-black text-gray-900 dark:text-white text-base">Textife AI Chat</h1>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-gray-400">GPT-4o-mini · Always online</span>
              </div>
            </div>
          </div>
          <button onClick={reset} className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-xl transition-all dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-400">
            <RefreshCw className="w-3.5 h-3.5" />New Chat
          </button>
        </div>

        {/* Usage bar */}
        {usage && (
          <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl mb-3 flex-shrink-0 ${nearLimit ? 'bg-amber-50 border border-amber-200' : 'bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700'}`}>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Monthly Replies</span>
                <span className={`text-[10px] font-black ${nearLimit ? 'text-amber-700' : 'text-gray-600 dark:text-gray-300'}`}>{usage.used}/{usage.limit === Infinity ? '∞' : usage.limit}</span>
              </div>
              <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${nearLimit ? 'bg-amber-500' : 'bg-indigo-500'}`} style={{ width:`${usagePercent}%` }} />
              </div>
            </div>
            {nearLimit && !isPro && (
              <Link href="/dashboard/billing" className="flex items-center gap-1 text-[10px] font-black text-amber-700 bg-amber-200 px-2.5 py-1.5 rounded-xl hover:bg-amber-300 transition-all flex-shrink-0">
                <Crown className="w-3 h-3" />Upgrade
              </Link>
            )}
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 px-1 pb-4 scrollbar-hide">
          {messages.map(m => <Bubble key={m.id} msg={m} onCopy={copyMsg} />)}
          {busy && (
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="flex gap-2.5">
              <div className="w-7 h-7 rounded-xl flex-shrink-0 flex items-center justify-center self-end bg-gradient-to-br from-indigo-500 to-purple-600">
                <Bot className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                <div className="flex gap-1">{[0,150,300].map(d=><div key={d} className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay:`${d}ms` }} />)}</div>
              </div>
            </motion.div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggestion chips — shown when empty-ish */}
        {messages.length <= 1 && (
          <div className="flex gap-2 overflow-x-auto pb-3 flex-shrink-0 scrollbar-hide">
            {STARTERS.map(s => (
              <button key={s.text} onClick={() => send(s.text)}
                className="flex items-center gap-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold px-3 py-2 rounded-xl whitespace-nowrap hover:border-indigo-300 hover:text-indigo-700 transition-all flex-shrink-0">
                {s.emoji} {s.text}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="flex gap-2 flex-shrink-0 pt-2 border-t border-gray-100 dark:border-gray-800">
          <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder="Ask anything — short & sweet answers guaranteed..."
            className="flex-1 px-4 py-3.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm outline-none focus:border-indigo-400 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 transition-all text-gray-900 dark:text-white placeholder-gray-400"
          />
          <button onClick={() => send()} disabled={busy || !input.trim()}
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white flex-shrink-0 disabled:opacity-50 transition-all active:scale-95"
            style={{ background:'linear-gradient(135deg,#4f46e5,#7c3aed)', boxShadow:'0 4px 15px rgba(79,70,229,0.4)' }}>
            {busy ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>

      </div>
    </DashboardLayout>
  )
}
