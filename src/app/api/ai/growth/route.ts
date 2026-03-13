import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { ok, err } from '@/lib/response'
import { callAI, parseJSON } from '@/lib/ai'

export async function POST(req: NextRequest) {
  try {
    requireAuth(req)
    const { type, goals = '', name = 'there', mood, challenge } = await req.json()
    const today = new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' })

    const systemPrompt = `You are an elite personal growth coach, psychologist, and productivity expert.
You give deeply personalized, realistic, science-backed guidance.
You speak directly to the person — warm, empathetic, actionable.
Never give generic advice. Always be specific, practical, and emotionally intelligent.
Use emojis as visual section headers. Format beautifully.`

    const prompts: Record<string, string> = {
      motivation: `Create a deeply personal, powerful motivational message for ${name}.
Today: ${today}
Their goals: "${goals || 'personal and professional success'}"
Their mood today: "${mood || 'neutral'}"
Current challenge: "${challenge || 'staying focused and motivated'}"

Format EXACTLY like:
🌅 GOOD MORNING, ${name.toUpperCase()}!
[1 powerful opening sentence that speaks directly to their current situation]

💭 YOUR REALITY CHECK
[2-3 sentences that acknowledge their specific challenge with empathy — not toxic positivity, but real talk]

⚡ WHY TODAY MATTERS
[2-3 sentences connecting today specifically to their bigger goal, with specific reasoning]

🎯 YOUR ONE THING TODAY
[The single most important action they can take RIGHT NOW toward their goal — be very specific]

💪 YOUR POWER STATEMENT
[A personalized affirmation based on their goals — not generic, but specific to their situation]

🔥 REMEMBER THIS
[One profound insight from psychology/science that directly applies to their situation]

📊 YOUR PROGRESS PERSPECTIVE
[Put their journey in perspective — how far they've come, what stage they're at, what's realistic]`,

      planner: `Create a detailed, optimized daily plan for ${name} on ${today}.
Their goals: "${goals || 'productivity and personal growth'}"

Format EXACTLY as JSON:
{
  "greeting": "personalized morning greeting",
  "focus_theme": "Today's one-word theme",
  "morning_routine": [
    {"time": "6:00 AM", "task": "task", "why": "reason", "duration": "10 min"},
    {"time": "6:10 AM", "task": "task", "why": "reason", "duration": "5 min"},
    {"time": "6:15 AM", "task": "task", "why": "reason", "duration": "15 min"}
  ],
  "power_hours": [
    {"block": "9:00-11:00 AM", "task": "Deep work block", "type": "deep_work"},
    {"block": "11:00-11:15 AM", "task": "Break", "type": "break"},
    {"block": "11:15-12:30 PM", "task": "Communication", "type": "meetings"},
    {"block": "1:30-3:30 PM", "task": "Creative work", "type": "deep_work"},
    {"block": "4:00-5:00 PM", "task": "Admin & planning", "type": "admin"}
  ],
  "top_3_priorities": [
    {"rank": 1, "task": "most important task", "why": "reason it matters today", "time_estimate": "2 hrs"},
    {"rank": 2, "task": "second priority", "why": "reason", "time_estimate": "1 hr"},
    {"rank": 3, "task": "third priority", "why": "reason", "time_estimate": "30 min"}
  ],
  "energy_tips": ["tip 1", "tip 2", "tip 3"],
  "evening_ritual": ["step 1", "step 2", "step 3"],
  "todays_quote": "Motivational quote relevant to their goals",
  "quote_author": "Author name"
}
Respond ONLY with valid JSON.`,

      lesson: `Create a powerful 5-minute micro-lesson for ${name}.
Their growth goals: "${goals || 'business, productivity, mindset'}"

Format EXACTLY like:
📚 TODAY'S 5-MINUTE LESSON
[Topic title — specific and intriguing]

🎯 THE CORE CONCEPT
[2-3 sentences explaining the concept simply — no jargon]

🧠 THE SCIENCE BEHIND IT
[1-2 sentences with a real psychology/neuroscience/behavioral insight that backs this up]

💡 THE 3 THINGS YOU'LL LEARN
1. [Practical point]
2. [Practical point]
3. [Practical point]

⚡ APPLY IT RIGHT NOW (3 min)
[A specific micro-exercise they can do in the next 3 minutes]

📈 THE COMPOUND EFFECT
[What happens if they apply this consistently for 30 days — be specific with outcomes]

🔗 GO DEEPER
[Recommend one specific book, podcast, or resource — be precise]

💬 REFLECTION QUESTION
[One powerful question to journal about tonight]`,

      habits: `Build a personalized 30-day habit system for ${name}.
Their goal: "${goals || 'daily growth and productivity'}"

Format EXACTLY as JSON:
[
  {
    "name": "Habit Name",
    "emoji": "🏃",
    "category": "Health|Mind|Skills|Relationships|Finance",
    "why": "Specific reason this habit will transform their life for their stated goal",
    "science": "The psychological/neuroscience principle that makes this work",
    "daily_action": "Exact action — specific, takes under 5 minutes",
    "trigger": "Do this immediately AFTER [existing habit] to chain it",
    "tracking": "How to measure success each day",
    "week1": "What to expect in week 1",
    "week4": "What to expect by week 4",
    "pitfall": "The #1 reason people fail at this + how to avoid it"
  }
]
Create 5 habits. Respond ONLY with valid JSON array.`,

      challenge: `Create a personalized growth challenge for ${name}.
Their challenge: "${challenge || goals || 'procrastination and focus'}"

Format EXACTLY like:
🧠 UNDERSTANDING YOUR CHALLENGE
[Explain their challenge with empathy — what's really happening psychologically]

🔍 ROOT CAUSE ANALYSIS
[The 3 likely root causes of this specific challenge — be insightful, not obvious]

🛠️ YOUR 5-TOOL TOOLKIT
1️⃣ [Tool/technique name]: [Exact instructions to implement today]
2️⃣ [Tool/technique name]: [Exact instructions]
3️⃣ [Tool/technique name]: [Exact instructions]
4️⃣ [Tool/technique name]: [Exact instructions]
5️⃣ [Tool/technique name]: [Exact instructions]

⏱️ THIS WEEK'S GAME PLAN
Day 1-2: [Specific focus]
Day 3-4: [Specific focus]
Day 5-7: [Specific focus]

📊 HOW TO MEASURE PROGRESS
[3 specific metrics to track this week]

🔑 THE MINDSET SHIFT
[The one mental reframe that changes everything about this challenge]`,
    }

    const result = await callAI(prompts[type] || prompts.motivation, systemPrompt)

    if (type === 'planner' || type === 'habits') {
      const parsed = parseJSON(result)
      return ok({ result: parsed || result, raw: result, type })
    }
    return ok({ result, type })
  } catch (e: any) {
    return err(e.message || 'Growth content failed')
  }
}
