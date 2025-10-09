"use client"

import { useEffect } from 'react'

export function GlobalErrorHandler() {
  useEffect(() => {
    // Suppress browser extension errors
    const originalError = console.error
    console.error = (...args: any[]) => {
      const message = args[0]?.toString() || ''
      
      // Filter out browser extension errors
      if (
        message.includes('contentScript.js') ||
        message.includes('Cannot read properties of undefined') ||
        message.includes('sentence')
      ) {
        return // Suppress these errors
      }
      
      // Log other errors normally
      originalError.apply(console, args)
    }

    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason?.toString() || ''
      
      // Suppress browser extension related rejections
      if (
        reason.includes('contentScript.js') ||
        reason.includes('sentence') ||
        reason.includes('Cannot read properties of undefined')
      ) {
        event.preventDefault()
        return
      }
    }

    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      console.error = originalError
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  return null
}
