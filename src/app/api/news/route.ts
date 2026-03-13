import { NextRequest } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { ok, err } from '@/lib/response'
import { generateAndCacheAlerts } from '@/lib/intel/alerts'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) return err('Unauthorized', 401)

    const isPro = user.plan === 'PRO' || user.plan === 'BUSINESS'
    const alertCount = isPro ? 5 : 2

    // Get cached or freshly generated alerts (AI only runs once/day)
    const payload = await generateAndCacheAlerts()

    // Slice to user's plan limit
    const alerts = payload.alerts.slice(0, alertCount)

    return ok({
      alerts,
      tip: payload.tip,
      generatedAt: payload.generatedAt,
      signalCount: payload.signalCount,
      isPro,
      plan: user.plan,
      totalAvailable: payload.alerts.length,
    })
  } catch (e: any) {
    console.error('[News API]', e.message)
    return err(e.message || 'Failed to load alerts')
  }
}
