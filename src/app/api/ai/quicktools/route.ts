import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { ok, err } from '@/lib/response'
import { callAI } from '@/lib/ai'

export async function POST(req: NextRequest) {
  try {
    requireAuth(req)
    const { tool, input, options = {} } = await req.json()

    const prompts: Record<string, string> = {
      summarize: `Summarize the following text in 3-5 bullet points. Make each point concise and impactful:\n\n${input}`,
      rewrite: `Rewrite the following content to be more ${options.style || 'professional'} and engaging. Improve clarity and flow:\n\n${input}`,
      ideas: `Generate 8 creative ideas related to: "${input}". Make each idea specific, actionable, and unique. Number them clearly.`,
      translate: `Translate the following text to ${options.language || 'Arabic'}. Maintain the tone and formatting:\n\n${input}`,
      explain: `Explain the following concept in simple terms (as if explaining to a 10-year-old), then provide a more detailed explanation for professionals:\n\n${input}`,
      actionplan: `Create a detailed action plan for: "${input}". Include: Goal statement, 5 phases with specific tasks, timeline estimate, resources needed, success metrics. Make it immediately actionable.`,
      hashtags: `Generate 30 relevant hashtags for: "${input}". Mix: 10 high-volume (1M+), 10 medium (100k-1M), 10 niche (<100k). Group them by category.`,
      headline: `Generate 10 attention-grabbing headlines/titles for: "${input}". Mix different styles: curiosity, numbers, how-to, benefit-driven, controversy. Make each one click-worthy.`,
    }

    const result = await callAI(prompts[tool] || `Help with: ${input}`)
    return ok({ result })
  } catch (e: any) { return err(e.message) }
}
