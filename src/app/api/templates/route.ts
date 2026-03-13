// src/app/api/templates/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { ok, handleError } from '@/lib/response'

export async function GET(req: NextRequest) {
  try {
    const auth = requireAuth(req)
    const templates = await prisma.template.findMany({
      where: { OR: [{ isPublic: true }, { userId: auth.userId }] },
      orderBy: [{ usageCount: 'desc' }, { createdAt: 'desc' }],
    })
    return ok({ templates })
  } catch (e) { return handleError(e) }
}

export async function POST(req: NextRequest) {
  try {
    const auth = requireAuth(req)
    const { title, category, content, description } = await req.json()
    const template = await prisma.template.create({
      data: { title, category, content, description, userId: auth.userId, isPublic: false },
    })
    return ok({ template }, 201)
  } catch (e) { return handleError(e) }
}
