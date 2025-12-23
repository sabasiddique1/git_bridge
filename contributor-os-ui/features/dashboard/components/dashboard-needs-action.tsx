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
import { AlertCircle, ArrowRight, GitPullRequest, CircleDot, Eye } from "lucide-react"
import type { AppEvent, PullRequestEvent, IssueEvent } from "@/types/events"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface DashboardNeedsActionProps {
  events: AppEvent[]
  isLoading: boolean
}

export function DashboardNeedsAction({ events, isLoading }: DashboardNeedsActionProps) {
  // Events are already filtered by the API to only include open PRs/issues
  // But we'll double-check and filter to be safe
  const needsActionEvents = events
    .filter((e) => {
      // Only include open PRs and open issues
      if (e.type === "github.pr.opened" || e.type === "github.pr.review_requested") {
        if ("pullRequest" in e) {
          const prEvent = e as PullRequestEvent
          return prEvent.pullRequest.state === "open"
        }
        return true
      }
      if (e.type === "github.issue.opened") {
        if ("issue" in e) {
          const issueEvent = e as IssueEvent
          return issueEvent.issue.state === "open"
        }
        return true
      }
      return false
    })
    .slice(0, 5)

  const formatTime = (date: Date) => {
    const now = new Date()
    const diffTime = now.getTime() - date.getTime()
    const diffMinutes = Math.floor(diffTime / (1000 * 60))
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffMinutes < 1) return "Just now"
    if (diffMinutes < 60) return `${diffMinutes}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const getEventTitle = (event: AppEvent): string => {
    if (event.type.startsWith("github.pr.")) {
      const prEvent = event as PullRequestEvent
      return prEvent.pullRequest.title
    } else if (event.type.startsWith("github.issue.")) {
      const issueEvent = event as IssueEvent
      return issueEvent.issue.title
    }
    return "Event"
  }

  const getEventUrl = (event: AppEvent): string => {
    if (event.type.startsWith("github.pr.")) {
      const prEvent = event as PullRequestEvent
      return prEvent.pullRequest.url
    } else if (event.type.startsWith("github.issue.")) {
      const issueEvent = event as IssueEvent
      return issueEvent.issue.url
    }
    return "#"
  }

  const getEventIcon = (event: AppEvent) => {
    if (event.type === "github.pr.review_requested") {
      return Eye
    } else if (event.type.startsWith("github.pr.")) {
      return GitPullRequest
    } else if (event.type.startsWith("github.issue.")) {
      return CircleDot
    }
    return AlertCircle
  }

  const getRepoName = (event: AppEvent): string => {
    if ("repository" in event) {
      return event.repository.fullName
    }
    return "Unknown"
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-primary" />
              Needs My Action
            </CardTitle>
            <CardDescription>Open pull requests and issues requiring your attention</CardDescription>
          </div>
          {needsActionEvents.length > 0 && (
            <Link href="/?filter=Needs Action">
              <Button variant="ghost" size="sm" className="gap-2">
                View all
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : needsActionEvents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">All caught up! 🎉</div>
        ) : (
          <div className="space-y-2">
            {needsActionEvents.map((event) => {
              const Icon = getEventIcon(event)
              const title = getEventTitle(event)
              const url = getEventUrl(event)
              const repoName = getRepoName(event)
              
              return (
                <a
                  key={event.id}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 hover:border-primary/50 hover:bg-accent/50 transition-colors cursor-pointer group"
                >
                  <div className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
                    event.type === "github.pr.review_requested" ? "bg-orange-500/10 text-orange-600" :
                    event.type.startsWith("github.pr.") ? "bg-blue-500/10 text-blue-600" :
                    "bg-green-500/10 text-green-600"
                  )}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                      {title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      <span className="font-mono">{repoName}</span>
                      <span className="mx-1">•</span>
                      {formatTime(event.timestamp)}
                    </p>
                  </div>
                  <Badge 
                    variant={event.type === "github.pr.review_requested" ? "default" : "secondary"}
                    className="ml-2 shrink-0"
                  >
                    {event.type === "github.pr.review_requested" ? "Review" : 
                     event.type.startsWith("github.pr.") ? "PR" : "Issue"}
                  </Badge>
                </a>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}







