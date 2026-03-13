// src/app/api/bots/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, ApiError } from '@/lib/auth'
import { ok, err, handleError, LIMITS } from '@/lib/response'

export async function GET(req: NextRequest) {
  try {
    const auth = requireAuth(req)
    const bots = await prisma.botInstance.findMany({
      where: { userId: auth.userId },
      orderBy: { createdAt: 'desc' },
    })
    return ok({ bots })
  } catch (e) { return handleError(e) }
}

export async function POST(req: NextRequest) {
  try {
    const auth = requireAuth(req)
    const { name, phoneNumber } = await req.json()
    if (!name?.trim()) return err('Bot name required', 400)

    // Check plan limit
    const user = await prisma.user.findUnique({ where: { id: auth.userId } })
    const existing = await prisma.botInstance.count({ where: { userId: auth.userId } })
    const limit = LIMITS[user?.plan as keyof typeof LIMITS]?.bots ?? 1
    if (existing >= limit) return err(`Your ${user?.plan} plan allows max ${limit} bot(s). Upgrade to add more.`, 403)

    const bot = await prisma.botInstance.create({
      data: { userId: auth.userId, name: name.trim(), phoneNumber: phoneNumber?.trim() || null },
    })
    return ok({ bot }, 201)
  } catch (e) { return handleError(e) }
}
