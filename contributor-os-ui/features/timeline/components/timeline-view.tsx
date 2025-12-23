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
  const { data: events = [], isLoading } = useEvents(filter)

  // TODO: Apply activeFilter to events
  const filteredEvents = events

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <div className="flex gap-1">
            {filters.map((filter) => (
              <Button
                key={filter}
                variant={activeFilter === filter ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setActiveFilter(filter)}
                className={cn("text-sm", activeFilter === filter && "bg-secondary text-secondary-foreground")}
              >
                {filter}
                {filter === "Needs Action" && (
                  <Badge variant="destructive" className="ml-2 h-5 px-1.5">
                    {/* TODO: Count actual needs action events */}
                    0
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </div>
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          <Clock className="mr-2 h-4 w-4" />
          Last 24 hours
        </Button>
      </div>

      {/* Timeline Items */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading events...</div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No events found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredEvents.map((event) => (
            <TimelineItem key={event.id} event={event} />
          ))}
        </div>
      )}

      {/* Load More */}
      <div className="flex justify-center pt-4">
        <Button variant="outline" className="text-muted-foreground bg-transparent">
          Load more activity
        </Button>
      </div>
    </div>
  )
}

