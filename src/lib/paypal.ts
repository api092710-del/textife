// src/lib/paypal.ts
// Full PayPal Orders API v2 integration

const BASE_URL = process.env.PAYPAL_MODE === 'live'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com'

async function getAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID
  const secret   = process.env.PAYPAL_SECRET

  if (!clientId || !secret) throw new Error('PayPal credentials not configured')

  const res = await fetch(`${BASE_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${clientId}:${secret}`).toString('base64')}`,
    },
    body: 'grant_type=client_credentials',
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`PayPal auth failed: ${text}`)
  }

  const data = await res.json()
  return data.access_token
}

export async function createPayPalOrder(plan: string, amount: number, returnBaseUrl: string) {
  const token = await getAccessToken()

  const res = await fetch(`${BASE_URL}/v2/checkout/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [{
        reference_id: plan,
        amount: { currency_code: 'USD', value: amount.toFixed(2) },
        description: `Trendygene ${plan} Plan - Monthly Subscription`,
      }],
      application_context: {
        brand_name: 'Trendygene',
        return_url: `${returnBaseUrl}/api/payments/paypal/success`,
        cancel_url:  `${returnBaseUrl}/dashboard/billing?cancelled=1`,
        user_action: 'PAY_NOW',
      },
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`PayPal order creation failed: ${text}`)
  }

  const order = await res.json()
  const approvalUrl = order.links?.find((l: any) => l.rel === 'approve')?.href
  if (!approvalUrl) throw new Error('No PayPal approval URL returned')

  return { orderId: order.id, approvalUrl }
}

export async function capturePayPalOrder(orderId: string) {
  const token = await getAccessToken()

  const res = await fetch(`${BASE_URL}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`PayPal capture failed: ${text}`)
  }

  const data = await res.json()
  return { status: data.status, orderId: data.id }
}
