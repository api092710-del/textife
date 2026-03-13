export async function callAI(prompt: string, systemPrompt?: string): Promise<string> {
  const messages: any[] = []
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt })
  }
  messages.push({ role: 'user', content: prompt })

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      max_tokens: 2000,
      temperature: 0.8,
      messages,
    })
  })

  const data = await response.json()
  if (!response.ok) throw new Error(data.error?.message || 'AI request failed')
  return data.choices?.[0]?.message?.content?.trim() || ''
}

export function parseJSON(text: string): any {
  const clean = text.replace(/```json|```/g, '').trim()
  try { return JSON.parse(clean) } catch { return null }
}
