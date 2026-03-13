/**
 * Daily Cron Job: Collect signals → Generate AI alerts → Cache in DB
 * Trigger via Vercel Cron (vercel.json) or external cron service.
 * Protected by CRON_SECRET environment variable.
 */
import { NextRequest, NextResponse } from 'next/server'
import { runIngestion } from '@/lib/intel/ingest'
import { generateAndCacheAlerts } from '@/lib/intel/alerts'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function GET(req: NextRequest) {
  // Verify secret
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const startTime = Date.now()
  const results: Record<string, any> = {}

  try {
    // Step 1: Ingest signals from feeds
    console.log('[Cron] Starting signal ingestion...')
    results.ingestion = await runIngestion()
    console.log('[Cron] Ingestion complete:', results.ingestion)

    // Step 2: Generate fresh AI alerts (force refresh)
    console.log('[Cron] Generating AI alerts...')
    const payload = await generateAndCacheAlerts(true)
    results.alerts = {
      count: payload.alerts.length,
      signalCount: payload.signalCount,
      generatedAt: payload.generatedAt,
    }
    console.log('[Cron] Alerts generated:', results.alerts)

    const duration = Date.now() - startTime

    return NextResponse.json({
      ok: true,
      duration: `${duration}ms`,
      ...results,
    })
  } catch (e: any) {
    console.error('[Cron] Error:', e.message)
    return NextResponse.json({
      ok: false,
      error: e.message,
      results,
      duration: `${Date.now() - startTime}ms`,
    }, { status: 500 })
  }
}
