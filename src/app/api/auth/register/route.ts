import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { hashPassword, signToken } from '@/lib/auth'
import { ok, err, handleError } from '@/lib/response'

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

    const emailExists = await prisma.users.findUnique({
      where: { email: data.email.toLowerCase() }
    })

    const usernameExists = await prisma.users.findUnique({
      where: { username: data.username.toLowerCase() }
    })

    if (emailExists) return err('Email already registered', 409)
    if (usernameExists) return err('Username already taken', 409)

    const user = await prisma.users.create({
      data: {
        fullName: data.fullName.trim(),
        username: data.username.toLowerCase(),
        email: data.email.toLowerCase(),
        dateOfBirth: data.dateOfBirth || null,
        password: await hashPassword(data.password),
        role: 'USER',
        plan: 'FREE',
      }
    })

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      plan: user.plan,
    })

    return ok({ token, user }, 201)

  } catch (e) {
    if (e instanceof z.ZodError) return err(e.errors[0].message, 422)
    return handleError(e)
  }
}
