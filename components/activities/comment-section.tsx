'use client'

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageCircle, Send, Trash2 } from "lucide-react"
import { addComment, deleteComment } from "@/app/actions/interactions"
import { useState, useTransition } from "react"
import { formatDistanceToNow } from "date-fns"
import { id as localeId } from "date-fns/locale"
import { cn } from "@/lib/utils"

interface Comment {
    id: string
    content: string
    created_at: string
    user_id: string
    profiles: {
        full_name: string | null
        avatar_url: string | null
    } | null
}

interface CommentSectionProps {
    activityId?: string
    videoId?: string
    comments: Comment[]
    currentUserId: string | null | undefined
    onUpdate?: () => void
}

export function CommentSection({ activityId, videoId, comments, currentUserId, onUpdate }: CommentSectionProps) {
    const [content, setContent] = useState("")
    const [isPending, startTransition] = useTransition()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!content.trim() || !currentUserId) return

        startTransition(async () => {
            await addComment(content, activityId, videoId)
            setContent("")
            onUpdate?.()
        })
    }

    const handleDelete = async (commentId: string) => {
        if (!confirm("Hapus komentar ini?")) return
        startTransition(async () => {
            await deleteComment(commentId, activityId, videoId)
            onUpdate?.()
        })
    }

    return (
        <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8 ring-1 ring-black/5" id="comments">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <MessageCircle className="h-6 w-6 text-primary" />
                Komentar <span className="text-gray-400 text-lg font-normal">({comments.length})</span>
            </h3>

            {/* Comment List */}
            <div className="space-y-6 mb-8">
                {comments.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                            <MessageCircle className="h-8 w-8 text-gray-300" />
                        </div>
                        <p className="font-medium text-gray-600">Belum ada komentar</p>
                        <p className="text-sm mt-1">Jadilah yang pertama membagikan pendapatmu!</p>
                    </div>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="flex gap-4 group">
                            <Avatar className="h-10 w-10 border border-gray-100">
                                <AvatarImage src={comment.profiles?.avatar_url || undefined} />
                                <AvatarFallback className="bg-orange-100 text-orange-600 font-bold text-xs">{comment.profiles?.full_name?.[0] || "?"}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <div className="bg-gray-50 rounded-2xl p-4 rounded-tl-none">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-bold text-sm text-gray-800">{comment.profiles?.full_name || "Unknown"}</span>
                                        <span className="text-xs text-gray-400">
                                            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: localeId })}
                                        </span>
                                    </div>
                                    <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                                </div>
                                <div className="flex items-center gap-4 mt-1 ml-2">
                                    {currentUserId === comment.user_id && (
                                        <button
                                            onClick={() => handleDelete(comment.id)}
                                            className="text-xs text-red-400 hover:text-red-600 font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                            disabled={isPending}
                                        >
                                            <Trash2 className="h-3 w-3" /> Hapus
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Comment Form */}
            {currentUserId ? (
                <form onSubmit={handleSubmit} className="flex gap-4 items-start relative">
                    <div className="flex-1">
                        <Textarea
                            placeholder="Tulis komentar..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full min-h-[100px] resize-none rounded-2xl border-gray-200 focus:border-primary focus:ring-primary/20 bg-gray-50 focus:bg-white transition-all pl-4 pr-12 py-3"
                            disabled={isPending}
                        />
                        <Button
                            type="submit"
                            size="icon"
                            disabled={!content.trim() || isPending}
                            className="absolute right-3 bottom-0.5 mb-3 h-8 w-8 rounded-full shadow-md bg-primary hover:bg-primary/90 transition-all hover:scale-105 disabled:opacity-50 disabled:scale-100"
                        >
                            <Send className="h-4 w-4 text-white" />
                        </Button>
                    </div>
                </form>
            ) : (
                <div className="bg-blue-50/50 rounded-xl p-4 text-center">
                    <p className="text-sm text-blue-600 font-medium">Silakan login untuk mengirim komentar.</p>
                </div>
            )}
        </div>
    )
}
