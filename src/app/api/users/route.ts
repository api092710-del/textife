// src/app/api/users/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { ok, handleError } from '@/lib/response'

export async function GET(req: NextRequest) {
  try {
    requireAdmin(req)
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, fullName: true, username: true, email: true,
        role: true, plan: true, isActive: true, isBanned: true, createdAt: true,
        _count: { select: { botInstances: true, chatSessions: true, payments: true } },
      },
    })
    return ok({ users })
  } catch (e) { return handleError(e) }
}
