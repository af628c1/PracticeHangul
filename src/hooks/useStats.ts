import { useState, useEffect, useCallback } from 'react'

interface Stats {
  lettersSeen: string[]
  wordsSeen: string[]
  bestStreak: number
}

const STORAGE_KEY = 'practice-hangul-stats'

function loadStats(): Stats {
  if (typeof window === 'undefined') {
    return { lettersSeen: [], wordsSeen: [], bestStreak: 0 }
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { lettersSeen: [], wordsSeen: [], bestStreak: 0 }
    const parsed = JSON.parse(raw)
    return {
      lettersSeen: parsed.lettersSeen ?? [],
      wordsSeen: parsed.wordsSeen ?? [],
      bestStreak: parsed.bestStreak ?? 0,
    }
  } catch {
    return { lettersSeen: [], wordsSeen: [], bestStreak: 0 }
  }
}

function saveStats(stats: Stats) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats))
  } catch {
    // ignore
  }
}

export function useStats() {
  const [stats, setStats] = useState<Stats>(() => loadStats())

  useEffect(() => {
    const handler = () => setStats(loadStats())
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  const recordLetter = useCallback((hangul: string) => {
    setStats((prev) => {
      if (prev.lettersSeen.includes(hangul)) return prev
      const next = { ...prev, lettersSeen: [...prev.lettersSeen, hangul] }
      saveStats(next)
      return next
    })
  }, [])

  const recordWord = useCallback((hangul: string) => {
    setStats((prev) => {
      if (prev.wordsSeen.includes(hangul)) return prev
      const next = { ...prev, wordsSeen: [...prev.wordsSeen, hangul] }
      saveStats(next)
      return next
    })
  }, [])

  const recordStreak = useCallback((streak: number) => {
    setStats((prev) => {
      if (streak <= prev.bestStreak) return prev
      const next = { ...prev, bestStreak: streak }
      saveStats(next)
      return next
    })
  }, [])

  return {
    lettersSeen: stats.lettersSeen.length,
    wordsSeen: stats.wordsSeen.length,
    bestStreak: stats.bestStreak,
    recordLetter,
    recordWord,
    recordStreak,
  }
}
