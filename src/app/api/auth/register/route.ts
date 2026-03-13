import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { hashPassword, signToken } from '@/lib/auth'
import { ok, err, handleError } from '@/lib/response'

const schema = z.object({
  fullName:        z.string().min(2, 'Name must be at least 2 characters'),
  username:        z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, underscores'),
  email:           z.string().email('Invalid email'),
  dateOfBirth:     z.string().optional(),
  password:        z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = schema.parse(body)

    // Check duplicates - use raw queries to bypass RLS
    const [emailCheck, usernameCheck] = await Promise.all([
      prisma.$queryRaw`SELECT id FROM users WHERE email = ${data.email.toLowerCase()} LIMIT 1`,
      prisma.$queryRaw`SELECT id FROM users WHERE username = ${data.username.toLowerCase()} LIMIT 1`,
    ])

    if (Array.isArray(emailCheck) && emailCheck.length > 0) 
      return err('Email already registered', 409)
    if (Array.isArray(usernameCheck) && usernameCheck.length > 0) 
      return err('Username already taken', 409)

    // Create user (this works without RLS)
    const user = await prisma.user.create({
      data: {
        fullName:    data.fullName.trim(),
        username:    data.username.toLowerCase(),
        email:       data.email.toLowerCase(),
        dateOfBirth: data.dateOfBirth || null,
        password:    await hashPassword(data.password),
        plan:        'FREE',
        role:        'USER',
      },
      select: { id: true, fullName: true, username: true, email: true, role: true, plan: true, createdAt: true },
    })

    // ADD THIS: Set RLS context after user creation
    await prisma.$executeRaw`SELECT set_config('app.user_id', ${user.id}, TRUE)`;

    // OPTIONAL: Create initial analytics record
    await prisma.analytics.create({
      data: {
        userId: user.id,
        messagesHandled: 0,
        leadsCaptures: 0,
        revenueEst: 0,
        apiCalls: 0
      }
    }).catch(err => console.error('Failed to create analytics:', err));

    const token = signToken({ userId: user.id, email: user.email, role: user.role, plan: user.plan })
    return ok({ token, user }, 201)
  } catch (e) {
    if (e instanceof z.ZodError) return err(e.errors[0].message, 422)
    return handleError(e)
  }
}