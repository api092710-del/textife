// src/app/api/chat/route.ts
import { NextRequest } from 'next/server'
import OpenAI from 'openai'
import { prisma } from '@/lib/prisma'
import { requireAuth, ApiError } from '@/lib/auth'
import { ok, err, handleError, LIMITS } from '@/lib/response'

const SYSTEM = `You are Trendygene AI, an expert business growth assistant. You specialize in:

1. **WhatsApp Business Automation** – bot setup, reply flows, lead capture sequences
2. **Lead Generation** – strategies, funnels, qualification scripts
3. **Sales Optimization** – closing techniques, follow-up sequences, objection handling  
4. **Marketing Campaigns** – copywriting, promotions, content calendars
5. **Business Automation** – tools, workflows, time-saving systems
6. **E-commerce Growth** – product listings, pricing, customer retention
7. **Tool Recommendations** – specific software, integrations, and platforms with pros/cons

Response style:
- Be specific, practical, and actionable — no fluff
- Use numbered steps for guides
- Use emojis sparingly but effectively
- Recommend real tools by name (Zapier, Make, Notion, etc.)
- Give examples relevant to the user's business context
- Format longer answers with clear sections using **bold headers**`

export async function POST(req: NextRequest) {
  try {
    const auth = requireAuth(req)
    const { message, sessionId } = await req.json()

    if (!message?.trim()) return err('Message required', 400)

    // Get fresh user from DB
    const user = await prisma.user.findUnique({ where: { id: auth.userId } })
    if (!user || user.isBanned) throw new ApiError('Account suspended', 403)

    // Check monthly usage
    const startOfMonth = new Date(); startOfMonth.setDate(1); startOfMonth.setHours(0,0,0,0)
    const used = await prisma.chatMessage.count({
      where: { session: { userId: user.id }, role: 'user', createdAt: { gte: startOfMonth } },
    })

    const limit = LIMITS[user.plan as keyof typeof LIMITS]?.replies ?? 50
    if (used >= limit) {
      return err(`You've used all ${limit} AI replies this month on the ${user.plan} plan. Please upgrade.`, 429)
    }

    // Get or create session
    const session = sessionId
      ? await prisma.chatSession.findFirst({ where: { id: sessionId, userId: user.id } })
        ?? await prisma.chatSession.create({ data: { userId: user.id, title: message.slice(0, 60) } })
      : await prisma.chatSession.create({ data: { userId: user.id, title: message.slice(0, 60) } })

    // Load conversation history (last 16 messages = ~8 turns)
    const history = await prisma.chatMessage.findMany({
      where: { sessionId: session.id },
      orderBy: { createdAt: 'asc' },
      take: 16,
    })

    // Save user message
    await prisma.chatMessage.create({ data: { sessionId: session.id, role: 'user', content: message } })

    // Check OpenAI key
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.startsWith('sk-proj-YOUR')) {
      const fallback = `⚠️ OpenAI API key not configured yet.\n\nTo enable AI responses:\n1. Get your key at platform.openai.com\n2. Add \`OPENAI_API_KEY=sk-...\` to your \`.env\` file\n3. Restart the server\n\nYour message was: "${message}"`
      await prisma.chatMessage.create({ data: { sessionId: session.id, role: 'assistant', content: fallback } })
      return ok({ reply: fallback, sessionId: session.id, usedReplies: used + 1, limit })
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: SYSTEM },
        ...history.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
        { role: 'user', content: message },
      ],
      max_tokens: 1200,
      temperature: 0.7,
    })

    const reply = completion.choices[0]?.message?.content || 'Sorry, no response generated. Please try again.'
    const tokens = completion.usage?.total_tokens || 0

    await prisma.chatMessage.create({ data: { sessionId: session.id, role: 'assistant', content: reply, tokens } })

    // Update analytics
    const today = new Date(); today.setHours(0,0,0,0)
    await prisma.analytics.upsert({
      where: { id: `${user.id}-${today.toISOString().split('T')[0]}` },
      update: { apiCalls: { increment: 1 }, messagesHandled: { increment: 1 } },
      create: { id: `${user.id}-${today.toISOString().split('T')[0]}`, userId: user.id, date: today, apiCalls: 1, messagesHandled: 1 },
    }).catch(() => {}) // non-critical

    return ok({ reply, sessionId: session.id, usedReplies: used + 1, limit, tokens })
  } catch (e: any) {
    if (e?.code === 'insufficient_quota') return err('OpenAI quota exceeded. Check your OpenAI billing.', 503)
    if (e?.status === 401) return err('Invalid OpenAI API key. Check your .env file.', 503)
    return handleError(e)
  }
}

export async function GET(req: NextRequest) {
  try {
    const auth = requireAuth(req)
    const sessions = await prisma.chatSession.findMany({
      where: { userId: auth.userId },
      orderBy: { updatedAt: 'desc' },
      take: 30,
      include: { messages: { take: 1, orderBy: { createdAt: 'desc' }, select: { content: true, role: true } } },
    })
    return ok({ sessions })
  } catch (e) {
    return handleError(e)
  }
}
