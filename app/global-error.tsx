'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <html>
      <body>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(to bottom, #000000, #1a1a1a)'
        }}>
          <div style={{
            textAlign: 'center',
            padding: '2rem',
            color: 'white'
          }}>
            <h1 style={{ fontSize: '4rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              Oops!
            </h1>
            <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
              Something went wrong
            </h2>
            <p style={{ marginBottom: '2rem', opacity: 0.8 }}>
              We encountered an unexpected error. Please try again.
            </p>
            <button
              onClick={reset}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'white',
                color: 'black',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '600'
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}

