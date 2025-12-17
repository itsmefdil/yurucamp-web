'use client'

import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import { toggleLikeActivity } from "@/app/actions/interactions"
import { useOptimistic, startTransition } from "react"
import { cn } from "@/lib/utils"

interface LikeButtonProps {
    activityId: string
    initialIsLiked: boolean
    initialLikeCount: number
    isLoggedIn: boolean
}

export function LikeButton({ activityId, initialIsLiked, initialLikeCount, isLoggedIn }: LikeButtonProps) {
    const [optimisticState, addOptimisticState] = useOptimistic(
        { isLiked: initialIsLiked, count: initialLikeCount },
        (state) => ({
            isLiked: !state.isLiked,
            count: state.isLiked ? state.count - 1 : state.count + 1
        })
    )

    const handleLike = async () => {
        if (!isLoggedIn) {
            // In a real app, maybe redirect to login or show modal
            alert("Silakan login untuk menyukai aktifitas ini.")
            return
        }

        startTransition(() => {
            addOptimisticState(null)
            toggleLikeActivity(activityId)
        })
    }

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleLike}
            className={cn(
                "gap-2 rounded-full transition-all duration-300 group",
                optimisticState.isLiked
                    ? "text-red-600 bg-red-50 border-red-200 hover:bg-red-100"
                    : "hover:text-red-600 hover:bg-red-50 hover:border-red-200"
            )}
        >
            <Heart className={cn("h-5 w-5 transition-transform group-hover:scale-110", optimisticState.isLiked && "fill-current")} />
            <span className="font-medium">
                {optimisticState.count > 0 ? optimisticState.count : "Suka"}
            </span>
        </Button>
    )
}
