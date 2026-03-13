// src/app/api/payments/create/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { ok, err, handleError, PRICES } from '@/lib/response'
import { createPayPalOrder } from '@/lib/paypal'
import { createCryptoInvoice } from '@/lib/nowpayments'

export async function POST(req: NextRequest) {
  try {
    const auth = requireAuth(req)
    const { plan, provider } = await req.json()

    if (!['PRO', 'BUSINESS'].includes(plan))          return err('Invalid plan', 400)
    if (!['PAYPAL', 'NOWPAYMENTS'].includes(provider)) return err('Invalid payment provider', 400)

    const price  = PRICES[plan as keyof typeof PRICES].usd
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // Create pending payment record
    const payment = await prisma.payment.create({
      data: { userId: auth.userId, provider, amount: price, plan, status: 'PENDING' },
    })

    if (provider === 'PAYPAL') {
      const { orderId, approvalUrl } = await createPayPalOrder(plan, price, appUrl)
      await prisma.payment.update({ where: { id: payment.id }, data: { externalId: orderId } })
      return ok({ approvalUrl, paymentId: payment.id })
    } else {
      const { invoiceId, invoiceUrl, orderId } = await createCryptoInvoice({ amount: price, plan, userId: auth.userId, returnBaseUrl: appUrl })
      await prisma.payment.update({ where: { id: payment.id }, data: { externalId: invoiceId, metadata: orderId } })
      return ok({ paymentUrl: invoiceUrl, paymentId: payment.id })
    }
  } catch (e) {
    return handleError(e)
  }
}
