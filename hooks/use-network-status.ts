"use client"

import { useState, useEffect } from 'react'

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true)
  const [wasOffline, setWasOffline] = useState(false)

  useEffect(() => {
    // Check initial status
    setIsOnline(navigator.onLine)

    const handleOnline = () => {
      setIsOnline(true)
      if (wasOffline) {
        console.log('Connection restored')
        setWasOffline(false)
        // Optionally trigger a data refresh here
      }
    }

    const handleOffline = () => {
      setIsOnline(false)
      setWasOffline(true)
      console.warn('Connection lost - some features may be unavailable')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [wasOffline])

  return { isOnline, wasOffline }
}
