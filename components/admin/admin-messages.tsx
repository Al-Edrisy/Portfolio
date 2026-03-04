"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Mail,
    MailOpen,
    Trash2,
    Clock,
    User,
    ChevronDown,
    ChevronUp,
    Search,
    CheckCircle2,
    XCircle
} from 'lucide-react'
import { useMessagesRealtime } from '@/hooks/messages'
import { formatDistanceToNow } from 'date-fns'
import { useToast } from '@/hooks/use-toast'
import { Input } from '@/components/ui/input'

export function AdminMessages() {
    const { messages, loading, error, markAsRead, deleteMessage } = useMessagesRealtime()
    const [expandedId, setExpandedId] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const { toast } = useToast()

    const filteredMessages = messages.filter(msg =>
        msg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.message.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleToggleRead = async (id: string, currentRead: boolean) => {
        try {
            await markAsRead(id, !currentRead)
            toast({
                title: !currentRead ? "Marked as read" : "Marked as unread",
                description: "Message status updated successfully.",
            })
        } catch (err) {
            toast({
                title: "Error",
                description: "Failed to update message status.",
                variant: "destructive",
            })
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this message?')) return

        try {
            await deleteMessage(id)
            toast({
                title: "Message deleted",
                description: "The message has been permanently removed.",
            })
        } catch (err) {
            toast({
                title: "Error",
                description: "Failed to delete message.",
                variant: "destructive",
            })
        }
    }

    const toggleExpand = (id: string, isRead: boolean) => {
        if (expandedId === id) {
            setExpandedId(null)
        } else {
            setExpandedId(id)
            if (!isRead) {
                markAsRead(id, true)
            }
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-8 text-center text-destructive">
                <p>Error: {error}</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search messages..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="px-3 py-1">
                        {messages.filter(m => !m.read).length} Unread
                    </Badge>
                    <Badge variant="outline" className="px-3 py-1">
                        {messages.length} Total
                    </Badge>
                </div>
            </div>

            <div className="grid gap-4">
                {filteredMessages.length === 0 ? (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <Mail className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-20" />
                            <h3 className="text-lg font-semibold">No messages found</h3>
                            <p className="text-muted-foreground">
                                {searchQuery ? "Try adjusting your search query." : "You haven't received any messages yet."}
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    filteredMessages.map((msg, index) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card className={`overflow-hidden transition-all duration-300 border-l-4 ${msg.read ? 'border-l-transparent' : 'border-l-primary'}`}>
                                <div
                                    className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${expandedId === msg.id ? 'bg-muted/30' : ''}`}
                                    onClick={() => toggleExpand(msg.id, msg.read)}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`mt-1 h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${msg.read ? 'bg-muted' : 'bg-primary/10'}`}>
                                            {msg.read ? <MailOpen className="h-5 w-5 text-muted-foreground" /> : <Mail className="h-5 w-5 text-primary" />}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 mb-1">
                                                <h4 className={`font-semibold truncate ${msg.read ? 'text-muted-foreground' : 'text-foreground'}`}>
                                                    {msg.subject}
                                                </h4>
                                                <span className="text-xs text-muted-foreground shrink-0 flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true })}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="font-medium text-foreground/80">{msg.name}</span>
                                                <span className="text-muted-foreground truncate">&lt;{msg.email}&gt;</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleDelete(msg.id)
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                            {expandedId === msg.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                        </div>
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {expandedId === msg.id && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <CardContent className="p-6 pt-0 border-t bg-muted/10">
                                                <div className="pt-4 space-y-4">
                                                    <div className="bg-background rounded-lg p-4 border shadow-sm">
                                                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                                                            {msg.message}
                                                        </p>
                                                    </div>

                                                    <div className="flex items-center justify-between gap-4">
                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-8"
                                                                onClick={() => handleToggleRead(msg.id, msg.read)}
                                                            >
                                                                {msg.read ? (
                                                                    <><XCircle className="h-3.5 w-3.5 mr-1.5" /> Mark Unread</>
                                                                ) : (
                                                                    <><CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Mark Read</>
                                                                )}
                                                            </Button>
                                                            <Button variant="default" size="sm" className="h-8" asChild>
                                                                <a href={`mailto:${msg.email}?subject=Re: ${msg.subject}`}>
                                                                    Reply via Email
                                                                </a>
                                                            </Button>
                                                        </div>

                                                        <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">
                                                            ID: {msg.id}
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </Card>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    )
}
