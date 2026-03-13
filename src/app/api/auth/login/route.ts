// src/app/api/auth/login/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkPassword, signToken } from '@/lib/auth'
import { ok, err, handleError } from '@/lib/response'

export async function POST(req: NextRequest) {
  try {
    const { identifier, password } = await req.json()
    if (!identifier?.trim() || !password) return err('Email/username and password required', 400)

    const user = await prisma.user.findFirst({
      where: { OR: [{ email: identifier.toLowerCase() }, { username: identifier.toLowerCase() }] },
    })

    if (!user)           return err('Invalid credentials', 401)
    if (user.isBanned)   return err('Your account has been suspended. Contact support.', 403)
    if (!user.isActive)  return err('Account inactive', 403)

    const valid = await checkPassword(password, user.password)
    if (!valid) return err('Invalid credentials', 401)

    const token = signToken({ userId: user.id, email: user.email, role: user.role, plan: user.plan })

    const safeUser = {
      id: user.id, fullName: user.fullName, username: user.username,
      email: user.email, role: user.role, plan: user.plan, createdAt: user.createdAt,
    }

    return ok({ token, user: safeUser })
  } catch (e) {
    return handleError(e)
  }
}
