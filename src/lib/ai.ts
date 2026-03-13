export async function callAI(prompt: string, systemPrompt?: string): Promise<string> {
  const messages: any[] = []
  if (systemPrompt) messages.push({ role: 'user', content: systemPrompt })
  messages.push({ role: 'user', content: prompt })

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }]
    })
  })

  const data = await response.json()
  if (!response.ok) throw new Error(data.error?.message || 'AI request failed')
  return data.content?.[0]?.text || ''
}

export function parseJSON(text: string): any {
  const clean = text.replace(/```json|```/g, '').trim()
  try { return JSON.parse(clean) } catch { return null }
}
