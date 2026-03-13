// src/app/api/bots/[id]/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { ok, err, handleError } from '@/lib/response'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = requireAuth(req)
    const body = await req.json()

    const bot = await prisma.botInstance.findFirst({ where: { id: params.id, userId: auth.userId } })
    if (!bot) return err('Bot not found', 404)

    const updated = await prisma.botInstance.update({
      where: { id: params.id },
      data: {
        ...(body.name        !== undefined && { name: body.name.trim() }),
        ...(body.phoneNumber !== undefined && { phoneNumber: body.phoneNumber }),
        ...(body.status      !== undefined && { status: body.status }),
        ...(body.config      !== undefined && { config: JSON.stringify(body.config) }),
      },
    })
    return ok({ bot: updated })
  } catch (e) { return handleError(e) }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = requireAuth(req)
    const bot = await prisma.botInstance.findFirst({ where: { id: params.id, userId: auth.userId } })
    if (!bot) return err('Bot not found', 404)
    await prisma.botInstance.delete({ where: { id: params.id } })
    return ok({ deleted: true })
  } catch (e) { return handleError(e) }
}
