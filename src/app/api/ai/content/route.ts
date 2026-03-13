import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { ok, err } from '@/lib/response'
import { callAI } from '@/lib/ai'

export async function POST(req: NextRequest) {
  try {
    requireAuth(req)
    const { type, topic, tone, audience } = await req.json()
    const typeGuide: Record<string, string> = {
      'social-post': 'Write 3 variations of a social media post. Each should be scroll-stopping, include emojis strategically, and end with a call-to-action. Provide versions for LinkedIn, Instagram, and Twitter/X.',
      'blog-intro': 'Write a compelling blog post introduction (200-300 words) that hooks the reader immediately, establishes credibility, and creates curiosity to read more. Use a pattern-interrupt opening.',
      'email': 'Write a full marketing email with: subject line (5 options), preview text, personalized opening, value-packed body, social proof element, and a clear CTA. Make it feel human.',
      'ad-copy': 'Write 5 ad copy variations: 2 Facebook/Instagram ads, 2 Google search ads, and 1 headline + subheadline combo. Focus on benefits over features and include specific numbers.',
      'caption': 'Write 5 engaging social media captions with relevant hashtags. Each caption should tell a mini-story, provide value, or spark conversation. Include emojis naturally.',
    }
    const guide = typeGuide[type] || 'Create compelling, original content that provides real value:'
    const prompt = `You are a world-class copywriter and content strategist. ${guide}

Topic/Product: ${topic || 'general'}
Tone: ${tone || 'engaging and conversational'}
Target Audience: ${audience || 'general audience'}

Make the content unique, memorable, and conversion-focused. Avoid clichés.`
    const result = await callAI(prompt)
    return ok({ result })
  } catch (e: any) { return err(e.message) }
}
