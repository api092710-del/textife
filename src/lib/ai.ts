export async function callAI(prompt: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }]
    })
  })

  const data = await response.json()
  if (!response.ok) throw new Error(data.error?.message || 'AI request failed')
  return data.choices?.[0]?.message?.content || ''
}

export function parseJSON(text: string): any {
  const clean = text.replace(/```json|```/g, '').trim()
  try { return JSON.parse(clean) } catch { return null }
}
