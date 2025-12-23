/**
 * TIMELINE VIEW
 * 
 * Unified activity timeline showing all events.
 * This is the core view of Contributor OS - everything revolves around events.
 * 
 * TODO: Connect to real events via useEvents hook
 * TODO: Implement infinite scroll/pagination
 * TODO: Add real-time updates via WebSocket
 * TODO: Improve event rendering based on event types
 */

"use client"

import { useState } from "react"
import { useEvents } from "@/hooks/queries/use-events"
import { useEventStore } from "@/stores/event-store"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Filter, Activity } from "lucide-react"
import { TimelineItem } from "./timeline-item"

const filters = ["All", "Needs Action", "PRs", "Issues", "Reviews"]

export function TimelineView() {
  const [activeFilter, setActiveFilter] = useState("All")
  const filter = useEventStore((state) => state.filter)
  const { data: events = [], isLoading, error } = useEvents(filter)

  // Debug logging
  console.log("[TimelineView] State:", {
    isLoading,
    error: error?.message,
    errorDetails: error,
    eventsCount: events?.length || 0,
    events: events?.slice(0, 3),
    filter,
    activeFilter,
  })
  
  if (error) {
    console.error("[TimelineView] Error details:", error)
  }

  // Apply activeFilter to events
  let filteredEvents = events

  if (activeFilter === "PRs") {
    filteredEvents = events.filter((e) => e.type.startsWith("github.pr."))
  } else if (activeFilter === "Issues") {
    filteredEvents = events.filter((e) => e.type.startsWith("github.issue."))
  } else if (activeFilter === "Reviews") {
    filteredEvents = events.filter((e) => e.type === "github.pr.reviewed" || e.type === "github.pr.review_requested")
  } else if (activeFilter === "Needs Action") {
    // Only show OPEN PRs and OPEN issues (exclude merged/closed)
    filteredEvents = events.filter((e) => {
      if (e.type === "github.pr.opened" || e.type === "github.pr.review_requested") {
        if ("pullRequest" in e) {
          const prEvent = e as any
          // Only include if PR is actually OPEN (not merged or closed)
          return prEvent.pullRequest?.state === "open"
        }
        return true // Include if we can't verify state
      }
      if (e.type === "github.issue.opened") {
        if ("issue" in e) {
          const issueEvent = e as any
          // Only include if issue is actually OPEN (not closed)
          return issueEvent.issue?.state === "open"
        }
        return true // Include if we can't verify state
      }
      return false
    })
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4">
      {/* Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Activity Timeline</h1>
          <p className="text-muted-foreground mt-1">
            Your GitHub contributions and open source activity
          </p>
        </div>
        
        {/* Filters */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <div className="flex gap-1 flex-wrap">
              {filters.map((filter) => (
                <Button
                  key={filter}
                  variant={activeFilter === filter ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setActiveFilter(filter)}
                  className={cn(
                    "text-sm transition-all",
                    activeFilter === filter && "bg-secondary text-secondary-foreground shadow-sm"
                  )}
                >
                  {filter}
                  {filter === "Needs Action" && (
                    <Badge variant="destructive" className="ml-2 h-5 px-1.5">
                      {events.filter((e) => {
                        if (e.type === "github.pr.opened" || e.type === "github.pr.review_requested") {
                          if ("pullRequest" in e) {
                            const prEvent = e as any
                            return prEvent.pullRequest?.state === "open"
                          }
                          return true
                        }
                        if (e.type === "github.issue.opened") {
                          if ("issue" in e) {
                            const issueEvent = e as any
                            return issueEvent.issue?.state === "open"
                          }
                          return true
                        }
                        return false
                      }).length}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          </div>
          {events.length > 0 && (
            <div className="text-sm text-muted-foreground">
              {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'}
            </div>
          )}
        </div>
      </div>

      {/* Timeline Items */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">
          <Activity className="h-12 w-12 mx-auto mb-2 opacity-50 animate-pulse" />
          <p>Loading events...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12 text-destructive">
          <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p className="font-semibold">Failed to load events</p>
          <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
          <p className="text-xs text-muted-foreground mt-1">Make sure you're logged in with GitHub</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p className="font-semibold">No events found</p>
          <p className="text-sm mt-2">
            {events.length === 0 
              ? "You don't have any GitHub activity yet. Create a pull request or issue in an open source repository to see it here."
              : `No events match the "${activeFilter}" filter. Try selecting a different filter.`}
          </p>
          {events.length > 0 && (
            <p className="text-xs mt-1">Total events: {events.length}</p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredEvents.map((event, index) => (
            <TimelineItem key={event.id} event={event} />
          ))}
        </div>
      )}

      {/* Load More - Only show if there are events */}
      {filteredEvents.length > 0 && filteredEvents.length >= 50 && (
        <div className="flex justify-center pt-6">
          <Button 
            variant="outline" 
            className="text-muted-foreground"
            disabled
            title="All events are already loaded"
          >
            All activity loaded ({filteredEvents.length} events)
          </Button>
        </div>
      )}
    </div>
  )
}

