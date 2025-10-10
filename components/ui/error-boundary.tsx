"use client"

import type React from "react"

import { Component, type ReactNode } from "react"
import { motion } from "motion/react"
import StarBorder from "./star-border"

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo)
    
    // Check if it's a Firebase connection error
    if (error.message.includes('firestore') || error.message.includes('Firebase') || error.message.includes('network')) {
      console.warn('Firebase connection issue detected')
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center p-8 max-w-md mx-auto"
          >
            <div className="text-6xl mb-6">🚧</div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Something went wrong</h2>
            <p className="text-muted-foreground mb-6">
              We encountered an unexpected error. Please try refreshing the page.
            </p>
            <StarBorder as="button" color="rgb(16, 185, 129)" speed="4s" onClick={() => window.location.reload()}>
              Refresh Page
            </StarBorder>
          </motion.div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
