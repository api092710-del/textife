import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { ok, err } from '@/lib/response'
import { callAI, parseJSON } from '@/lib/ai'

export async function POST(req: NextRequest) {
  try {
    requireAuth(req)
    const { type = 'daily', skills = '', timeAvailable = '2 hours' } = await req.json()

    const prompts: Record<string, string> = {
      daily: `Generate 6 ways to make money TODAY with "${timeAvailable}" available and skills: "${skills || 'none specified'}". For each: title, description (1-2 sentences), potentialEarning (today $ range), platform (where to do it), steps (array of 3 quick actions), category ("Freelance"/"Digital"/"Local"/"Online"). Respond ONLY with valid JSON array.`,
      freelance: `Generate 6 freelance gig ideas for someone with skills "${skills || 'general'}". For each: title, description, potentialEarning (per project/hour), platform (Upwork/Fiverr/etc), steps (array of 3), category. Respond ONLY with valid JSON array.`,
      digital: `Generate 6 digital product ideas to create and sell. For each: title, description, potentialEarning (monthly passive), platform (Gumroad/Etsy/etc), steps (array of 3 to create it), category. Respond ONLY with valid JSON array.`,
      strategy: `Generate 6 AI-powered income strategies for 2025. For each: title, description, potentialEarning (monthly), platform, steps (array of 3), category. Respond ONLY with valid JSON array.`,
    }

    const text = await callAI(prompts[type] || prompts.daily)
    const ideas = parseJSON(text) || []
    return ok({ ideas })
  } catch (e: any) { return err(e.message) }
}
