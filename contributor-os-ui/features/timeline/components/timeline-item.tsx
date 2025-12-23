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
import { GitPullRequest, CircleDot, MessageSquare, GitMerge, Eye, ArrowUpRight, GitCommit, StickyNote, Clock } from "lucide-react"
import type { AppEvent, PullRequestEvent, IssueEvent, CommentEvent, ReviewEvent } from "@/types/events"

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
  "github.commit.pushed": { icon: GitCommit, color: "text-blue-500", label: "Commit" },
  "note.created": { icon: StickyNote, color: "text-yellow-500", label: "Note" },
  "note.updated": { icon: StickyNote, color: "text-yellow-500", label: "Note Updated" },
}

export function TimelineItem({ event }: TimelineItemProps) {
  const config = typeConfig[event.type] || { icon: GitPullRequest, color: "text-muted-foreground", label: "Event" }
  const Icon = config.icon

  // Determine if event needs action - ONLY for OPEN PRs and OPEN issues
  let needsAction = false
  if (event.type === "github.pr.opened" || event.type === "github.pr.review_requested") {
    if ("pullRequest" in event) {
      const prEvent = event as PullRequestEvent
      // Only show needs action if PR is actually OPEN (not merged or closed)
      needsAction = prEvent.pullRequest.state === "open"
    }
  } else if (event.type === "github.issue.opened") {
    if ("issue" in event) {
      const issueEvent = event as IssueEvent
      // Only show needs action if issue is actually OPEN (not closed)
      needsAction = issueEvent.issue.state === "open"
    }
  }

  // Format timestamp - show both relative time and actual date
  const formatTime = (date: Date) => {
    const now = new Date()
    const diffTime = now.getTime() - date.getTime()
    const diffMinutes = Math.floor(diffTime / (1000 * 60))
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    // Show relative time
    let relativeTime = ""
    if (diffMinutes < 1) relativeTime = "Just now"
    else if (diffMinutes < 60) relativeTime = `${diffMinutes}m ago`
    else if (diffHours < 24) relativeTime = `${diffHours}h ago`
    else if (diffDays < 7) relativeTime = `${diffDays}d ago`
    else relativeTime = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

    // Show full date/time
    const fullDate = date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
    })
    const fullTime = date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })

    return { relativeTime, fullDate, fullTime }
  }

  const timeInfo = formatTime(event.timestamp)

  // Get repository name from event
  const repoName = "repository" in event ? event.repository.fullName : "Unknown"

  // PR state badge colors (like GitHub)
  const prStateColors = {
    merged: "bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30",
    closed: "bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30",
    open: "bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30",
  }

  const prStateLabels = {
    merged: "Merged",
    closed: "Closed",
    open: "Open",
  }

  // Get title and details from event based on type
  let title = "Event"
  let subtitle = ""
  let eventUrl = "#"
  let prNumber: number | undefined
  let issueNumber: number | undefined
  let prState: "open" | "closed" | "merged" | undefined
  let issueState: "open" | "closed" | undefined

  if (event.type.startsWith("github.pr.")) {
    const prEvent = event as PullRequestEvent
    prNumber = prEvent.pullRequest.number
    // Use PR title as the main heading, fallback to PR number if title is missing
    title = prEvent.pullRequest.title || `PR #${prNumber}`
    eventUrl = prEvent.pullRequest.url
    prState = prEvent.pullRequest.state
    // Subtitle only shows repository info, not PR number (number shown in badge)
    subtitle = ""
  } else if (event.type.startsWith("github.issue.")) {
    const issueEvent = event as IssueEvent
    issueNumber = issueEvent.issue.number
    // Use issue title as the main heading, fallback to issue number if title is missing
    title = issueEvent.issue.title || `Issue #${issueNumber}`
    eventUrl = issueEvent.issue.url
    issueState = issueEvent.issue.state
    subtitle = ""
  } else if (event.type === "github.comment.created" || event.type === "github.comment.updated") {
    const commentEvent = event as CommentEvent
    const associatedType = commentEvent.comment.associatedWith.type === "pr" ? "PR" : "Issue"
    const associatedNumber = commentEvent.comment.associatedWith.number
    title = `Commented on ${associatedType} #${associatedNumber}`
    eventUrl = commentEvent.comment.url
    subtitle = ""
  } else if (event.type === "github.pr.reviewed") {
    const reviewEvent = event as ReviewEvent
    prNumber = reviewEvent.review.pullRequestNumber
    title = reviewEvent.review.pullRequestTitle
    eventUrl = reviewEvent.review.url
    subtitle = ""
  } else if ((event.type as string) === "github.commit.pushed") {
    const commitMessage = (event as any).metadata?.commitMessage || "Commit"
    prNumber = (event as any).metadata?.prNumber
    title = commitMessage.length > 80 ? commitMessage.substring(0, 80) + "..." : commitMessage
    eventUrl = (event as any).metadata?.prUrl || "#"
    subtitle = ""
  } else if (event.type === "note.created" || event.type === "note.updated") {
    const noteTitle = (event as any).metadata?.noteTitle || "Note"
    const linkedPr = (event as any).metadata?.linkedPrNumber
    const linkedIssue = (event as any).metadata?.linkedIssueNumber
    const repo = (event as any).repository?.fullName
    
    if (linkedPr && repo) {
      title = noteTitle
      eventUrl = `https://github.com/${repo}/pull/${linkedPr}`
      subtitle = ""
    } else if (linkedIssue && repo) {
      title = noteTitle
      eventUrl = `https://github.com/${repo}/issues/${linkedIssue}`
      subtitle = ""
    } else {
      title = noteTitle
      eventUrl = "#"
    }
  }

  return (
    <div
      className={cn(
        "group relative flex items-start gap-4 rounded-xl border border-border bg-card p-5 transition-all",
        "hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5",
        needsAction && "border-l-4 border-l-primary bg-primary/5",
      )}
    >
      {/* Icon */}
      <div className={cn(
        "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
        "bg-secondary/50 backdrop-blur-sm",
        config.color
      )}>
        <Icon className="h-5 w-5" />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-start gap-2">
              <a
                href={eventUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block group/link flex-1"
              >
                <h3 className="text-lg font-semibold text-foreground group-hover/link:text-primary transition-colors leading-snug">
                  {title}
                </h3>
              </a>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
              <span className="font-mono text-xs bg-muted/50 px-2 py-0.5 rounded">
                {repoName}
              </span>
              {prNumber && (
                <>
                  <span className="text-muted-foreground/60">•</span>
                  <span className="text-xs">#{prNumber}</span>
                </>
              )}
              {issueNumber && (
                <>
                  <span className="text-muted-foreground/60">•</span>
                  <span className="text-xs">#{issueNumber}</span>
                </>
              )}
              <span className="text-muted-foreground/60">•</span>
              <span className="flex items-center gap-1" title={`${timeInfo.fullDate} at ${timeInfo.fullTime}`}>
                <Clock className="h-3 w-3" />
                <span>{timeInfo.relativeTime}</span>
              </span>
              {timeInfo.fullDate !== timeInfo.relativeTime && (
                <>
                  <span className="text-muted-foreground/60">•</span>
                  <span className="text-xs">{timeInfo.fullDate}</span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {/* PR State Badge */}
            {prState && (
              <Badge className={cn("text-xs border", prStateColors[prState])}>
                {prStateLabels[prState]}
              </Badge>
            )}
            {/* Issue State Badge */}
            {issueState && (
              <Badge className={cn(
                "text-xs border",
                issueState === "open" 
                  ? "bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30"
                  : "bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30"
              )}>
                {issueState === "open" ? "Open" : "Closed"}
              </Badge>
            )}
            {/* Needs Action Badge - only for open PRs/issues */}
            {needsAction && (
              <Badge className="bg-primary/20 text-primary hover:bg-primary/30 border-primary/30">
                Needs Action
              </Badge>
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







