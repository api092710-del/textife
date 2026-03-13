import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { ok, err } from '@/lib/response'
import { callAI } from '@/lib/ai'

export async function POST(req: NextRequest) {
  try {
    requireAuth(req)
    const { prompt, variables = {} } = await req.json()
    if (!prompt) return err('Prompt is required')
    let finalPrompt = prompt
    // Replace ALL occurrences of each variable (not just first)
    Object.keys(variables).forEach(k => {
      finalPrompt = finalPrompt.split(`{${k}}`).join(variables[k] || `[${k}]`)
    })
    const result = await callAI(
      `You are an expert AI assistant. Provide a detailed, unique, well-structured, and highly actionable response. Use clear sections and bullet points where helpful. Be specific, not generic.\n\n${finalPrompt}`
    )
    return ok({ result })
  } catch (e: any) { return err(e.message) }
}
