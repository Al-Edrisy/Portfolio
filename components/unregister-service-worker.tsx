"use client"

import { useEffect } from 'react'

export function UnregisterServiceWorker() {
  useEffect(() => {
    // Unregister any existing service workers
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          registration.unregister()
          console.log('Service worker unregistered:', registration)
        })
      })
    }
  }, [])

  return null
}

