// src/app/api/chat/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, ApiError } from '@/lib/auth'
import { ok, err, handleError, LIMITS } from '@/lib/response'

const SYSTEM = `You are Textife AI, an expert business growth assistant specializing in WhatsApp automation, lead generation, sales, marketing, and business growth. Be specific, practical, and actionable.`

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

    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY.includes('YOUR_')) {
      const fallback = `⚠️ Anthropic API key not configured. Add ANTHROPIC_API_KEY to your Vercel environment variables. Get your key at: console.anthropic.com`
      await prisma.chatMessage.create({ data: { sessionId: session.id, role: 'assistant', content: fallback } })
      return ok({ reply: fallback, sessionId: session.id, usedReplies: used + 1, limit })
    }

    const messages = [
      ...history.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      { role: 'user' as const, content: message },
    ]

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1200,
        system: SYSTEM,
        messages,
      }),
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.error?.message || 'AI request failed')

    const reply = data.content?.[0]?.text || 'No response generated. Please try again.'
    const tokens = (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0)

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
