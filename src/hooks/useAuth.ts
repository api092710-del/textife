'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

export function useAuth(redirectIfUnauthenticated = true) {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const fetchUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')

      if (!token) throw new Error('No token')

      const res = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) throw new Error('Unauthorized')

      const data = await res.json()
      setUser(data.user)
    } catch {
      localStorage.removeItem('token')
      localStorage.removeItem('user')

      if (redirectIfUnauthenticated) {
        router.replace('/auth/login')
      }
    } finally {
      setLoading(false)
    }
  }, [router, redirectIfUnauthenticated])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/auth/login')
  }, [router])

  return { user, loading, logout, refreshUser: fetchUser }
}
