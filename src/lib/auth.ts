import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { NextRequest } from 'next/server'

const SECRET = process.env.JWT_SECRET!
if (!SECRET) console.warn('⚠️  JWT_SECRET not set – set it in .env')

export interface TokenPayload {
  userId: string
  email: string
  role: string
  plan: string
}

export const signToken = (payload: TokenPayload) =>
  jwt.sign(payload, SECRET, { expiresIn: '7d' })

export const verifyToken = (token: string): TokenPayload =>
  jwt.verify(token, SECRET) as TokenPayload

export const hashPassword = (pw: string) => bcrypt.hash(pw, 12)
export const checkPassword = (pw: string, hash: string) => bcrypt.compare(pw, hash)

export function getAuth(req: NextRequest): TokenPayload | null {
  try {
    const header = req.headers.get('authorization') || ''
    const token = header.startsWith('Bearer ') ? header.slice(7) : null
    // Also check cookie
    const cookie = req.cookies.get('token')?.value
    return verifyToken((token || cookie)!)
  } catch { return null }
}

export function requireAuth(req: NextRequest): TokenPayload {
  const user = getAuth(req)
  if (!user) throw new ApiError('Unauthorized', 401)
  return user
}

export function requireAdmin(req: NextRequest): TokenPayload {
  const user = requireAuth(req)
  if (user.role !== 'ADMIN') throw new ApiError('Forbidden', 403)
  return user
}

export class ApiError extends Error {
  status: number
  constructor(message: string, status = 400) {
    super(message)
    this.status = status
  }
}

// ─── getUserFromRequest: fetch full user from DB via JWT ───────────────────
import { prisma } from './prisma'

export async function getUserFromRequest(req: NextRequest) {
  try {
    const auth = getAuth(req)
    if (!auth) return null
    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { id: true, fullName: true, email: true, plan: true, role: true, isBanned: true, createdAt: true },
    })
    if (!user || user.isBanned) return null
    return user
  } catch { return null }
}
