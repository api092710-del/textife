import { NextRequest } from 'next/server'
import { ok, err } from '@/lib/response'

export async function POST(req: NextRequest) {
  try {
    const { identifier, password } = await req.json()

    if (!identifier?.trim() || !password) {
      return err('Email/username and password required', 400)
    }

    // 🔥 FAKE LOGIN USER
    const user = {
      id: 'demo-user-1',
      fullName: 'Demo User',
      username: 'demo',
      email: identifier.toLowerCase(),
      role: 'USER',
      plan: 'FREE',
      isActive: true,
      isBanned: false,
      createdAt: new Date().toISOString(),
    }

    // 🔥 FAKE TOKEN
    const token = 'fake-token-' + Date.now()

    return Response.json({
      token,
      user,
    })

  } catch (e: any) {
    return Response.json(
      { error: e.message || 'Login failed' },
      { status: 400 }
    )
  }
}
