import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { NextRequest } from 'next/server'
import { prisma } from './prisma'

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

// ─── NEW: Set RLS context for the current request ───────────────────
export async function setRLSContext(userId: string) {
  try {
    await prisma.$executeRaw`SELECT set_config('app.user_id', ${userId}, TRUE)`
  } catch (error) {
    console.error('Failed to set RLS context:', error)
  }
}

// ─── getUserFromRequest: fetch full user from DB via JWT ───────────────────
export async function getUserFromRequest(req: NextRequest) {
  try {
    const auth = getAuth(req)
    if (!auth) return null
    
    // SET RLS CONTEXT before querying
    await setRLSContext(auth.userId)
    
    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { id: true, fullName: true, email: true, plan: true, role: true, isBanned: true, createdAt: true },
    })
    
    if (!user || user.isBanned) return null
    return user
  } catch { return null }
}

// ─── Helper for API routes to set RLS context ───────────────────
export async function withRLS<T>(
  req: NextRequest,
  fn: (userId: string) => Promise<T>
): Promise<T> {
  const auth = requireAuth(req)
  await setRLSContext(auth.userId)
  return fn(auth.userId)
}