import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { ok, err } from '@/lib/response'
import { callAI } from '@/lib/ai'

export async function POST(req: NextRequest) {
  try {
    requireAuth(req)
    const { type, topic, tone, audience, keywords } = await req.json()
    if (!topic?.trim()) return err('Topic is required')

    const kw = keywords?.trim() ? `\n\nKeywords to include naturally: ${keywords}` : ''
    const aud = audience?.trim() ? `\nTarget audience: ${audience}` : ''

    const systemPrompt = `You are a world-class copywriter, content strategist, and SEO expert. 
Your writing is:
- Unique, original, and never generic
- Packed with value, personality, and hooks that stop scrolling
- Formatted beautifully with clear sections using emojis as visual headers
- Optimized for the specific platform and goal
- Conversion-focused while feeling completely natural

Always write content that makes the reader feel understood and excited.`

    const guides: Record<string, string> = {
      blog: `Write a full, SEO-optimized blog post (800-1000 words) on: "${topic}"
Tone: ${tone || 'professional'}${aud}${kw}

Structure it EXACTLY like:
📌 HEADLINE
[Compelling, click-worthy headline + 2 alternatives]

🪝 OPENING HOOK (100 words)
[Pattern-interrupt opening that grabs attention immediately]

📖 INTRODUCTION (100 words)
[Set context, establish credibility, create curiosity]

💡 SECTION 1: [Title]
[200-250 words with subpoints]

💡 SECTION 2: [Title]  
[200-250 words with subpoints]

💡 SECTION 3: [Title]
[200-250 words with subpoints]

🔑 KEY TAKEAWAYS
• [Takeaway 1]
• [Takeaway 2]
• [Takeaway 3]

🎯 CONCLUSION + CTA (100 words)
[Strong conclusion with clear call-to-action]`,

      marketing: `Write high-converting marketing copy for: "${topic}"
Tone: ${tone || 'persuasive'}${aud}${kw}

Deliver ALL of these:

🎯 HEADLINE (5 options)
1. [Headline]
2. [Headline]
3. [Headline]
4. [Headline]
5. [Headline]

📱 FACEBOOK/INSTAGRAM AD
[Hook line]
[Body copy — 3 paragraphs]
[CTA]

🔍 GOOGLE SEARCH ADS (2)
Headline 1: | Headline 2: | Headline 3:
Description: 

💼 LINKEDIN AD
[Professional copy with stat-backed credibility]

📱 SHORT-FORM AD (TikTok/Reels)
[Ultra-punchy 3-line script]`,

      product: `Write compelling product descriptions for: "${topic}"
Tone: ${tone || 'persuasive'}${aud}${kw}

Deliver:

🛍️ SHORT DESCRIPTION (60 words)
[Benefit-led, scannable, conversion-optimized]

📦 FULL PRODUCT PAGE COPY
[Headline]
[Subheadline]
[Opening paragraph — hook + promise]

✨ KEY BENEFITS (5)
• [Benefit] — [Why it matters]
• [Benefit] — [Why it matters]
• [Benefit] — [Why it matters]
• [Benefit] — [Why it matters]
• [Benefit] — [Why it matters]

📝 FEATURES → BENEFITS TABLE
Feature: [X] → You get: [Y]
(5 rows)

💬 CUSTOMER TESTIMONIAL TEMPLATE
"[Realistic testimonial]" — [Name, Job Title]

🎯 CTA VARIATIONS (3)
[CTA 1] | [CTA 2] | [CTA 3]`,

      social: `Create a complete social media content pack for: "${topic}"
Tone: ${tone || 'engaging'}${aud}${kw}

Deliver posts for ALL 5 platforms:

📸 INSTAGRAM POST
[Caption with storytelling hook + emojis]
[Hashtags — 25 optimized tags]

🐦 TWITTER/X THREAD (5 tweets)
Tweet 1: [Hook tweet]
Tweet 2: [Point 1]
Tweet 3: [Point 2]
Tweet 4: [Point 3]
Tweet 5: [CTA tweet]

💼 LINKEDIN POST
[Professional, value-packed post — 200 words]

📘 FACEBOOK POST
[Community-style engaging post with question]

🎵 TIKTOK/REELS CAPTION
[Short punchy caption + trending hooks + hashtags]`,

      email: `Write a complete 5-email welcome/nurture sequence for: "${topic}"
Tone: ${tone || 'friendly'}${aud}${kw}

For EACH email provide:
📧 EMAIL [Number]: [Title]
Subject Line: [Subject] | Preview: [Preview text]
[Full email body — 200-300 words]
CTA: [Button text]
---

Make each email feel like a personal message from a friend, not corporate spam.
Emails: Welcome → Value → Story/Proof → Objection Handler → Strong CTA`,
    }

    const prompt = guides[type] || guides.blog
    const result = await callAI(prompt, systemPrompt)
    return ok({ content: result })
  } catch (e: any) {
    return err(e.message || 'Content generation failed')
  }
}
