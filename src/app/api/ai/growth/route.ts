import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { ok, err } from '@/lib/response'
import { callAI, parseJSON } from '@/lib/ai'

export async function POST(req: NextRequest) {
  try {
    requireAuth(req)
    const { type, goals = '', name = 'User' } = await req.json()

    const today = new Date().toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })

    const prompts: Record<string, string> = {
      planner: `Create a daily productivity plan for ${today}. User name: ${name}. Goals: "${goals}". Include: morning routine (3 items), top 3 priorities for today, time blocks (hourly from 8am-6pm), evening review checklist, motivational quote. Format as JSON with: morningRoutine (array), priorities (array of 3), timeBlocks (array of {time, task}), eveningChecklist (array), quote (string). Respond ONLY with valid JSON.`,
      motivation: `Generate an extremely powerful, personalized motivational message for ${name}. Their goals: "${goals}". Today: ${today}. Make it: energizing, specific, action-oriented, about 150 words. Include a powerful quote, why they should push today, and one specific action to take RIGHT NOW.`,
      lesson: `Create a micro-learning lesson (5 minutes) on a business/productivity topic related to "${goals || 'entrepreneurship'}". Include: topic title, key concept (2-3 sentences), 3 actionable takeaways, quick exercise to apply it now, further reading suggestion. Make it immediately actionable.`,
      habits: `Generate a 30-day habit building plan for "${goals || 'productivity and success'}". Create 5 daily habits. For each habit: name, description, why it matters, daily action (under 5 minutes), tracking method. Format as JSON array with fields: name, description, why, dailyAction, tracking. Respond ONLY with valid JSON array.`,
    }

    const result = await callAI(prompts[type] || prompts.motivation)
    if (type === 'planner' || type === 'habits') {
      const parsed = parseJSON(result)
      return ok({ result: parsed || result, raw: result })
    }
    return ok({ result })
  } catch (e: any) { return err(e.message) }
}
