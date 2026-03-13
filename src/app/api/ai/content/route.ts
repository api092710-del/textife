import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { ok, err } from '@/lib/response'
import { callAI } from '@/lib/ai'

export async function POST(req: NextRequest) {
  try {
    requireAuth(req)
    const { type, topic, tone = 'professional', audience = 'general', keywords = '' } = await req.json()

    const prompts: Record<string, string> = {
      blog: `Write a complete blog post about "${topic}". Tone: ${tone}. Target audience: ${audience}. Include: catchy title, intro paragraph, 3-4 main sections with headers, conclusion with CTA. Keywords to include: ${keywords}. Make it engaging and SEO-friendly. About 500 words.`,
      marketing: `Write compelling marketing copy for "${topic}". Tone: ${tone}. Audience: ${audience}. Include: headline, subheadline, 3 benefit bullets, social proof placeholder, call to action. Make it persuasive and conversion-focused.`,
      product: `Write a persuasive product description for "${topic}". Include: compelling headline, key features (3-5 bullets), benefits, who it's for, call to action. Tone: ${tone}. Make it SEO-friendly with keywords: ${keywords}.`,
      social: `Generate 5 social media captions for "${topic}". Platform-optimized. Tone: ${tone}. Include: Instagram caption with hashtags, Twitter/X post, LinkedIn post, Facebook post, TikTok hook. Make them engaging and shareable.`,
      email: `Write a complete email marketing campaign for "${topic}". Include: subject line (3 options), preview text, greeting, body (personalized, value-driven), CTA button text, PS line. Tone: ${tone}. Audience: ${audience}.`,
    }

    const content = await callAI(prompts[type] || prompts.blog)
    return ok({ content })
  } catch (e: any) { return err(e.message) }
}
