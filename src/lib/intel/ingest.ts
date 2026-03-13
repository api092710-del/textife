/**
 * Threat Intelligence Ingestion Service
 * Collects real scam/phishing signals from public cybersecurity feeds.
 * Sources: OpenPhish, PhishTank, Abuse.ch URLhaus, and pattern-matched news.
 */

import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export interface RawSignal {
  source: string
  title: string
  description?: string
  url?: string
  platform?: string
  region?: string
  rawData?: string
}

/** Hash a string for dedup */
function makeHash(val: string): string {
  return crypto.createHash('sha256').update(val).digest('hex').slice(0, 32)
}

/** Classify which platform a URL/domain likely targets */
function detectPlatform(url: string): string {
  const u = url.toLowerCase()
  if (u.includes('paypal')) return 'PayPal'
  if (u.includes('facebook') || u.includes('fb.')) return 'Facebook'
  if (u.includes('whatsapp') || u.includes('whats-app')) return 'WhatsApp'
  if (u.includes('instagram') || u.includes('insta')) return 'Instagram'
  if (u.includes('amazon')) return 'Amazon'
  if (u.includes('apple') || u.includes('icloud')) return 'Apple/iCloud'
  if (u.includes('google') || u.includes('gmail') || u.includes('g00gle')) return 'Google'
  if (u.includes('microsoft') || u.includes('outlook') || u.includes('hotmail')) return 'Microsoft'
  if (u.includes('bank') || u.includes('chase') || u.includes('hsbc') || u.includes('wells')) return 'Banking'
  if (u.includes('coinbase') || u.includes('binance') || u.includes('crypto') || u.includes('bitcoin')) return 'Crypto Exchange'
  if (u.includes('linkedin')) return 'LinkedIn'
  if (u.includes('tiktok')) return 'TikTok'
  if (u.includes('netflix')) return 'Netflix'
  if (u.includes('dhl') || u.includes('fedex') || u.includes('ups') || u.includes('parcel')) return 'Delivery/Courier'
  return 'Web/Email'
}

/** Ingest from OpenPhish public feed (plain text, one URL per line) */
async function ingestOpenPhish(): Promise<RawSignal[]> {
  const signals: RawSignal[] = []
  try {
    const res = await fetch('https://openphish.com/feed.txt', {
      headers: { 'User-Agent': 'SecurityResearch/1.0' },
      signal: AbortSignal.timeout(10000),
      // @ts-ignore
      cache: 'no-store',
    })
    if (!res.ok) return signals

    const text = await res.text()
    const lines = text.trim().split('\n').filter(Boolean).slice(0, 50) // top 50

    for (const line of lines) {
      const url = line.trim()
      if (!url.startsWith('http')) continue
      let domain = ''
      try { domain = new URL(url).hostname } catch { domain = url.slice(0, 60) }

      signals.push({
        source: 'openphish',
        title: `Phishing Site Detected: ${domain}`,
        description: `Active phishing page impersonating a legitimate service. URL flagged by OpenPhish community intelligence feed.`,
        url,
        platform: detectPlatform(url),
        region: 'Global',
        rawData: JSON.stringify({ url, source: 'openphish' }),
      })
    }
  } catch (e) {
    console.warn('[Intel] OpenPhish ingest error:', (e as Error).message)
  }
  return signals
}

/** Ingest from Abuse.ch URLhaus (JSON API of recent malware URLs) */
async function ingestAbuseChURLhaus(): Promise<RawSignal[]> {
  const signals: RawSignal[] = []
  try {
    const res = await fetch('https://urlhaus-api.abuse.ch/v1/urls/recent/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'limit=50',
      signal: AbortSignal.timeout(10000),
    })
    if (!res.ok) return signals

    const data = await res.json()
    if (!Array.isArray(data.urls)) return signals

    for (const entry of data.urls.slice(0, 40)) {
      if (entry.url_status === 'offline') continue
      const url = entry.url || ''
      let domain = ''
      try { domain = new URL(url).hostname } catch { domain = url.slice(0, 60) }

      const tags: string[] = entry.tags || []
      const isMalware = tags.some((t: string) => ['malware', 'ransomware', 'trojan', 'botnet'].includes(t.toLowerCase()))
      const isPhish  = tags.some((t: string) => ['phishing', 'credential'].includes(t.toLowerCase()))

      const type = isMalware ? 'Malware Distribution' : isPhish ? 'Phishing Kit' : 'Malicious URL'

      signals.push({
        source: 'abusech',
        title: `${type} Active: ${domain}`,
        description: `Abuse.ch URLhaus has flagged this URL as actively distributing ${tags.join(', ') || 'malware/exploits'}. Threat added ${entry.date_added || 'recently'}.`,
        url,
        platform: detectPlatform(url),
        region: 'Global',
        rawData: JSON.stringify({ url, tags, reporter: entry.reporter, threat: entry.threat }),
      })
    }
  } catch (e) {
    console.warn('[Intel] Abuse.ch ingest error:', (e as Error).message)
  }
  return signals
}

/** Ingest PhishTank verified phishing URLs (public JSON dump) */
async function ingestPhishTank(): Promise<RawSignal[]> {
  const signals: RawSignal[] = []
  try {
    // PhishTank provides a public JSON file (no API key needed for basic access)
    const res = await fetch('https://data.phishtank.com/data/online-valid.json', {
      headers: { 'User-Agent': 'phishtank/textife-radar' },
      signal: AbortSignal.timeout(15000),
    })
    if (!res.ok) return signals

    const data: any[] = await res.json()
    // Only take latest 50 verified entries
    const recent = data.slice(0, 50)

    for (const entry of recent) {
      const url = entry.url || ''
      if (!url) continue
      let domain = ''
      try { domain = new URL(url).hostname } catch { domain = url.slice(0, 60) }

      signals.push({
        source: 'phishtank',
        title: `Verified Phishing: ${domain}`,
        description: `Community-verified phishing page targeting ${entry.details?.[0]?.ip_address ? 'IP: ' + entry.details[0].ip_address : 'users'}. Verified by multiple independent sources.`,
        url,
        platform: detectPlatform(url),
        region: entry.details?.[0]?.country_code || 'Global',
        rawData: JSON.stringify({ phish_id: entry.phish_id, target: entry.target, verified: entry.verified }),
      })
    }
  } catch (e) {
    console.warn('[Intel] PhishTank ingest error:', (e as Error).message)
  }
  return signals
}

/** Save signals to DB, skipping duplicates via hash */
export async function saveSignals(signals: RawSignal[]): Promise<number> {
  let saved = 0
  for (const sig of signals) {
    const hashSource = sig.url || sig.title
    const hash = makeHash(hashSource)
    try {
      await prisma.scamSignal.upsert({
        where: { hash },
        create: {
          source: sig.source,
          title: sig.title,
          description: sig.description || '',
          url: sig.url || '',
          platform: sig.platform || 'Unknown',
          region: sig.region || 'Global',
          rawData: sig.rawData,
          hash,
        },
        update: {}, // don't update — keep original
      })
      saved++
    } catch { /* skip */ }
  }
  return saved
}

/** Main ingestion: collect from all sources and save */
export async function runIngestion(): Promise<{ total: number; sources: Record<string, number> }> {
  const [openPhish, abuseCh, phishTank] = await Promise.allSettled([
    ingestOpenPhish(),
    ingestAbuseChURLhaus(),
    ingestPhishTank(),
  ])

  const op  = openPhish.status  === 'fulfilled' ? openPhish.value  : []
  const ac  = abuseCh.status    === 'fulfilled' ? abuseCh.value    : []
  const pt  = phishTank.status  === 'fulfilled' ? phishTank.value  : []

  const allSignals = [...op, ...ac, ...pt]
  const total = await saveSignals(allSignals)

  return {
    total,
    sources: {
      openphish: op.length,
      abusech:   ac.length,
      phishtank: pt.length,
    },
  }
}

/** Fetch recent signals from DB for AI processing */
export async function getRecentSignals(hours = 48): Promise<any[]> {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000)
  return prisma.scamSignal.findMany({
    where: { createdAt: { gte: since } },
    orderBy: { createdAt: 'desc' },
    take: 200,
  })
}
