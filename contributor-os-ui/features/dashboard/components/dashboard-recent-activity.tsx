/**
 * DASHBOARD RECENT ACTIVITY
 * 
 * Shows preview of recent activity from timeline (GitHub-like activity feed).
 * Displays recent events across all repositories.
 */

"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Activity, ArrowRight, GitPullRequest, CircleDot, MessageSquare, GitMerge, Eye, Clock } from "lucide-react"
import Link from "next/link"
import { useEvents } from "@/hooks/queries/use-events"
import type { AppEvent, PullRequestEvent, IssueEvent, CommentEvent, ReviewEvent } from "@/types/events"
import { cn } from "@/lib/utils"

export function DashboardRecentActivity() {
  // Fetch recent events (limit to 10 most recent)
  const { data: events = [], isLoading } = useEvents()
  const recentActivity = events.slice(0, 10)

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
      // Show PR title (name) with number
      return `${prEvent.pullRequest.title}`
    } else if (event.type.startsWith("github.issue.")) {
      const issueEvent = event as IssueEvent
      return `${issueEvent.issue.title}`
    } else if (event.type === "github.comment.created" || event.type === "github.comment.updated") {
      const commentEvent = event as CommentEvent
      return `Commented on ${commentEvent.comment.associatedWith.type === "pr" ? "PR" : "Issue"} #${commentEvent.comment.associatedWith.number}`
    } else if (event.type === "github.pr.reviewed") {
      const reviewEvent = event as ReviewEvent
      return `${reviewEvent.review.pullRequestTitle}`
    }
    return "Event"
  }

  const getEventSubtitle = (event: AppEvent): string => {
    if (event.type.startsWith("github.pr.")) {
      const prEvent = event as PullRequestEvent
      const state = prEvent.pullRequest.state === "merged" ? "merged" : 
                    prEvent.pullRequest.state === "closed" ? "closed" : 
                    "open"
      return `PR #${prEvent.pullRequest.number} • ${state}`
    } else if (event.type.startsWith("github.issue.")) {
      const issueEvent = event as IssueEvent
      return `Issue #${issueEvent.issue.number} • ${issueEvent.issue.state}`
    } else if (event.type === "github.pr.reviewed") {
      const reviewEvent = event as ReviewEvent
      return `PR #${reviewEvent.review.pullRequestNumber} • ${reviewEvent.review.state}`
    }
    return ""
  }

  const getEventUrl = (event: AppEvent): string => {
    if (event.type === "github.pr.reviewed") {
      const reviewEvent = event as ReviewEvent
      return reviewEvent.review.url
    } else if (event.type.startsWith("github.pr.")) {
      const prEvent = event as PullRequestEvent
      return prEvent.pullRequest.url
    } else if (event.type.startsWith("github.issue.")) {
      const issueEvent = event as IssueEvent
      return issueEvent.issue.url
    } else if (event.type === "github.comment.created" || event.type === "github.comment.updated") {
      const commentEvent = event as CommentEvent
      return commentEvent.comment.url
    }
    return "#"
  }

  const getEventIcon = (event: AppEvent) => {
    if (event.type === "github.pr.merged") return GitMerge
    if (event.type === "github.pr.review_requested" || event.type === "github.pr.reviewed") return Eye
    if (event.type.startsWith("github.pr.")) return GitPullRequest
    if (event.type.startsWith("github.issue.")) return CircleDot
    if (event.type.startsWith("github.comment.")) return MessageSquare
    return Activity
  }

  const getEventColor = (event: AppEvent): string => {
    if (event.type === "github.pr.merged") return "text-purple-600 bg-purple-500/10"
    if (event.type === "github.pr.review_requested" || event.type === "github.pr.reviewed") return "text-orange-600 bg-orange-500/10"
    if (event.type.startsWith("github.pr.")) return "text-blue-600 bg-blue-500/10"
    if (event.type.startsWith("github.issue.")) return "text-green-600 bg-green-500/10"
    if (event.type.startsWith("github.comment.")) return "text-gray-600 bg-gray-500/10"
    return "text-muted-foreground bg-muted"
  }

  const getEventBadge = (event: AppEvent): string => {
    if (event.type === "github.pr.merged") return "Merged"
    if (event.type === "github.pr.closed") return "Closed"
    if (event.type === "github.pr.review_requested") return "Review"
    if (event.type === "github.pr.reviewed") return "Reviewed"
    if (event.type.startsWith("github.pr.")) return "PR"
    if (event.type === "github.issue.closed") return "Closed"
    if (event.type.startsWith("github.issue.")) return "Issue"
    if (event.type.startsWith("github.comment.")) return "Comment"
    return "Event"
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
              <Activity className="h-5 w-5 text-primary" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest updates from your repositories</CardDescription>
          </div>
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              View Timeline
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : recentActivity.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No recent activity</p>
            <p className="text-sm mt-1">Start contributing to see your activity here!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentActivity.map((event) => {
              const Icon = getEventIcon(event)
              const title = getEventTitle(event)
              const subtitle = getEventSubtitle(event)
              const url = getEventUrl(event)
              const repoName = getRepoName(event)
              const colorClass = getEventColor(event)
              const badgeText = getEventBadge(event)
              
              return (
                <a
                  key={event.id}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 rounded-lg border border-border bg-card p-3 hover:border-primary/50 hover:bg-accent/50 transition-colors cursor-pointer group"
                >
                  <div className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-md mt-0.5",
                    colorClass
                  )}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                      {title}
                    </p>
                    {subtitle && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {subtitle}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs text-muted-foreground font-mono">{repoName}</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(event.timestamp)}
                      </span>
                    </div>
                  </div>
                  <Badge 
                    variant={event.type === "github.pr.merged" ? "default" : "secondary"}
                    className="ml-2 shrink-0"
                  >
                    {badgeText}
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







