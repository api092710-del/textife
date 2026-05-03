import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  const { identifier } = await req.json()

  return Response.json({
    token: 'vercel-fake-token',
    user: {
      id: 'user_123',
      fullName: 'Demo User',
      username: 'demo',
      email: identifier,
      role: 'USER',
      plan: 'FREE',
    }
  })
}
