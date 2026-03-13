'use client'
import { useState, useEffect } from 'react'

export function useDarkMode() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('darkMode') === 'true'
    setDark(saved)
    document.documentElement.classList.toggle('dark', saved)
  }, [])

  const toggle = () => {
    const next = !dark
    setDark(next)
    localStorage.setItem('darkMode', String(next))
    document.documentElement.classList.toggle('dark', next)
  }

  return { dark, toggle }
}
