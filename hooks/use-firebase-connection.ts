"use client"

import { useState, useEffect, useCallback } from 'react'
import { db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'

export function useFirebaseConnection() {
  const [isConnected, setIsConnected] = useState(true)
  const [isChecking, setIsChecking] = useState(false)
  const [lastChecked, setLastChecked] = useState<Date | null>(null)

  const checkConnection = useCallback(async () => {
    if (isChecking) return isConnected
    
    setIsChecking(true)
    
    try {
      // Try to read from a test document to check connection
      const testDocRef = doc(db, '_test', 'connection')
      await getDoc(testDocRef)
      
      setIsConnected(true)
      setLastChecked(new Date())
      return true
    } catch (error) {
      console.warn('Firebase connection check failed:', error)
      setIsConnected(false)
      setLastChecked(new Date())
      return false
    } finally {
      setIsChecking(false)
    }
  }, [isChecking, isConnected])

  // Check connection on mount
  useEffect(() => {
    checkConnection()
  }, [checkConnection])

  // Auto-retry connection every 30 seconds if offline
  useEffect(() => {
    if (!isConnected) {
      const interval = setInterval(() => {
        checkConnection()
      }, 30000) // 30 seconds

      return () => clearInterval(interval)
    }
  }, [isConnected, checkConnection])

  return {
    isConnected,
    isChecking,
    lastChecked,
    checkConnection,
    retry: checkConnection
  }
}
