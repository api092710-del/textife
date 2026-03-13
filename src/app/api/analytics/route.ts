// src/app/api/analytics/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { ok, handleError } from '@/lib/response'

export async function GET(req: NextRequest) {
  try {
    const auth = requireAuth(req)

    // Last 30 days
    const since = new Date(); since.setDate(since.getDate() - 30)

    const [analytics, bots, chatCount, totalMessages] = await Promise.all([
      prisma.analytics.findMany({
        where: { userId: auth.userId, date: { gte: since } },
        orderBy: { date: 'asc' },
      }),
      prisma.botInstance.findMany({
        where: { userId: auth.userId },
        select: { id: true, name: true, status: true, totalReplies: true, leadsCaptures: true },
      }),
      prisma.chatSession.count({ where: { userId: auth.userId } }),
      prisma.chatMessage.count({ where: { session: { userId: auth.userId }, role: 'user' } }),
    ])

    const totalMessages7d = analytics.slice(-7).reduce((s, a) => s + a.messagesHandled, 0)
    const totalLeads7d    = analytics.slice(-7).reduce((s, a) => s + a.leadsCaptures, 0)
    const totalRevenue7d  = analytics.slice(-7).reduce((s, a) => s + a.revenueEst, 0)
    const activeBots      = bots.filter(b => b.status === 'ACTIVE').length

    return ok({
      summary: {
        messagesHandled: totalMessages7d,
        leadsCaptures:   totalLeads7d,
        revenueEst:      totalRevenue7d,
        activeBots,
        totalChatSessions: chatCount,
        totalAiMessages:   totalMessages,
      },
      daily: analytics.map(a => ({
        date:     a.date,
        messages: a.messagesHandled,
        leads:    a.leadsCaptures,
        revenue:  a.revenueEst,
        apiCalls: a.apiCalls,
      })),
      bots,
    })
  } catch (e) {
    return handleError(e)
  }
}
