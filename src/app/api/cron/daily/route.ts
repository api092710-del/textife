/**
 * Daily Cron Job: Collect signals → Generate AI alerts → Cache in DB
 */

import { NextRequest, NextResponse } from 'next/server'
import { runIngestion } from '@/lib/intel/ingest'
import { generateAndCacheAlerts } from '@/lib/intel/alerts'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

export async function GET(req: NextRequest) {

  const { searchParams } = new URL(req.url)
  const secret = searchParams.get("secret")

  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const startTime = Date.now()
  const results: Record<string, any> = {}

  try {

    console.log('[Cron] Starting signal ingestion...')
    results.ingestion = await runIngestion()

    console.log('[Cron] Generating AI alerts...')
    const payload = await generateAndCacheAlerts(true)

    results.alerts = {
      count: payload.alerts.length,
      signalCount: payload.signalCount,
      generatedAt: payload.generatedAt
    }

    const duration = Date.now() - startTime

    return NextResponse.json({
      ok: true,
      duration: `${duration}ms`,
      ...results
    })

  } catch (e: any) {

    console.error('[Cron] Error:', e.message)

    return NextResponse.json({
      ok: false,
      error: e.message,
      results,
      duration: `${Date.now() - startTime}ms`
    }, { status: 500 })

  }
}