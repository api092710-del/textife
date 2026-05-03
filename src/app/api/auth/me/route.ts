import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const user = requireAuth(req)

    return Response.json({
      user: {
        id: user.userId,
        fullName: 'Demo User',
        username: 'demo',
        email: user.email,
        role: user.role,
        plan: user.plan,
        createdAt: new Date().toISOString(),
        isBanned: false,
      },
    })
  } catch {
    return Response.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
}
