import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { ok, err } from '@/lib/response'

// Simple in-memory streak tracking (in production use DB)
const streaks: Record<string, { streak: number; lastDate: string; xp: number; badges: string[] }> = {}

export async function GET(req: NextRequest) {
  try {
    const user = requireAuth(req)
    const data = streaks[user.userId] || { streak: 0, lastDate: '', xp: 0, badges: [] }
    return ok({ ...data })
  } catch (e: any) { return err(e.message) }
}

export async function POST(req: NextRequest) {
  try {
    const user = requireAuth(req)
    const { action = 'checkin' } = await req.json()
    const today = new Date().toDateString()
    const current = streaks[user.userId] || { streak: 0, lastDate: '', xp: 0, badges: [] }

    if (action === 'checkin') {
      const yesterday = new Date(Date.now() - 86400000).toDateString()
      let newStreak = current.streak
      if (current.lastDate === today) return ok({ ...current, message: 'Already checked in today!' })
      if (current.lastDate === yesterday) newStreak += 1
      else if (current.lastDate !== today) newStreak = 1

      const xpGain = newStreak * 10
      const newXP = current.xp + xpGain
      const badges = [...current.badges]
      if (newStreak === 7 && !badges.includes('week_warrior')) badges.push('week_warrior')
      if (newStreak === 30 && !badges.includes('monthly_master')) badges.push('monthly_master')
      if (newXP >= 100 && !badges.includes('century')) badges.push('century')
      if (newXP >= 500 && !badges.includes('power_user')) badges.push('power_user')

      streaks[user.userId] = { streak: newStreak, lastDate: today, xp: newXP, badges }
      return ok({ streak: newStreak, xp: newXP, xpGain, badges, message: `+${xpGain} XP! Day ${newStreak} streak! 🔥` })
    }

    if (action === 'use_tool') {
      const xpGain = 5
      streaks[user.userId] = { ...current, xp: current.xp + xpGain }
      return ok({ ...streaks[user.userId], xpGain })
    }

    return ok(current)
  } catch (e: any) { return err(e.message) }
}
