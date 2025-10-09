// Script to suppress browser extension errors in development
// This helps clean up the console during development

if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Store original console methods
  const originalError = console.error
  const originalWarn = console.warn

  // Filter out browser extension errors
  const shouldSuppress = (message) => {
    const msg = message?.toString() || ''
    return (
      msg.includes('contentScript.js') ||
      msg.includes('Cannot read properties of undefined') ||
      msg.includes('sentence') ||
      msg.includes('grammarly') ||
      msg.includes('browser-extension')
    )
  }

  // Override console.error
  console.error = (...args) => {
    if (shouldSuppress(args[0])) {
      return // Suppress the error
    }
    originalError.apply(console, args)
  }

  // Override console.warn
  console.warn = (...args) => {
    if (shouldSuppress(args[0])) {
      return // Suppress the warning
    }
    originalWarn.apply(console, args)
  }

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason?.toString() || ''
    if (shouldSuppress(reason)) {
      event.preventDefault()
      return
    }
  })

  console.log('🔧 Browser extension error suppression enabled for development')
}
