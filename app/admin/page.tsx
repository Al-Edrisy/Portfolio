"use client"

import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Navigation from '@/components/ui/navigation'
import { AdminDashboard } from '@/components/admin/admin-dashboard'

export default function AdminPage() {
    const { user, isAdmin } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!user) {
            router.push('/auth/login')
            return
        }

        if (!isAdmin) {
            router.push('/profile')
        }
    }, [user, isAdmin, router])

    if (!user || !isAdmin) {
        return (
            <main className="min-h-screen bg-background">
                <Navigation />
                <div className="pt-20 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </main>
        )
    }

    return (
        <main className="min-h-screen bg-background">
            <Navigation />
            <div className="pt-20">
                <AdminDashboard />
            </div>
        </main>
    )
}
