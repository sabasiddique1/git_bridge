"use client"

import { useState, useMemo } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, GitPullRequest, CircleDot, MessageSquare, GitMerge, Eye, Loader2, AlertCircle, GitCommit, StickyNote } from "lucide-react"
import { useEvents } from "@/hooks/queries/use-events"
import type { AppEvent, PullRequestEvent, IssueEvent, CommentEvent, ReviewEvent } from "@/types/events"

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

interface CalendarEvent {
  id: string
  date: number
  type: "pr" | "issue" | "comment" | "review" | "merge" | "commit" | "note"
  title: string
  repo: string
  url?: string
  isNote?: boolean
  hasWorkReminder?: boolean
}

const typeIcons = {
  pr: GitPullRequest,
  issue: CircleDot,
  comment: MessageSquare,
  review: Eye,
  merge: GitMerge,
  commit: GitCommit,
  note: StickyNote,
}

const typeColors = {
  pr: "bg-chart-1/20 text-chart-1",
  issue: "bg-chart-3/20 text-chart-3",
  comment: "bg-chart-2/20 text-chart-2",
  review: "bg-chart-5/20 text-chart-5",
  merge: "bg-primary/20 text-primary",
  commit: "bg-blue-500/20 text-blue-500",
  note: "bg-yellow-500/20 text-yellow-500",
}

// Convert AppEvent to CalendarEvent
function convertEventToCalendarEvent(event: AppEvent, date: Date): CalendarEvent | null {
  if (event.source !== "github") return null

  const githubEvent = event as any
  let type: CalendarEvent["type"] = "pr"
  let title = "Unknown Event"
  let repo = githubEvent.repository?.fullName || "unknown"

  if (event.type.startsWith("github.pr.")) {
    if (event.type === "github.pr.merged") {
      type = "merge"
    } else if (event.type === "github.pr.reviewed" || event.type === "github.pr.review_requested") {
      type = "review"
    } else {
      type = "pr"
    }
    const prEvent = event as PullRequestEvent
    title = prEvent.pullRequest?.title || `PR #${prEvent.pullRequest?.number || ""}`
  } else if (event.type.startsWith("github.issue.")) {
    type = "issue"
    const issueEvent = event as IssueEvent
    title = issueEvent.issue?.title || `Issue #${issueEvent.issue?.number || ""}`
  } else if (event.type.startsWith("github.comment.")) {
    type = "comment"
    const commentEvent = event as CommentEvent
    title = `Comment on ${commentEvent.subjectType || "item"}`
  } else if (event.type === "github.commit.pushed") {
    type = "commit"
    const commitMessage = (event as any).metadata?.commitMessage || "Commit"
    title = commitMessage.length > 30 ? commitMessage.substring(0, 30) + "..." : commitMessage
  } else if (event.type === "note.created" || event.type === "note.updated") {
    type = "note"
    const noteTitle = (event as any).metadata?.noteTitle || "Note"
    title = `📝 ${noteTitle}`
    calendarEvent.isNote = true
    // Check if note has work reminder (linked to open PR/issue)
    if ((event as any).metadata?.linkedPrNumber || (event as any).metadata?.linkedIssueNumber) {
      calendarEvent.hasWorkReminder = true
    }
  }

  return {
    id: event.id,
    date: date.getDate(),
    type,
    title: title.length > 30 ? title.substring(0, 30) + "..." : title,
    repo,
    url: githubEvent.url,
  }
}

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const { data: events = [], isLoading, error } = useEvents()

  // Get current month/year
  const currentMonth = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })
  const today = new Date()

  // Generate calendar days for current month
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const firstDayOffset = firstDay.getDay()
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const paddingDays = Array.from({ length: firstDayOffset }, () => null)

  // Convert events to calendar events grouped by date
  const eventsByDate = useMemo(() => {
    const grouped: { [key: number]: CalendarEvent[] } = {}

    events.forEach((event) => {
      const eventDate = new Date(event.timestamp)
      
      // Only include events from the current month
      if (eventDate.getMonth() === month && eventDate.getFullYear() === year) {
        const calendarEvent = convertEventToCalendarEvent(event, eventDate)
        if (calendarEvent) {
          const day = eventDate.getDate()
          if (!grouped[day]) {
            grouped[day] = []
          }
          grouped[day].push(calendarEvent)
        }
      }
    })

    // Sort events within each day by timestamp (most recent first)
    Object.keys(grouped).forEach((day) => {
      grouped[parseInt(day)].sort((a, b) => {
        const aEvent = events.find((e) => e.id === a.id)
        const bEvent = events.find((e) => e.id === b.id)
        if (!aEvent || !bEvent) return 0
        return new Date(bEvent.timestamp).getTime() - new Date(aEvent.timestamp).getTime()
      })
    })

    return grouped
  }, [events, month, year])

  const getEventsForDay = (day: number) => eventsByDate[day] || []

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <span className="text-muted-foreground">Loading your activity calendar...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center">
          <AlertCircle className="h-6 w-6 mx-auto mb-2 text-destructive" />
          <p className="text-sm text-destructive">Failed to load calendar events. Please try again.</p>
        </div>
      </div>
    )
  }

  const totalEvents = Object.values(eventsByDate).reduce((sum, events) => sum + events.length, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Calendar</h2>
          <p className="text-sm text-muted-foreground">
            {totalEvents} {totalEvents === 1 ? "event" : "events"} in {currentMonth}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigateMonth("prev")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-32 text-center font-medium">{currentMonth}</span>
          <Button variant="ghost" size="icon" onClick={() => navigateMonth("next")}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToToday} className="ml-2">
            Today
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 flex-wrap">
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
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-chart-5" />
          <span className="text-sm text-muted-foreground">Reviews</span>
        </div>
        <div className="flex items-center gap-2">
          <GitMerge className="h-4 w-4 text-primary" />
          <span className="text-sm text-muted-foreground">Merged</span>
        </div>
        <div className="flex items-center gap-2">
          <GitCommit className="h-4 w-4 text-blue-500" />
          <span className="text-sm text-muted-foreground">Commits</span>
        </div>
        <div className="flex items-center gap-2">
          <StickyNote className="h-4 w-4 text-yellow-500" />
          <span className="text-sm text-muted-foreground">Notes</span>
        </div>
      </div>

      {/* Calendar Grid */}
      {totalEvents === 0 ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No events this month</h3>
          <p className="text-sm text-muted-foreground">
            You don't have any GitHub activity in {currentMonth}. Try navigating to a different month or check your open source contributions.
          </p>
        </div>
      ) : (
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
              const dayDate = day ? new Date(year, month, day) : null
              const isToday = dayDate && 
                             dayDate.getDate() === today.getDate() &&
                             dayDate.getMonth() === today.getMonth() &&
                             dayDate.getFullYear() === today.getFullYear()

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
                        const content = event.url ? (
                          <a
                            key={event.id}
                            href={event.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(
                              "flex items-center gap-1 rounded px-1.5 py-0.5 text-xs cursor-pointer hover:opacity-80 transition-opacity",
                              typeColors[event.type],
                              event.hasWorkReminder && "ring-2 ring-yellow-400/50",
                            )}
                            title={`${event.title} - ${event.repo}${event.hasWorkReminder ? " (Work reminder)" : ""}`}
                          >
                            <Icon className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{event.title}</span>
                            {event.hasWorkReminder && <span className="text-yellow-500">⚠️</span>}
                          </a>
                        ) : (
                          <div
                            key={event.id}
                            className={cn(
                              "flex items-center gap-1 rounded px-1.5 py-0.5 text-xs",
                              typeColors[event.type],
                              event.hasWorkReminder && "ring-2 ring-yellow-400/50",
                            )}
                            title={`${event.title} - ${event.repo}${event.hasWorkReminder ? " (Work reminder)" : ""}`}
                          >
                            <Icon className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{event.title}</span>
                            {event.hasWorkReminder && <span className="text-yellow-500">⚠️</span>}
                          </div>
                        )
                        return content
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
      )}
    </div>
  )
}
