import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { ok, err } from '@/lib/response'
import { callAI } from '@/lib/ai'

export async function POST(req: NextRequest) {
  try {
    requireAuth(req)
    const { tool, input, options = {} } = await req.json()
    if (!tool || !input?.trim()) return err('Tool and input are required')

    let systemPrompt = ''
    let userPrompt   = ''

    switch (tool) {

      case 'summarize':
        systemPrompt = `You are a world-class analyst. Summarize text into sharp, scannable insights.
Format your response EXACTLY like this:
🎯 CORE IDEA
[One powerful sentence capturing the main point]

📌 KEY TAKEAWAYS
• [Insight 1]
• [Insight 2]
• [Insight 3]
• [Insight 4]
• [Insight 5]

💡 BOTTOM LINE
[One memorable sentence — the "so what" of this text]`
        userPrompt = `Summarize this:\n\n${input}`
        break

      case 'rewrite': {
        const style = options.style || 'professional'
        const styleGuides: Record<string,string> = {
          professional: 'polished, formal, business-ready — sounds like a senior executive wrote it',
          casual:       'friendly, conversational, warm — like texting a smart friend',
          persuasive:   'compelling, urgent, action-driving — makes readers want to act NOW',
          simple:       'clear, plain, easy to understand — a 5th grader could grasp it',
          formal:       'highly formal, precise, academic — suitable for official documents',
          witty:        'clever, sharp, with personality — smart humor without trying too hard',
        }
        systemPrompt = `You are an elite ghostwriter. Rewrite text in the requested style. Output ONLY the rewritten version — no preamble, no explanation, no "Here is the rewrite:". Just the rewritten text.`
        userPrompt = `Rewrite this in a ${style} style (${styleGuides[style] || style}):\n\n${input}`
        break
      }

      case 'translate': {
        const lang = options.language || 'English'
        systemPrompt = `You are a professional translator with native fluency. Translate accurately and naturally — preserve tone, register, and nuance. 
Format your response EXACTLY like this:
🌍 TRANSLATION (${lang})
[The translated text]

📝 NOTES
[Any important cultural notes, idiomatic choices, or translator remarks — skip this section if translation is straightforward]`
        userPrompt = `Translate the following text to ${lang}:\n\n${input}`
        break
      }

      case 'ideas': {
        const count = 8
        systemPrompt = `You are a creative strategist and innovation expert. Generate bold, original, actionable ideas.
Format EACH idea exactly like this:
💡 [IDEA NAME]
What: [One sentence description]
Why it works: [One sentence insight]
First step: [Specific action to take today]

Generate exactly ${count} ideas. Number them 1-${count}. Be bold — avoid generic or obvious suggestions.`
        userPrompt = `Generate ${count} creative ideas for: ${input}`
        break
      }

      case 'explain': {
        const level = options.level || 'simple'
        systemPrompt = `You are the world's best teacher — you can explain anything clearly and memorably.
Format your response like:
🎯 SIMPLE ANSWER
[1-2 sentence plain-English explanation]

📖 DEEPER EXPLANATION  
[3-5 sentences with context and detail]

🌍 REAL-WORLD EXAMPLE
[A concrete, relatable example from everyday life]

❓ COMMON MISCONCEPTIONS
[1-2 things people often get wrong about this]`
        userPrompt = `Explain this at a ${level} level: ${input}`
        break
      }

      case 'actionplan': {
        systemPrompt = `You are a world-class strategic planner. Create a clear, actionable plan.
Format your response EXACTLY like:
🎯 GOAL
[Restate the goal clearly]

✅ 30-DAY ROADMAP
Week 1: [Focus + 3 specific actions]
Week 2: [Focus + 3 specific actions]  
Week 3: [Focus + 3 specific actions]
Week 4: [Focus + 3 specific actions]

⚡ TODAY'S FIRST 3 ACTIONS (do these NOW)
1. [Specific action — takes <30 min]
2. [Specific action — takes <30 min]
3. [Specific action — takes <30 min]

🚧 BIGGEST OBSTACLES & HOW TO BEAT THEM
• [Obstacle 1] → [Solution]
• [Obstacle 2] → [Solution]

🏆 HOW TO KNOW YOU'RE WINNING
[3 measurable success signals]`
        userPrompt = `Create a step-by-step action plan for: ${input}`
        break
      }

      case 'hashtags': {
        const platform = options.platform || 'Instagram'
        systemPrompt = `You are a social media expert who creates high-performing hashtag strategies.
Format your response EXACTLY like:
🔥 TOP 10 (Highest Impact)
#tag1 #tag2 #tag3 #tag4 #tag5 #tag6 #tag7 #tag8 #tag9 #tag10

📈 MID-RANGE (Good Reach)
#tag1 #tag2 #tag3 #tag4 #tag5 #tag6 #tag7 #tag8 #tag9 #tag10

🎯 NICHE (Highly Targeted)
#tag1 #tag2 #tag3 #tag4 #tag5 #tag6 #tag7 #tag8 #tag9 #tag10

💡 PRO TIP
[One specific insight about using these hashtags effectively on ${platform}]`
        userPrompt = `Generate 30 optimized hashtags for ${platform} about: ${input}`
        break
      }

      case 'headline': {
        const type = options.type || 'article'
        systemPrompt = `You are a top-tier copywriter and headline specialist. Headlines must stop scrollers dead in their tracks.
Format EXACTLY like:
🔥 CURIOSITY-DRIVEN
1. [Headline]
2. [Headline]
3. [Headline]

⚡ BOLD & DIRECT
4. [Headline]
5. [Headline]
6. [Headline]

❓ QUESTION-BASED
7. [Headline]
8. [Headline]
9. [Headline]

💰 BENEFIT-FOCUSED
10. [Headline]
11. [Headline]
12. [Headline]`
        userPrompt = `Write 12 irresistible ${type} headlines for: ${input}`
        break
      }

      default:
        systemPrompt = 'You are a helpful expert assistant. Provide clear, insightful, well-formatted responses.'
        userPrompt = input
    }

    const result = await callAI(userPrompt, systemPrompt)
    return ok({ result })
  } catch (e: any) {
    return err(e.message || 'Tool failed')
  }
}
