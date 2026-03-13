'use client'
import { useState } from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { useAuth, apiFetch } from '@/hooks/useAuth'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, Play, Copy, Check, Search, Sparkles, Lock, Crown, X, ChevronDown, ChevronUp, Zap, Star, TrendingUp, Brain } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

type Prompt = {
  id: number; cat: string; title: string; prompt: string; vars: string[]
  isPro?: boolean; emoji: string; difficulty: 'Beginner' | 'Intermediate' | 'Advanced'; useCase: string
}

const PROMPTS: Prompt[] = [
  // Business — free
  { id: 1,  cat: 'Business',     emoji: '🚀', isPro: false, difficulty: 'Beginner',      useCase: 'Startup founders',    title: 'Business Plan Generator',    prompt: 'Create a detailed, investor-ready business plan for {business_idea}. Include: executive summary, market opportunity with size estimate, target customer profile, revenue model with 3 pricing tiers, competitive advantage, marketing strategy, 90-day action plan with weekly milestones, and key risk mitigation strategies.', vars: ['business_idea'] },
  { id: 2,  cat: 'Business',     emoji: '🔍', isPro: false, difficulty: 'Intermediate',  useCase: 'Business owners',     title: 'Deep Competitor Analysis',   prompt: 'Perform a deep competitive analysis for {business}. For each of the top 5 competitors: their unique strengths, hidden weaknesses, pricing strategy, customer pain points they ignore, and marketing channels. Conclude with a detailed strategy to differentiate {business} and capture their unhappy customers.', vars: ['business'] },
  { id: 3,  cat: 'Business',     emoji: '💰', isPro: true,  difficulty: 'Advanced',      useCase: 'Entrepreneurs',       title: 'Revenue Growth Playbook',     prompt: 'Create a revenue growth playbook for {company} currently making {current_revenue} per month. Identify 5 specific growth levers, quick wins in the next 30 days, a 90-day roadmap to {goal_revenue}, and KPIs to track progress. Be specific and tactical.', vars: ['company', 'current_revenue', 'goal_revenue'] },
  { id: 4,  cat: 'Business',     emoji: '🎯', isPro: true,  difficulty: 'Advanced',      useCase: 'Product teams',       title: 'Pricing Strategy Master',     prompt: 'Help me price {product_or_service}. Cost to deliver: {cost}. Target market: {market}. Suggest 3 distinct pricing strategies (value-based, competitive, penetration) with exact price points, expected conversion rates, customer lifetime value projections, and a recommendation on which to use and why.', vars: ['product_or_service', 'cost', 'market'] },
  // Marketing — free
  { id: 5,  cat: 'Marketing',    emoji: '📣', isPro: false, difficulty: 'Intermediate',  useCase: 'Marketers',           title: '30-Day Campaign Builder',     prompt: 'Create a full 30-day marketing campaign for {product} targeting {audience}. Budget: {budget}. Include: platform strategy for Instagram/TikTok/email, content calendar with daily posts, 5 ad copy variations, influencer collab strategy, KPIs and expected ROAS, and a launch sequence with countdown.', vars: ['product', 'audience', 'budget'] },
  { id: 6,  cat: 'Marketing',    emoji: '🎙️', isPro: false, difficulty: 'Beginner',      useCase: 'Brand builders',      title: 'Brand Voice Creator',         prompt: 'Define the complete brand voice and identity for {company} in the {industry} industry. Target audience: {audience}. Deliver: brand archetype, tone of voice guide, 5 messaging pillars, 3 tagline options, what to say vs never say, and 10 sample social media posts in brand voice.', vars: ['company', 'industry', 'audience'] },
  { id: 7,  cat: 'Marketing',    emoji: '🚀', isPro: true,  difficulty: 'Advanced',      useCase: 'Growth hackers',      title: 'Viral Launch Strategy',       prompt: 'Create a viral product launch strategy for {product} launching on {date} with budget {budget}. Include pre-launch hype tactics, waitlist strategy, influencer seeding approach, launch day schedule hour-by-hour, PR angles, and a post-launch momentum plan for the next 14 days.', vars: ['product', 'date', 'budget'] },
  { id: 8,  cat: 'Marketing',    emoji: '📧', isPro: true,  difficulty: 'Intermediate',  useCase: 'Email marketers',     title: 'Email Sequence Machine',      prompt: 'Write a 7-email welcome sequence for {business} targeting {audience}. Each email needs: subject line (A/B variant), preview text, personalized opening, key value delivered, story or social proof, and a specific CTA. Optimize for {goal} (sales/engagement/retention).', vars: ['business', 'audience', 'goal'] },
  // Freelancing — free
  { id: 9,  cat: 'Freelancing',  emoji: '📋', isPro: false, difficulty: 'Beginner',      useCase: 'Freelancers',         title: 'Client Proposal Writer',      prompt: 'Write a compelling, professional freelance proposal for {service} to {client_type}. Project scope: {scope}. Include: personalized opening showing you understand their problem, your unique approach, 3 package options with pricing, what makes you different from 100 other proposals, social proof bullet points, and a clear next step CTA.', vars: ['service', 'client_type', 'scope'] },
  { id: 10, cat: 'Freelancing',  emoji: '💵', isPro: false, difficulty: 'Beginner',      useCase: 'New freelancers',     title: 'Rate Calculator Pro',         prompt: 'Calculate the ideal freelance rate for {skill}. Experience: {years} years. Location: {location}. Monthly income target: {monthly_target}. Provide: minimum viable rate, competitive rate, premium rate, how to justify each tier to clients, scripts for rate conversations, and a plan to raise rates 20% in 6 months.', vars: ['skill', 'years', 'location', 'monthly_target'] },
  { id: 11, cat: 'Freelancing',  emoji: '📩', isPro: true,  difficulty: 'Intermediate',  useCase: 'Outbound freelancers','title': 'Cold Pitch Generator',       prompt: 'Write 5 cold pitch variations for {service} targeting {industry} businesses. Each pitch: ultra-short subject line, personalized opening hook, one specific pain point, your unique solution, one micro case study or result, and a low-friction CTA. Make them feel human, not templated.', vars: ['service', 'industry'] },
  { id: 12, cat: 'Freelancing',  emoji: '🤝', isPro: true,  difficulty: 'Advanced',      useCase: 'Senior freelancers',  title: 'Retainer Pitch System',       prompt: 'Create a retainer proposal for {service} for clients currently paying me {current_rate} per project. Target monthly retainer: {retainer_goal}. Include: the value stack justification, ROI calculator for client, 3 retainer package structures, objection handling scripts, and a transition email to convert existing clients.', vars: ['service', 'current_rate', 'retainer_goal'] },
  // Productivity — free
  { id: 13, cat: 'Productivity', emoji: '📅', isPro: false, difficulty: 'Beginner',      useCase: 'Busy professionals',  title: 'Weekly Power Planner',        prompt: 'Design an optimized weekly schedule for someone with goals: {goals}. Available work hours: {hours}. Include: deep work blocks with specific tasks, energy management (high/low energy tasks), habit stacking, buffer times for unexpected tasks, a daily shutdown ritual, and a Sunday planning template to prep each week.', vars: ['goals', 'hours'] },
  { id: 14, cat: 'Productivity', emoji: '🧠', isPro: false, difficulty: 'Beginner',      useCase: 'Everyone',            title: 'Problem Solver Framework',    prompt: 'Solve this problem systematically: {problem}. Use: 5 Whys root cause analysis, Eisenhower matrix for sub-problems, 5 concrete solutions ranked by impact vs effort, implementation roadmap for the #1 solution, potential obstacles and how to overcome them, and success metrics to know when the problem is solved.', vars: ['problem'] },
  { id: 15, cat: 'Productivity', emoji: '⚡', isPro: true,  difficulty: 'Intermediate',  useCase: 'Decision makers',     title: 'Decision Accelerator',        prompt: 'Help me make this decision: {decision}. I\'m leaning towards {current_leaning}. Apply: a 10/10/10 framework (10 mins, 10 months, 10 years impact), second-order consequences analysis, regret minimization, list of the top 5 assumptions I\'m making, what data I\'m missing, and a clear recommendation with confidence level.', vars: ['decision', 'current_leaning'] },
  { id: 16, cat: 'Productivity', emoji: '🔋', isPro: true,  difficulty: 'Advanced',      useCase: 'High performers',     title: 'Peak Performance System',     prompt: 'Build a personalized peak performance system for someone in {role} wanting to achieve {goal_in_90_days}. Include: morning routine (with exact times), focus optimization techniques, energy management protocol, weekly review system, habit tracker design, and monthly progress checkpoints. Make it sustainable and science-backed.', vars: ['role', 'goal_in_90_days'] },
  // Learning — free
  { id: 17, cat: 'Learning',     emoji: '🗺️', isPro: false, difficulty: 'Beginner',      useCase: 'Skill builders',      title: '90-Day Learning Roadmap',     prompt: 'Create a detailed 90-day learning roadmap for {skill}. Current level: {level}. Time available daily: {time}. Provide: week-by-week breakdown, best free and paid resources for each phase, 3 portfolio projects to build, common mistakes to avoid, how to know you\'ve mastered each milestone, and a job-ready checklist at day 90.', vars: ['skill', 'level', 'time'] },
  { id: 18, cat: 'Learning',     emoji: '🎓', isPro: false, difficulty: 'Beginner',      useCase: 'Students',            title: 'Explain Like Einstein',       prompt: 'Explain {topic} at 4 levels: (1) Like I\'m 8 years old with a fun analogy, (2) Like I\'m a curious teenager, (3) Like I\'m a college student, (4) Like I\'m an expert wanting depth. For each level, include an example, a surprising fact, and one common misconception corrected.', vars: ['topic'] },
  { id: 19, cat: 'Learning',     emoji: '📖', isPro: true,  difficulty: 'Intermediate',  useCase: 'Students & pros',     title: 'Ultimate Study Guide',        prompt: 'Create a comprehensive study guide for {subject}. Include: 20 key concepts with plain-language explanations, most common exam/interview questions with model answers, memory palace technique for key facts, a spaced repetition schedule, connections between concepts (mind map in text form), and a 1-page cheat sheet for quick review.', vars: ['subject'] },
  { id: 20, cat: 'Learning',     emoji: '🔬', isPro: true,  difficulty: 'Advanced',      useCase: 'Researchers',         title: 'Research Synthesis Engine',   prompt: 'I\'m researching {topic} for {purpose}. Synthesize the key insights, identify the most important frameworks, highlight the top 5 debates or open questions in the field, suggest the most valuable primary sources I should read, and create an annotated outline I can use to structure a deep-dive article or presentation.', vars: ['topic', 'purpose'] },
  // AI & Tech
  { id: 21, cat: 'AI & Tech',    emoji: '🤖', isPro: false, difficulty: 'Beginner',      useCase: 'Non-technical users', title: 'AI Prompt Engineer',          prompt: 'I want to use AI to help me with {task}. Write 5 progressively better prompts for this task, explaining why each one is more effective than the last. Include: context-setting techniques, role assignment, output format specification, and chain-of-thought triggers. Give me the "ultimate" prompt at the end.', vars: ['task'] },
  { id: 22, cat: 'AI & Tech',    emoji: '💻', isPro: true,  difficulty: 'Advanced',      useCase: 'Developers',          title: 'Tech Stack Advisor',          prompt: 'I\'m building {project_description}. Expected users: {user_count}. Team size: {team_size}. Budget: {budget}. Recommend the optimal tech stack with reasoning for each choice, estimated development timeline, potential scaling bottlenecks, estimated infrastructure costs, and a build vs buy decision framework for key components.', vars: ['project_description', 'user_count', 'team_size', 'budget'] },
  // Copywriting
  { id: 23, cat: 'Copywriting',  emoji: '✍️', isPro: false, difficulty: 'Intermediate',  useCase: 'Content creators',    title: 'Viral Hook Generator',        prompt: 'Generate 15 scroll-stopping hooks for content about {topic} targeting {audience}. Include 5 curiosity hooks, 5 controversy/bold-claim hooks, and 5 relatability hooks. For each, explain the psychological trigger it activates. Then write a full opening paragraph using the best hook.', vars: ['topic', 'audience'] },
  { id: 24, cat: 'Copywriting',  emoji: '🛒', isPro: true,  difficulty: 'Advanced',      useCase: 'E-commerce brands',   title: 'Sales Page Converter',        prompt: 'Write a high-converting sales page for {product} priced at {price} targeting {audience}. Include: headline + 3 alternatives, hero section copy, 5 benefit bullets (outcome-focused), social proof section, FAQ section (10 objection-handling Q&As), urgency/scarcity element, and a CTA button with 3 microcopy options. Use AIDA + PAS frameworks.', vars: ['product', 'price', 'audience'] },
]

const CATS = ['All', 'Business', 'Marketing', 'Freelancing', 'Productivity', 'Learning', 'AI & Tech', 'Copywriting']

const catConfig: Record<string, { color: string; bg: string; border: string }> = {
  Business:    { color: 'text-blue-700',   bg: 'bg-blue-50',   border: 'border-blue-200' },
  Marketing:   { color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200' },
  Freelancing: { color: 'text-green-700',  bg: 'bg-green-50',  border: 'border-green-200' },
  Productivity:{ color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200' },
  Learning:    { color: 'text-pink-700',   bg: 'bg-pink-50',   border: 'border-pink-200' },
  'AI & Tech': { color: 'text-cyan-700',   bg: 'bg-cyan-50',   border: 'border-cyan-200' },
  Copywriting: { color: 'text-amber-700',  bg: 'bg-amber-50',  border: 'border-amber-200' },
}

const difficultyColor = { Beginner: 'bg-green-100 text-green-700', Intermediate: 'bg-yellow-100 text-yellow-700', Advanced: 'bg-red-100 text-red-700' }

export default function PromptsPage() {
  const { user, loading, logout } = useAuth()
  const [cat, setCat]       = useState('All')
  const [search, setSearch] = useState('')
  const [active, setActive] = useState<Prompt | null>(null)
  const [vars, setVars]     = useState<Record<string, string>>({})
  const [result, setResult] = useState('')
  const [running, setRunning] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [expandedPrompt, setExpandedPrompt] = useState<number | null>(null)

  const isPro = user?.plan === 'PRO' || user?.plan === 'BUSINESS'

  const filtered = PROMPTS.filter(p =>
    (cat === 'All' || p.cat === cat) &&
    (search === '' || p.title.toLowerCase().includes(search.toLowerCase()) || p.useCase.toLowerCase().includes(search.toLowerCase()))
  )

  const freeCount = filtered.filter(p => !p.isPro).length
  const proCount  = filtered.filter(p => p.isPro).length

  const runPrompt = async () => {
    if (!active) return
    setRunning(true); setResult('')
    try {
      const res = await apiFetch('/api/ai/prompts', {
        method: 'POST',
        body: JSON.stringify({ prompt: active.prompt, variables: vars })
      })
      setResult(res.result || '')
      apiFetch('/api/ai/streak', { method: 'POST', body: JSON.stringify({ action: 'use_tool' }) })
    } catch (e: any) { toast.error(e.message) }
    finally { setRunning(false) }
  }

  const copy = () => {
    navigator.clipboard.writeText(result)
    setCopied(true)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const selectPrompt = (p: Prompt) => {
    if (p.isPro && !isPro) { setShowUpgrade(true); return }
    setActive(p); setVars({}); setResult('')
    setTimeout(() => document.getElementById('prompt-runner')?.scrollIntoView({ behavior: 'smooth' }), 100)
  }

  if (loading || !user) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="text-center">
        <div className="spinner w-10 h-10 mx-auto mb-4 border-indigo-600" />
        <p className="text-indigo-600 font-medium animate-pulse">Loading your prompts...</p>
      </div>
    </div>
  )

  return (
    <DashboardLayout user={user} onLogout={logout}>
      <div className="max-w-5xl space-y-6 pb-10">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 p-6 text-white">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          <div className="relative flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <span className="text-indigo-200 text-sm font-semibold uppercase tracking-wider">Smart Prompt Library</span>
              </div>
              <h1 className="font-display font-black text-2xl sm:text-3xl mb-1">
                {PROMPTS.length} Battle-Tested AI Prompts
              </h1>
              <p className="text-indigo-200 text-sm max-w-lg">
                Fill in the blanks → Get expert-level AI output instantly. No prompt engineering needed.
              </p>
            </div>
            <div className="flex flex-col gap-2 text-right">
              <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2 text-center">
                <p className="font-black text-2xl">{PROMPTS.filter(p => !p.isPro).length}</p>
                <p className="text-xs text-indigo-200">Free Prompts</p>
              </div>
              {!isPro && (
                <Link href="/dashboard/billing"
                  className="flex items-center gap-1.5 bg-yellow-400 text-yellow-900 rounded-xl px-3 py-2 text-xs font-bold hover:bg-yellow-300 transition-all">
                  <Crown className="w-3.5 h-3.5" />
                  Unlock {PROMPTS.filter(p => p.isPro).length} Pro Prompts
                </Link>
              )}
            </div>
          </div>
        </motion.div>

        {/* Search + Filters */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="input-field pl-11 h-12 text-base shadow-sm"
              placeholder="Search by name, use case, or category..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {CATS.map(c => (
              <button key={c} onClick={() => setCat(c)}
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0 ${cat === c ? 'bg-indigo-600 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-600'}`}>
                {c}
              </button>
            ))}
          </div>
          {filtered.length > 0 && (
            <p className="text-xs text-gray-400">
              Showing <strong>{filtered.length}</strong> prompts
              {!isPro && <> · <span className="text-yellow-600 font-semibold">{proCount} require Pro</span></>}
            </p>
          )}
        </motion.div>

        {/* Prompts Grid */}
        <div className="grid sm:grid-cols-2 gap-3">
          <AnimatePresence>
            {filtered.map((p, i) => {
              const cfg = catConfig[p.cat] || { color: 'text-gray-700', bg: 'bg-gray-50', border: 'border-gray-200' }
              const isLocked = p.isPro && !isPro
              const isActive = active?.id === p.id
              const isExpanded = expandedPrompt === p.id
              return (
                <motion.div key={p.id}
                  initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.02 }}
                  className={`relative rounded-2xl border-2 p-4 transition-all cursor-pointer group overflow-hidden
                    ${isActive ? 'border-indigo-400 bg-indigo-50/50 shadow-md' : isLocked ? 'border-gray-100 bg-gray-50/50 opacity-80' : 'border-gray-100 bg-white hover:border-indigo-200 hover:shadow-md'}`}>

                  {/* Pro badge */}
                  {p.isPro && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-amber-500 text-yellow-900 px-2 py-0.5 rounded-full text-[10px] font-black">
                      <Crown className="w-3 h-3" /> PRO
                    </div>
                  )}

                  <div onClick={() => selectPrompt(p)}>
                    <div className="flex items-start gap-3 mb-3">
                      <span className="text-2xl flex-shrink-0">{p.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap mb-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>{p.cat}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${difficultyColor[p.difficulty]}`}>{p.difficulty}</span>
                        </div>
                        <h3 className="font-display font-bold text-sm text-gray-900 leading-snug pr-10">{p.title}</h3>
                        <p className="text-[11px] text-gray-400 mt-0.5">👤 Best for: {p.useCase}</p>
                      </div>
                    </div>

                    {/* Variables preview */}
                    {p.vars.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {p.vars.map(v => (
                          <span key={v} className="text-[10px] bg-indigo-50 text-indigo-600 border border-indigo-100 px-2 py-0.5 rounded-full font-mono">
                            {'{' + v + '}'}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Expand preview */}
                  <button
                    onClick={(e) => { e.stopPropagation(); setExpandedPrompt(isExpanded ? null : p.id) }}
                    className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-gray-600 transition-all mb-3">
                    {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    {isExpanded ? 'Hide' : 'Preview'} prompt
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden mb-3">
                        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                          <p className="text-[11px] text-gray-500 leading-relaxed font-mono">
                            {isLocked ? p.prompt.substring(0, 80) + '... 🔒 Unlock with Pro' : p.prompt}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button onClick={() => selectPrompt(p)}
                    className={`w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all
                      ${isLocked
                        ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-yellow-900 hover:from-yellow-300 hover:to-amber-400'
                        : isActive
                          ? 'bg-indigo-600 text-white'
                          : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white group-hover:bg-indigo-600 group-hover:text-white'
                      }`}>
                    {isLocked ? <><Crown className="w-4 h-4" /> Unlock with Pro</> : isActive ? <><Sparkles className="w-4 h-4" /> Running</> : <><Play className="w-4 h-4" /> Use This Prompt</>}
                  </button>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🔍</p>
            <p className="font-semibold text-gray-600">No prompts match "{search}"</p>
            <button onClick={() => { setSearch(''); setCat('All') }} className="mt-3 text-indigo-600 text-sm hover:underline">Clear filters</button>
          </div>
        )}

        {/* Active Prompt Runner */}
        <AnimatePresence>
          {active && (
            <motion.div id="prompt-runner"
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }}
              className="rounded-2xl border-2 border-indigo-300 bg-gradient-to-br from-white to-indigo-50/30 p-6 shadow-xl">

              <div className="flex items-start justify-between gap-3 mb-5 flex-wrap">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{active.emoji}</span>
                  <div>
                    <h2 className="font-display font-black text-xl text-gray-900">{active.title}</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Fill in the fields below → Hit Run → Get expert output</p>
                  </div>
                </div>
                <button onClick={() => { setActive(null); setResult('') }} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Variables */}
              {active.vars.length > 0 && (
                <div className="grid sm:grid-cols-2 gap-4 mb-5">
                  {active.vars.map((v) => (
                    <div key={v}>
                      <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-widest">
                        {v.replace(/_/g, ' ')}
                      </label>
                      <input
                        className="input-field border-indigo-100 focus:border-indigo-400 bg-white"
                        placeholder={`Enter ${v.replace(/_/g, ' ')}...`}
                        value={vars[v] || ''}
                        onChange={e => setVars(prev => ({ ...prev, [v]: e.target.value }))}
                      />
                    </div>
                  ))}
                </div>
              )}

              <button onClick={runPrompt} disabled={running}
                className="w-full py-4 rounded-xl font-black text-base flex items-center justify-center gap-2.5 transition-all"
                style={{ background: running ? '#818cf8' : 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: 'white', boxShadow: running ? 'none' : '0 8px 25px rgba(79,70,229,0.4)' }}>
                {running
                  ? <><span className="spinner border-white" />✨ Generating your output...</>
                  : <><Sparkles className="w-5 h-5" /> Run This Prompt — Get Instant Results</>
                }
              </button>

              {/* Result */}
              <AnimatePresence>
                {result && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-5">
                    <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-indigo-100 rounded-lg flex items-center justify-center">
                          <Star className="w-4 h-4 text-indigo-600 fill-indigo-600" />
                        </div>
                        <h3 className="font-display font-bold text-gray-900">Your Result</h3>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={copy}
                          className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-xl font-semibold transition-all ${copied ? 'bg-green-500 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
                          {copied ? <><Check className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy All</>}
                        </button>
                      </div>
                    </div>
                    <div className="bg-white rounded-2xl border border-indigo-100 p-5 max-h-[500px] overflow-y-auto shadow-inner">
                      <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">{result}</pre>
                    </div>
                    <div className="flex items-center gap-2 mt-3 p-3 bg-green-50 rounded-xl border border-green-100">
                      <TrendingUp className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <p className="text-xs text-green-700 font-medium">Output generated! Copy it, refine it in the AI Chat, or run another prompt.</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upgrade modal */}
        <AnimatePresence>
          {showUpgrade && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
                className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
                <button onClick={() => setShowUpgrade(false)} className="float-right p-1.5 hover:bg-gray-100 rounded-lg">
                  <X className="w-4 h-4 text-gray-400" />
                </button>
                <div className="text-center pt-2">
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Crown className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="font-display font-black text-2xl text-gray-900 mb-2">Pro Prompt Locked</h2>
                  <p className="text-gray-500 text-sm mb-5">
                    This advanced prompt is exclusive to Pro members. Upgrade to unlock <strong>{PROMPTS.filter(p => p.isPro).length} Pro prompts</strong> + all premium features.
                  </p>
                  <div className="space-y-2.5 text-left mb-5">
                    {['Advanced revenue & pricing prompts', 'Viral launch & campaign strategies', 'High-converting sales page copy', 'Research synthesis & deep learning guides'].map(f => (
                      <div key={f} className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Check className="w-3 h-3 text-green-600" />
                        </div>
                        <span className="text-sm text-gray-700">{f}</span>
                      </div>
                    ))}
                  </div>
                  <Link href="/dashboard/billing" onClick={() => setShowUpgrade(false)}
                    className="block w-full py-3.5 rounded-xl font-black text-center text-white text-base transition-all"
                    style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: '0 8px 20px rgba(245,158,11,0.4)' }}>
                    🚀 Upgrade to Pro Now
                  </Link>
                  <button onClick={() => setShowUpgrade(false)} className="block w-full mt-2 text-sm text-gray-400 hover:text-gray-600 py-1.5">
                    Maybe later
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </DashboardLayout>
  )
}
