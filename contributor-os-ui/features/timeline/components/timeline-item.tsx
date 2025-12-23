/**
 * TIMELINE ITEM
 * 
 * Renders individual timeline events.
 * 
 * TODO: Support all event types with proper rendering
 * TODO: Add click handlers to navigate to GitHub
 * TODO: Add action buttons (review, comment, etc.)
 */

"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GitPullRequest, CircleDot, MessageSquare, GitMerge, Eye, ArrowUpRight } from "lucide-react"
import type { AppEvent } from "@/types/events"

export type ActivityType = "pr" | "issue" | "comment" | "review" | "merge"

interface TimelineItemProps {
  event: AppEvent
}

const typeConfig: Record<string, { icon: typeof GitPullRequest; color: string; label: string }> = {
  "github.pr.opened": { icon: GitPullRequest, color: "text-chart-1", label: "Pull Request" },
  "github.pr.closed": { icon: GitPullRequest, color: "text-chart-1", label: "Pull Request" },
  "github.pr.merged": { icon: GitMerge, color: "text-primary", label: "Merged" },
  "github.pr.review_requested": { icon: Eye, color: "text-chart-5", label: "Review Requested" },
  "github.pr.reviewed": { icon: Eye, color: "text-chart-5", label: "Review" },
  "github.issue.opened": { icon: CircleDot, color: "text-chart-3", label: "Issue" },
  "github.issue.closed": { icon: CircleDot, color: "text-chart-3", label: "Issue" },
  "github.comment.created": { icon: MessageSquare, color: "text-chart-2", label: "Comment" },
  "github.comment.updated": { icon: MessageSquare, color: "text-chart-2", label: "Comment" },
}

export function TimelineItem({ event }: TimelineItemProps) {
  const config = typeConfig[event.type] || { icon: GitPullRequest, color: "text-muted-foreground", label: "Event" }
  const Icon = config.icon

  // Determine if event needs action
  const needsAction = 
    event.type === "github.pr.opened" || 
    event.type === "github.pr.review_requested" ||
    event.type === "github.issue.opened"

  // Format timestamp
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

  const formattedTime = formatTime(event.timestamp)

  // Get repository name from event
  const repoName = "repository" in event ? event.repository.fullName : "Unknown"

  // Get title from event based on type
  let title = "Event"
  let eventUrl = "#"

  if (event.type.startsWith("github.pr.")) {
    const prEvent = event as PullRequestEvent
    title = prEvent.pullRequest.title
    eventUrl = prEvent.pullRequest.url
  } else if (event.type.startsWith("github.issue.")) {
    const issueEvent = event as IssueEvent
    title = issueEvent.issue.title
    eventUrl = issueEvent.issue.url
  } else if (event.type === "github.comment.created" || event.type === "github.comment.updated") {
    const commentEvent = event as CommentEvent
    title = `Commented on ${commentEvent.comment.associatedWith.type === "pr" ? "PR" : "Issue"} #${commentEvent.comment.associatedWith.number}: ${commentEvent.comment.associatedWith.title}`
    eventUrl = commentEvent.comment.url
  } else if (event.type === "github.pr.reviewed") {
    const reviewEvent = event as ReviewEvent
    title = `Reviewed PR #${reviewEvent.review.pullRequestNumber}: ${reviewEvent.review.pullRequestTitle}`
    eventUrl = reviewEvent.review.url
  }

  return (
    <div
      className={cn(
        "group relative flex items-start gap-4 rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-[0_0_15px_rgba(var(--glow))]",
        needsAction && "border-l-2 border-l-primary",
      )}
    >
      {/* Icon */}
      <div className={cn("mt-0.5 flex h-8 w-8 items-center justify-center rounded-md bg-secondary", config.color)}>
        <Icon className="h-4 w-4" />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="font-medium text-foreground group-hover:text-primary transition-colors">{title}</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-mono text-xs">{repoName}</span>
              <span>•</span>
              <span>{formattedTime}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {needsAction && (
              <Badge className="bg-primary/20 text-primary hover:bg-primary/30">Needs Action</Badge>
            )}
            <a 
              href={eventUrl} 
              target="_blank"
              rel="noopener noreferrer"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}







