import { NextRequest } from 'next/server'
import { z } from 'zod'

const schema = z.object({
  fullName: z.string().min(2),
  username: z.string().min(3).max(30),
  email: z.string().email(),
  dateOfBirth: z.string().optional(),
  password: z.string().min(8),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = schema.parse(body)

    // 🔥 FAKE USER (NO DB)
    const user = {
      id: 'demo-user-' + Date.now(),
      fullName: data.fullName,
      username: data.username.toLowerCase(),
      email: data.email.toLowerCase(),
      role: 'USER',
      plan: 'FREE',
      createdAt: new Date().toISOString(),
    }

    // 🔥 FAKE TOKEN
    const token = 'fake-token-' + Date.now()

    return Response.json({
      token,
      user,
    }, { status: 201 })

  } catch (e: any) {
    return Response.json(
      { error: e.message || 'Registration failed' },
      { status: 400 }
    )
  }
}
