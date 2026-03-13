import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ok, err } from '@/lib/response'

export async function GET(req: NextRequest) {
  try {
    const user = requireAuth(req)
    const bots = await prisma.botInstance.findMany({
      where: { userId: user.userId },
      select: { id: true, name: true, leadsCaptures: true, totalReplies: true, status: true, phoneNumber: true, createdAt: true }
    })
    const leads = bots.map(b => ({
      id: b.id,
      botName: b.name,
      phone: b.phoneNumber,
      leads: b.leadsCaptures,
      replies: b.totalReplies,
      status: b.status,
      date: b.createdAt
    }))
    return ok({ leads, total: leads.reduce((a, l) => a + l.leads, 0) })
  } catch (e: any) { return err(e.message, e.status) }
}
