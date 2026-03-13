import { NextRequest } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { ok, err } from '@/lib/response'
import { callAI } from '@/lib/ai'

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) return err('Unauthorized', 401)

    const isPro = user.plan === 'PRO' || user.plan === 'BUSINESS'
    const count = isPro ? 5 : 2

    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

    const prompt = `Today is ${today}. You are a cybersecurity expert and financial fraud analyst. Generate ${count} REAL, CURRENT, highly specific digital security alerts combining: the latest scam tactics, hacking methods, phishing attacks, social engineering, crypto fraud, WhatsApp/SMS scams, AI voice cloning fraud, and digital safety issues affecting regular people in 2024-2025.

Each alert must feel urgent, real, and credible. Base them on ACTUAL known attack patterns (OTP scams, deepfake calls, QR phishing, SIM swapping, job scams, romance scams, etc).

Return ONLY valid JSON — no markdown, no explanation, no backticks:
{
  "alerts": [
    {
      "id": "unique-id-1",
      "type": "SCAM" or "HACK" or "PHISHING" or "FRAUD" or "WARNING",
      "severity": "CRITICAL" or "HIGH" or "MEDIUM",
      "title": "Alert title (max 10 words, urgent)",
      "summary": "2-sentence brief — what it is and who is being targeted right now",
      "description": "3-4 sentences — how the attack works, red flags, real-world examples of victims",
      "howToProtect": ["Action 1", "Action 2", "Action 3"],
      "affectedPlatforms": ["WhatsApp", "Instagram"],
      "region": "Global" or specific region,
      "trend": "RISING" or "ACTIVE" or "NEW",
      "emoji": "relevant emoji"
    }
  ],
  "generatedAt": "${new Date().toISOString()}",
  "tip": "One powerful daily security tip (actionable, specific)"
}`

    const raw = await callAI(prompt)
    let data: any = null

    // Try clean JSON parse
    try {
      const cleaned = raw.replace(/```json|```/g, '').trim()
      data = JSON.parse(cleaned)
    } catch {
      // Try extracting JSON from response
      const match = raw.match(/\{[\s\S]*\}/)
      if (match) {
        try { data = JSON.parse(match[0]) } catch {}
      }
    }

    if (!data?.alerts) {
      // Fallback with real known patterns
      data = {
        alerts: [
          {
            id: 'otp-scam-2025',
            type: 'SCAM',
            severity: 'CRITICAL',
            title: 'OTP Bypass Scam Drains Bank Accounts in Minutes',
            summary: 'Fraudsters call pretending to be bank security staff and trick victims into sharing one-time passwords. Over 12,000 people lost money to this exact method in Q1 2025.',
            description: 'The caller knows your name, last 4 digits of your card, and recent transaction — data bought from dark web leaks. They create urgency ("your account is being hacked right now") and ask for the OTP "to stop the transfer." The moment you share it, they drain your account. Victims report losing between $500 and $45,000 in a single call.',
            howToProtect: ['Banks NEVER ask for OTPs on a call — hang up immediately', 'Call your bank back directly using the number on their website', 'Enable transaction alerts via SMS so you see every movement'],
            affectedPlatforms: ['Banking Apps', 'SMS'],
            region: 'Global',
            trend: 'RISING',
            emoji: '🏦'
          },
          {
            id: 'ai-voice-clone',
            type: 'FRAUD',
            severity: 'HIGH',
            title: 'AI Voice Cloning Used to Scam Families Out of Thousands',
            summary: 'Scammers clone a family member\'s voice using 3-second audio clips from social media and call relatives claiming to be in an emergency. This "virtual kidnapping" scam is surging globally.',
            description: 'With just a short video or voice note from Instagram or TikTok, AI tools can clone anyone\'s voice perfectly. The scammer calls a parent saying "Mom I\'m in trouble, I need money NOW — don\'t tell anyone." The realistic voice causes panic and bypasses rational thinking. Families have wired $2,000–$50,000 before verifying.',
            howToProtect: ['Create a family code word that only real family members know', 'Always hang up and call back on the known number directly', 'Limit voice content on public social media profiles'],
            affectedPlatforms: ['Phone', 'WhatsApp'],
            region: 'Global',
            trend: 'NEW',
            emoji: '🤖'
          }
        ],
        generatedAt: new Date().toISOString(),
        tip: 'Enable two-factor authentication on every account you own today — it blocks 99.9% of automated attacks instantly.'
      }
    }

    return ok({ ...data, isPro, plan: user.plan })
  } catch (e: any) {
    return err(e.message)
  }
}
