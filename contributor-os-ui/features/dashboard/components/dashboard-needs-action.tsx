/**
 * DASHBOARD NEEDS ACTION
 * 
 * Shows events that require user action.
 * 
 * TODO: Implement click handlers to navigate to specific events
 * TODO: Add action buttons (review, comment, etc.)
 */

"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertCircle, ArrowRight } from "lucide-react"
import type { AppEvent } from "@/types/events"
import { cn } from "@/lib/utils"

interface DashboardNeedsActionProps {
  events: AppEvent[]
  isLoading: boolean
}

export function DashboardNeedsAction({ events, isLoading }: DashboardNeedsActionProps) {
  // TODO: Filter events that actually need action
  const needsActionEvents = events.slice(0, 5)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-primary" />
              Needs My Action
            </CardTitle>
            <CardDescription>Items requiring your attention</CardDescription>
          </div>
          <Button variant="ghost" size="sm" className="gap-2">
            View all
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : needsActionEvents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">All caught up! 🎉</div>
        ) : (
          <div className="space-y-2">
            {needsActionEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between rounded-lg border border-border bg-card p-3 hover:border-primary/50 transition-colors cursor-pointer"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {/* TODO: Render event title based on event type */}
                    Event #{event.id}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {/* TODO: Show repository and timestamp */}
                    {event.timestamp.toLocaleString()}
                  </p>
                </div>
                <Badge variant="destructive" className="ml-2">
                  Action Required
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}







