import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { ok, err } from '@/lib/response'
import { callAI, parseJSON } from '@/lib/ai'

export async function POST(req: NextRequest) {
  try {
    requireAuth(req)
    const { type = 'startup', niche = 'general', budget = 'low', skills = 'general' } = await req.json()

    const prompts: Record<string, string> = {
      startup: `Generate 5 innovative startup ideas. Skills: "${skills}", Budget: "${budget}", Niche: "${niche}". For each include: name, description (2 sentences), earning (monthly $ estimate as string like "$2,000-$5,000"), timeToRevenue (e.g. "3-6 months"), steps (array of 3 action steps), difficulty ("Easy"/"Medium"/"Hard"). Respond ONLY with a valid JSON array.`,
      sidehustle: `Generate 5 profitable side hustle ideas for niche "${niche}" startable with "${budget}" budget. For each: name, description, earning (monthly $ range), hoursPerWeek (number), steps (array of 3), difficulty. Respond ONLY with valid JSON array.`,
      online: `Generate 5 online business models for niche "${niche}". For each: name, description, earning (monthly $), startupCost ($ amount), steps (array of 3 action steps), difficulty. Respond ONLY with valid JSON array.`,
    }

    const text = await callAI(prompts[type] || prompts.startup)
    const ideas = parseJSON(text) || []
    return ok({ ideas })
  } catch (e: any) { return err(e.message) }
}
