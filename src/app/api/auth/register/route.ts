import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  const body = await req.json()

  return Response.json({
    token: 'vercel-fake-token',
    user: {
      id: 'user_' + Date.now(),
      fullName: body.fullName,
      username: body.username,
      email: body.email,
      role: 'USER',
      plan: 'FREE',
    }
  })
}
