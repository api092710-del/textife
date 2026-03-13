// src/lib/nowpayments.ts
// NOWPayments API integration for crypto payments
import { createHmac } from 'crypto'

const BASE_URL = 'https://api.nowpayments.io/v1'

export async function createCryptoInvoice(params: {
  amount: number
  plan: string
  userId: string
  returnBaseUrl: string
}) {
  const apiKey = process.env.NOWPAYMENTS_API_KEY
  if (!apiKey) throw new Error('NOWPayments API key not configured')

  const orderId = `${params.userId}-${params.plan}-${Date.now()}`

  const res = await fetch(`${BASE_URL}/invoice`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
    },
    body: JSON.stringify({
      price_amount: params.amount,
      price_currency: 'usd',
      order_id: orderId,
      order_description: `Trendygene ${params.plan} Plan`,
      ipn_callback_url: `${params.returnBaseUrl}/api/payments/nowpayments/webhook`,
      success_url: `${params.returnBaseUrl}/dashboard?upgraded=1`,
      cancel_url:  `${params.returnBaseUrl}/dashboard/billing?cancelled=1`,
      is_fixed_rate: true,
      is_fee_paid_by_user: false,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`NOWPayments invoice failed: ${text}`)
  }

  const data = await res.json()
  return {
    invoiceId: data.id,
    invoiceUrl: data.invoice_url,
    orderId,
  }
}

export function verifyNOWPaymentsSignature(body: string, signature: string): boolean {
  const secret = process.env.NOWPAYMENTS_IPN_SECRET
  if (!secret) return true // Skip verification if not configured (dev mode)

  const hmac = createHmac('sha512', secret)
  // NOWPayments requires sorted JSON keys
  try {
    const sorted = JSON.stringify(JSON.parse(body), Object.keys(JSON.parse(body)).sort())
    hmac.update(sorted)
    return hmac.digest('hex') === signature
  } catch {
    return false
  }
}
