import { NextRequest } from 'next/server'
import { signToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()

  // TEMP LOGIN (single user)
  if (email !== 'demo@textife.com' || password !== '123456') {
    return Response.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    )
  }

  const token = signToken({
    userId: 'user_1',
    email,
    role: 'USER',
    plan: 'FREE',
  })

  return Response.json({
    token,
    user: {
      id: 'user_1',
      fullName: 'Demo User',
      username: 'demo',
      email,
      role: 'USER',
      plan: 'FREE',
    },
  })
}
