import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { ok, err } from '@/lib/response'
import { callAI } from '@/lib/ai'

export async function POST(req: NextRequest) {
  try {
    requireAuth(req)
    const { niche, budget, experience } = await req.json()
    const prompt = `You are an expert business strategist and serial entrepreneur. Generate 5 highly specific, actionable business ideas for someone with these details:
- Niche/Interest: ${niche || 'general'}
- Budget: ${budget || 'low/no budget'}  
- Experience level: ${experience || 'beginner'}

For each idea provide:
1. 💡 **Idea Name** — Catchy and memorable
2. 📋 **What It Is** — Clear 2-sentence description
3. 🎯 **Why It Works Now** — Market timing and opportunity
4. ⚡ **How to Start This Week** — 3 concrete first steps
5. 💰 **Revenue Potential** — Realistic earning range (monthly)
6. 🔥 **Unfair Advantage** — Why YOU could win at this

Make each idea unique, specific, and genuinely actionable. Avoid vague suggestions.`
    const result = await callAI(prompt)
    return ok({ result })
  } catch (e: any) { return err(e.message) }
}
