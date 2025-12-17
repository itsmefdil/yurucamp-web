'use client'

import { Button } from "@/components/ui/button"
import { Share2, Check } from "lucide-react"
import { useState } from "react"

export function ShareButton() {
    const [copied, setCopied] = useState(false)

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: document.title,
                    url: window.location.href,
                })
            } catch (err) {
                console.error("Error sharing:", err)
            }
        } else {
            // Fallback to copy link
            try {
                await navigator.clipboard.writeText(window.location.href)
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
            } catch (err) {
                console.error("Error copying to clipboard:", err)
            }
        }
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={handleShare}
            className="rounded-full hover:bg-gray-200 text-gray-500 relative"
            title="Bagikan"
        >
            {copied ? (
                <Check className="h-5 w-5 text-green-600" />
            ) : (
                <Share2 className="h-5 w-5" />
            )}
        </Button>
    )
}
