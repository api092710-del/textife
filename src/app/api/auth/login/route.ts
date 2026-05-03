import { NextRequest } from 'next/server'
import { signToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const { identifier } = await req.json()

  const user = {
    id: 'user_123',
    fullName: 'Demo User',
    username: 'demo',
    email: identifier,
    role: 'USER',
    plan: 'FREE',
  }

  const token = signToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    plan: user.plan,
  })

  return Response.json({
    token,
    user,
  })
}
