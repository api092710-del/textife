import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { ok, err } from '@/lib/response'

export async function GET(req: NextRequest) {
  try {
    const user = requireAuth(req)
    const referralCode = Buffer.from(user.userId).toString('base64').slice(0, 10).toUpperCase()
    return ok({
      referralCode,
      referralLink: `${process.env.NEXT_PUBLIC_APP_URL}/auth/register?ref=${referralCode}`,
      referrals: 0,
      earnings: 0
    })
  } catch (e: any) { return err(e.message, e.status) }
}
