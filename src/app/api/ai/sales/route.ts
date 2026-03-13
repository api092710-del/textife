import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { ok, err } from '@/lib/response'
import { callAI } from '@/lib/ai'

export async function POST(req: NextRequest) {
  try {
    requireAuth(req)
    const { type, product = '', context = '', customerName = 'the customer', tone = 'friendly' } = await req.json()

    const prompts: Record<string, string> = {
      sales: `Write a highly persuasive sales message for "${product}". Customer name: ${customerName}. Context: ${context}. Tone: ${tone}. Include: personalized opener, pain point, solution (your product), 3 key benefits, urgency/scarcity element, clear CTA. Keep it concise but compelling. Format for WhatsApp/SMS.`,
      reply: `Write a professional customer reply message. Product/service: "${product}". Customer situation: "${context}". Tone: ${tone}. Address their concern empathetically, provide value, maintain relationship, and guide toward desired action.`,
      followup: `Write a follow-up message sequence (3 messages) for "${product}". Context: "${context}". Customer name: ${customerName}. Make each progressively more urgent. Day 1: value reminder. Day 3: social proof + urgency. Day 7: final offer. Format clearly labeled.`,
      cold: `Write a cold outreach message for "${product}". Target: ${customerName}. Context: "${context}". Make it: personalized, not salesy, curiosity-driven, short (under 100 words), clear ask. Include subject line if email.`,
      negotiate: `Write a negotiation response message. Situation: "${context}". Product: "${product}". Tone: ${tone}. Be firm but flexible, acknowledge their position, counter-offer professionally, maintain relationship.`,
    }

    const message = await callAI(prompts[type] || prompts.sales)
    return ok({ message })
  } catch (e: any) { return err(e.message) }
}
