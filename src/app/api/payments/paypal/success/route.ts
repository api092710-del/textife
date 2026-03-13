// src/app/api/payments/paypal/success/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { capturePayPalOrder } from '@/lib/paypal'

export async function GET(req: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token') // PayPal order ID

    if (!token) return Response.redirect(`${appUrl}/dashboard/billing?error=missing_token`)

    const payment = await prisma.payment.findFirst({ where: { externalId: token, status: 'PENDING' } })
    if (!payment) return Response.redirect(`${appUrl}/dashboard/billing?error=payment_not_found`)

    // Capture payment from PayPal
    const { status } = await capturePayPalOrder(token)

    if (status === 'COMPLETED') {
      // Mark payment complete & upgrade user plan
      await prisma.$transaction([
        prisma.payment.update({ where: { id: payment.id }, data: { status: 'COMPLETED' } }),
        prisma.user.update({ where: { id: payment.userId }, data: { plan: payment.plan } }),
        prisma.subscription.create({
          data: {
            userId:     payment.userId,
            plan:       payment.plan,
            provider:   'PAYPAL',
            externalId: token,
            amount:     payment.amount,
            endDate:    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        }),
      ])
      return Response.redirect(`${appUrl}/dashboard?upgraded=1&plan=${payment.plan.toLowerCase()}`)
    }

    return Response.redirect(`${appUrl}/dashboard/billing?error=capture_failed`)
  } catch (e) {
    console.error('PayPal success error:', e)
    return Response.redirect(`${appUrl}/dashboard/billing?error=1`)
  }
}
