import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { ok, err } from '@/lib/response'
import { callAI } from '@/lib/ai'

export async function POST(req: NextRequest) {
  try {
    requireAuth(req)
    const { prompt, variables = {} } = await req.json()
    let finalPrompt = prompt
    Object.keys(variables).forEach(k => { finalPrompt = finalPrompt.replace(`{${k}}`, variables[k]) })
    const result = await callAI(finalPrompt)
    return ok({ result })
  } catch (e: any) { return err(e.message) }
}
