import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, setRLSContext } from '@/lib/auth'
import { ok, handleError } from '@/lib/response'

export async function GET(req: NextRequest) {
  try {
    const auth = requireAuth(req)
    
    // Set RLS context
    await setRLSContext(auth.userId)
    
    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { id: true, fullName: true, username: true, email: true, role: true, plan: true, createdAt: true, isBanned: true },
    })
    
    if (!user || user.isBanned) throw new Error('User not found')
    return ok({ user })
  } catch (e) {
    return handleError(e)
  }
}