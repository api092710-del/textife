import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { NextRequest } from 'next/server'
import { prisma } from './prisma'

const SECRET = process.env.JWT_SECRET

if (!SECRET) {
  console.warn('⚠️ JWT_SECRET is missing in environment variables')
}

export interface TokenPayload {
  userId: string
  email: string
  role: string
  plan: string
}

export const signToken = (payload: TokenPayload) => {
  if (!SECRET) throw new Error('JWT_SECRET missing')
  return jwt.sign(payload, SECRET, { expiresIn: '7d' })
}

export const verifyToken = (token: string): TokenPayload => {
  if (!SECRET) throw new Error('JWT_SECRET missing')
  return jwt.verify(token, SECRET) as TokenPayload
}

export const hashPassword = (pw: string) => bcrypt.hash(pw, 12)
export const checkPassword = (pw: string, hash: string) => bcrypt.compare(pw, hash)

export function getAuth(req: NextRequest): TokenPayload | null {
  try {
    const header = req.headers.get('authorization') || ''
    const token = header.startsWith('Bearer ') ? header.slice(7) : null
    const cookie = req.cookies.get('token')?.value

    if (!token && !cookie) return null

    return verifyToken(token || cookie!)
  } catch {
    return null
  }
}

export function requireAuth(req: NextRequest): TokenPayload {
  const user = getAuth(req)
  if (!user) throw new Error('Unauthorized')
  return user
}

export function requireAdmin(req: NextRequest): TokenPayload {
  const user = requireAuth(req)
  if (user.role !== 'ADMIN') throw new Error('Forbidden')
  return user
}

// ─── RLS helper ─────────────────────────────
export async function setRLSContext(userId: string) {
  try {
    await prisma.$executeRaw`
      SELECT set_config('app.user_id', ${userId}, TRUE)
    `
  } catch (err) {
    console.error('RLS error:', err)
  }
}

// ─── FIXED: correct Prisma model usage ───────
export async function getUserFromRequest(req: NextRequest) {
  try {
    const auth = getAuth(req)
    if (!auth) return null

    await setRLSContext(auth.userId)

    const user = await prisma.users.findUnique({
      where: { id: auth.userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        plan: true,
        role: true,
        isBanned: true,
        createdAt: true,
      },
    })

    if (!user || user.isBanned) return null
    return user
  } catch {
    return null
  }
}

export async function withRLS<T>(
  req: NextRequest,
  fn: (userId: string) => Promise<T>
): Promise<T> {
  const auth = requireAuth(req)
  await setRLSContext(auth.userId)
  return fn(auth.userId)
}
