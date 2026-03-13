// src/app/api/payments/nowpayments/webhook/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyNOWPaymentsSignature } from '@/lib/nowpayments'

export async function POST(req: NextRequest) {
  try {
    const body      = await req.text()
    const signature = req.headers.get('x-nowpayments-sig') || ''

    if (!verifyNOWPaymentsSignature(body, signature)) {
      console.error('NOWPayments: invalid signature')
      return new Response('Invalid signature', { status: 401 })
    }

    const data = JSON.parse(body)
    const { order_id, payment_status } = data

    if (['finished', 'confirmed', 'partially_paid'].includes(payment_status)) {
      // order_id format: userId-PLAN-timestamp
      const parts  = (order_id as string).split('-')
      const userId = parts[0]
      const plan   = parts[1]

      if (!userId || !plan) {
        console.error('Invalid order_id format:', order_id)
        return new Response('Bad order_id', { status: 400 })
      }

      const payment = await prisma.payment.findFirst({
        where: { userId, plan, status: 'PENDING', provider: 'NOWPAYMENTS' },
        orderBy: { createdAt: 'desc' },
      })

      if (payment) {
        await prisma.$transaction([
          prisma.payment.update({ where: { id: payment.id }, data: { status: 'COMPLETED' } }),
          prisma.user.update({ where: { id: userId }, data: { plan } }),
          prisma.subscription.create({
            data: {
              userId,
              plan,
              provider:   'NOWPAYMENTS',
              externalId: data.payment_id?.toString(),
              amount:     payment.amount,
              endDate:    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
          }),
        ])
        console.log(`✅ NOWPayments: upgraded ${userId} to ${plan}`)
      }
    }

    return new Response('OK', { status: 200 })
  } catch (e) {
    console.error('NOWPayments webhook error:', e)
    return new Response('Error', { status: 500 })
  }
}
