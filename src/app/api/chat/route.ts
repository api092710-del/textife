import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, ApiError } from '@/lib/auth'
import { ok, err, handleError, LIMITS } from '@/lib/response'

const SYSTEM = `You are Textife AI — a sharp, friendly, and insanely helpful business assistant.
Your personality: warm, direct, zero fluff, like a brilliant friend who happens to know everything.

RULES:
- Give SHORT answers unless asked to elaborate (3-5 sentences max by default)
- Be conversational, use emojis sparingly but naturally
- Always be specific and actionable — no vague advice
- If asked to write something, write it immediately without preamble
- End answers with one quick follow-up question OR a pro tip when relevant
- Topics you know best: WhatsApp automation, Textife tools, lead gen, sales, marketing, content creation, business growth, productivity`

export async function POST(req: NextRequest) {
  try {
    const auth = requireAuth(req)
    const { message, sessionId } = await req.json()
    if (!message?.trim()) return err('Message required', 400)

    const user = await prisma.user.findUnique({ where: { id: auth.userId } })
    if (!user || user.isBanned) throw new ApiError('Account suspended', 403)

    const startOfMonth = new Date(); startOfMonth.setDate(1); startOfMonth.setHours(0,0,0,0)
    const used = await prisma.chatMessage.count({
      where: { session: { userId: user.id }, role: 'user', createdAt: { gte: startOfMonth } },
    })
    const limit = LIMITS[user.plan as keyof typeof LIMITS]?.replies ?? 50
    if (used >= limit) return err(`You've used all ${limit} AI replies this month. Please upgrade.`, 429)

    const session = sessionId
      ? await prisma.chatSession.findFirst({ where: { id: sessionId, userId: user.id } })
        ?? await prisma.chatSession.create({ data: { userId: user.id, title: message.slice(0, 60) } })
      : await prisma.chatSession.create({ data: { userId: user.id, title: message.slice(0, 60) } })

    const history = await prisma.chatMessage.findMany({
      where: { sessionId: session.id },
      orderBy: { createdAt: 'asc' },
      take: 16,
    })

    await prisma.chatMessage.create({ data: { sessionId: session.id, role: 'user', content: message } })

    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes('YOUR_')) {
      const fallback = `⚠️ OpenAI API key not configured. Add OPENAI_API_KEY to your Vercel environment variables.`
      await prisma.chatMessage.create({ data: { sessionId: session.id, role: 'assistant', content: fallback } })
      return ok({ reply: fallback, sessionId: session.id, usedReplies: used + 1, limit })
    }

    const messages = [
      { role: 'system', content: SYSTEM },
      ...history.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      { role: 'user', content: message },
    ]

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 1200,
        messages,
      }),
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.error?.message || 'AI request failed')

    const reply = data.choices?.[0]?.message?.content || 'No response generated.'
    const tokens = data.usage?.total_tokens || 0

    await prisma.chatMessage.create({ data: { sessionId: session.id, role: 'assistant', content: reply, tokens } })

    const today = new Date(); today.setHours(0,0,0,0)
    await prisma.analytics.upsert({
      where: { id: `${user.id}-${today.toISOString().split('T')[0]}` },
      update: { apiCalls: { increment: 1 }, messagesHandled: { increment: 1 } },
      create: { id: `${user.id}-${today.toISOString().split('T')[0]}`, userId: user.id, date: today, apiCalls: 1, messagesHandled: 1 },
    }).catch(() => {})

    return ok({ reply, sessionId: session.id, usedReplies: used + 1, limit, tokens })
  } catch (e: any) { return handleError(e) }
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
  } catch (e) { return handleError(e) }
}
