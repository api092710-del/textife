import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { NextRequest } from 'next/server'

const SECRET = process.env.JWT_SECRET || 'dev_secret_key'

export interface TokenPayload {
  userId: string
  email: string
  role: string
  plan: string
}

export const signToken = (payload: TokenPayload) =>
  jwt.sign(payload, SECRET, { expiresIn: '7d' })

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, SECRET) as TokenPayload
}

export function getAuth(req: NextRequest): TokenPayload | null {
  try {
    const header = req.headers.get('authorization')
    const token = header?.startsWith('Bearer ')
      ? header.split(' ')[1]
      : null

    if (!token) return null

    return verifyToken(token)
  } catch {
    return null
  }
}

export function requireAuth(req: NextRequest): TokenPayload {
  const user = getAuth(req)
  if (!user) throw new Error('Unauthorized')
  return user
}
