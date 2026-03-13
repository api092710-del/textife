'use client'
// src/hooks/useAuth.ts
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

export interface AuthUser {
  id: string
  fullName: string
  username: string
  email: string
  role: string
  plan: string
  createdAt: string
}

export function useAuth(redirectIfUnauthenticated = true) {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('No token')

      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) throw new Error('Unauthorized')

      const data = await res.json()
      setUser(data.user)
      // Update local storage with fresh data
      localStorage.setItem('user', JSON.stringify(data.user))
    } catch {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      if (redirectIfUnauthenticated) router.replace('/auth/login')
    } finally {
      setLoading(false)
    }
  }, [router, redirectIfUnauthenticated])

  useEffect(() => { fetchUser() }, [fetchUser])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/')
  }, [router])

  const refreshUser = () => fetchUser()

  return { user, loading, logout, refreshUser }
}

export function getToken() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token')
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getToken()
  const res = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...((options.headers as Record<string, string>) || {}),
    },
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}
