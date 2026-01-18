"use client"

import { Button } from "@/components/ui/button"
import { useEffect } from "react"

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center gap-4">
            <h2 className="text-2xl font-bold">Something went wrong!</h2>
            <p className="text-muted-foreground">We apologize for the inconvenience.</p>
            <div className="flex gap-2">
                <Button onClick={() => window.location.reload()} variant="outline">
                    Refresh Page
                </Button>
                <Button onClick={() => reset()}>Try again</Button>
            </div>
        </div>
    )
}
