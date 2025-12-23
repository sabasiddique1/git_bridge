"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, GitPullRequest, CircleDot, MessageSquare } from "lucide-react"

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

interface CalendarEvent {
  id: string
  date: number
  type: "pr" | "issue" | "comment"
  title: string
  repo: string
}

const mockEvents: CalendarEvent[] = [
  { id: "1", date: 15, type: "pr", title: "Hydration fix", repo: "vercel/next.js" },
  { id: "2", date: 15, type: "issue", title: "Bug report", repo: "facebook/react" },
  { id: "3", date: 17, type: "comment", title: "Review comment", repo: "vercel/next.js" },
  { id: "4", date: 18, type: "pr", title: "New feature", repo: "tailwindlabs/tailwindcss" },
  { id: "5", date: 19, type: "pr", title: "Docs update", repo: "vercel/next.js" },
  { id: "6", date: 20, type: "issue", title: "Feature request", repo: "facebook/react" },
  { id: "7", date: 22, type: "pr", title: "Performance", repo: "vercel/next.js" },
]

const typeIcons = {
  pr: GitPullRequest,
  issue: CircleDot,
  comment: MessageSquare,
}

const typeColors = {
  pr: "bg-chart-1/20 text-chart-1",
  issue: "bg-chart-3/20 text-chart-3",
  comment: "bg-chart-2/20 text-chart-2",
}

export function CalendarView() {
  const [currentMonth] = useState("December 2024")
  const today = 19

  // Generate calendar days (simplified for demo)
  const daysInMonth = 31
  const firstDayOffset = 0 // Sunday
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const paddingDays = Array.from({ length: firstDayOffset }, () => null)

  const getEventsForDay = (day: number) => mockEvents.filter((e) => e.date === day)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Calendar</h2>
          <p className="text-sm text-muted-foreground">Track your contribution activity</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-32 text-center font-medium">{currentMonth}</span>
          <Button variant="ghost" size="icon">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <GitPullRequest className="h-4 w-4 text-chart-1" />
          <span className="text-sm text-muted-foreground">Pull Requests</span>
        </div>
        <div className="flex items-center gap-2">
          <CircleDot className="h-4 w-4 text-chart-3" />
          <span className="text-sm text-muted-foreground">Issues</span>
        </div>
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-chart-2" />
          <span className="text-sm text-muted-foreground">Comments</span>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        {/* Days Header */}
        <div className="grid grid-cols-7 border-b border-border">
          {daysOfWeek.map((day) => (
            <div key={day} className="p-3 text-center text-sm font-medium text-muted-foreground bg-secondary/30">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {[...paddingDays, ...days].map((day, index) => {
            const events = day ? getEventsForDay(day) : []
            const isToday = day === today

            return (
              <div
                key={index}
                className={cn(
                  "min-h-24 border-b border-r border-border p-2 transition-colors hover:bg-secondary/30",
                  !day && "bg-muted/20",
                  isToday && "bg-primary/5",
                )}
              >
                {day && (
                  <>
                    <div
                      className={cn(
                        "mb-1 flex h-7 w-7 items-center justify-center rounded-full text-sm",
                        isToday && "bg-primary text-primary-foreground font-semibold",
                      )}
                    >
                      {day}
                    </div>
                    <div className="space-y-1">
                      {events.slice(0, 2).map((event) => {
                        const Icon = typeIcons[event.type]
                        return (
                          <div
                            key={event.id}
                            className={cn(
                              "flex items-center gap-1 rounded px-1.5 py-0.5 text-xs cursor-pointer hover:opacity-80",
                              typeColors[event.type],
                            )}
                          >
                            <Icon className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{event.title}</span>
                          </div>
                        )
                      })}
                      {events.length > 2 && (
                        <Badge variant="secondary" className="text-[10px] px-1">
                          +{events.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
