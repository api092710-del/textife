import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { ok, err } from '@/lib/response'
import { callAI } from '@/lib/ai'

const TOOL_PROMPTS: Record<string, string> = {
  summarize: 'Create a sharp, insightful summary of the following text. Use clear bullet points for key takeaways and end with one powerful "Bottom Line" sentence. Be concise but capture every important insight:\n\n',
  ideas: 'Generate 10 creative, actionable, and unique ideas about the following topic. For each idea: give it an exciting name, explain it in 1 sentence, and add one "why this works" insight. Be bold and original — avoid generic suggestions:\n\n',
  rewrite: 'Rewrite the following text to be more compelling, clear, and persuasive while keeping the same meaning. Improve the flow, word choice, and impact. Show the rewrite only, no explanation:\n\n',
  translate: 'Translate the following text accurately and naturally. Preserve the tone and style. If no target language is specified, translate to English:\n\n',
  expand: 'Expand the following text into a more detailed, thorough version with rich examples, context, and insights. Keep it well-structured:\n\n',
  tone: 'Rewrite the following text in a professional, polished tone suitable for business communication. Keep the core message but elevate the language:\n\n',
}

export async function POST(req: NextRequest) {
  try {
    requireAuth(req)
    const { tool, input } = await req.json()
    if (!tool || !input) return err('Tool and input required')
    const promptPrefix = TOOL_PROMPTS[tool] || 'Process the following text helpfully and insightfully:\n\n'
    const result = await callAI(promptPrefix + input)
    return ok({ result })
  } catch (e: any) { return err(e.message) }
}
