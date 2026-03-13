// src/app/api/users/[id]/ban/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { ok, err, handleError } from '@/lib/response'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = requireAdmin(req)
    if (params.id === admin.userId) return err('Cannot ban yourself', 400)
    const { ban } = await req.json()
    const user = await prisma.user.update({
      where: { id: params.id },
      data: { isBanned: !!ban },
      select: { id: true, isBanned: true, email: true },
    })
    return ok({ user })
  } catch (e) { return handleError(e) }
}
