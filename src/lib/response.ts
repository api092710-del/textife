import { NextResponse } from 'next/server'
import { ApiError } from './auth'

export const ok = (data: object, status = 200) =>
  NextResponse.json({ ok: true, ...data }, { status })

export const err = (message: string, status = 400) =>
  NextResponse.json({ ok: false, error: message }, { status })

export function handleError(e: unknown) {
  if (e instanceof ApiError) return err(e.message, e.status)
  if (e instanceof Error) return err(e.message)
  return err('Internal server error', 500)
}

// Plan limits
export const LIMITS = {
  FREE:     { replies: 50,       bots: 1 },
  PRO:      { replies: 2000,     bots: 3 },
  BUSINESS: { replies: Infinity, bots: Infinity },
} as const

export const PRICES = {
  PRO:      { usd: 19 },
  BUSINESS: { usd: 49 },
} as const
