"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { User as FirebaseUser, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, googleProvider, db } from '@/lib/firebase'
import { User } from '@/types'
import { COLLECTIONS } from '@/lib/firebase/utils'

interface AuthContextType {
  user: User | null
  firebaseUser: FirebaseUser | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  isDeveloper: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setFirebaseUser(firebaseUser)
        
        try {
          // Get or create user document
          const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, firebaseUser.uid))
          
          if (userDoc.exists()) {
            // User exists, update their data
            const userData = userDoc.data()
            const updatedUser: User = {
              id: firebaseUser.uid,
              email: firebaseUser.email!,
              name: firebaseUser.displayName!,
              avatar: firebaseUser.photoURL!,
              role: userData.role || 'user',
              createdAt: userData.createdAt.toDate(),
            }
            
            // Update user data if it has changed
            if (
              userData.name !== firebaseUser.displayName ||
              userData.avatar !== firebaseUser.photoURL ||
              userData.email !== firebaseUser.email
            ) {
              await setDoc(doc(db, COLLECTIONS.USERS, firebaseUser.uid), {
                name: firebaseUser.displayName,
                avatar: firebaseUser.photoURL,
                email: firebaseUser.email,
                role: userData.role,
                createdAt: userData.createdAt,
                updatedAt: new Date(),
              })
            }
            
            setUser(updatedUser)
          } else {
            // Create new user document
            const newUser: User = {
              id: firebaseUser.uid,
              email: firebaseUser.email!,
              name: firebaseUser.displayName!,
              avatar: firebaseUser.photoURL!,
              role: 'user', // Default role
              createdAt: new Date(),
            }
            
            await setDoc(doc(db, COLLECTIONS.USERS, firebaseUser.uid), {
              email: newUser.email,
              name: newUser.name,
              avatar: newUser.avatar,
              role: newUser.role,
              createdAt: new Date(),
            })
            
            setUser(newUser)
          }
        } catch (error) {
          console.error('Error handling user data:', error)
          // Still set the user even if there's an error with Firestore
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email!,
            name: firebaseUser.displayName!,
            avatar: firebaseUser.photoURL!,
            role: 'user',
            createdAt: new Date(),
          })
        }
      } else {
        setFirebaseUser(null)
        setUser(null)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signInWithGoogle = async () => {
    try {
      setLoading(true)
      await signInWithPopup(auth, googleProvider)
    } catch (error: any) {
      console.error('Error signing in:', error)
      setLoading(false)
      
      // Handle specific error cases that shouldn't throw
      if (error.code === 'auth/popup-closed-by-user') {
        // User closed the popup, don't show error
        return
      }
      
      if (error.code === 'auth/cancelled-popup-request') {
        // User cancelled the popup request
        return
      }
      
      if (error.code === 'auth/popup-blocked') {
        // Popup was blocked by browser
        throw new Error('Popup was blocked. Please allow popups for this site.')
      }
      
      // For other errors, throw them
      throw error
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    }
  }

  const value = {
    user,
    firebaseUser,
    loading,
    signInWithGoogle,
    logout,
    isDeveloper: user?.role === 'developer',
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
