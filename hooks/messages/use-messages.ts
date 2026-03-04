"use client"

import { useState, useEffect } from 'react'
import {
    collection,
    query,
    orderBy,
    onSnapshot,
    doc,
    updateDoc,
    deleteDoc,
    Timestamp
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { ContactMessage } from '@/types'

export function useMessagesRealtime() {
    const [messages, setMessages] = useState<ContactMessage[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const q = query(
            collection(db, 'contacts'),
            orderBy('timestamp', 'desc')
        )

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                try {
                    const messagesData = snapshot.docs.map((messageDoc) => {
                        const data = messageDoc.data()
                        return {
                            id: messageDoc.id,
                            ...data,
                            timestamp: data.timestamp instanceof Timestamp
                                ? data.timestamp.toDate()
                                : new Date(data.timestamp),
                        } as ContactMessage
                    })

                    setMessages(messagesData)
                    setError(null)
                } catch (err: any) {
                    setError(err.message || 'Failed to load messages')
                    console.error('Error loading messages:', err)
                } finally {
                    setLoading(false)
                }
            },
            (err) => {
                setError(err.message || 'Failed to load messages')
                console.error('Error in messages listener:', err)
                setLoading(false)
            }
        )

        return unsubscribe
    }, [])

    const markAsRead = async (messageId: string, read: boolean = true) => {
        try {
            await updateDoc(doc(db, 'contacts', messageId), { read })
        } catch (err: any) {
            console.error('Error updating message status:', err)
            throw err
        }
    }

    const deleteMessage = async (messageId: string) => {
        try {
            await deleteDoc(doc(db, 'contacts', messageId))
        } catch (err: any) {
            console.error('Error deleting message:', err)
            throw err
        }
    }

    return {
        messages,
        loading,
        error,
        markAsRead,
        deleteMessage
    }
}
