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

  // TODO: Determine if event needs action based on event type and metadata
  const needsAction = false // Placeholder

  // TODO: Format timestamp properly
  const formattedTime = event.timestamp.toLocaleString()

  // TODO: Get repository name from event
  const repoName = "github" in event ? event.repository.fullName : "Unknown"

  // TODO: Get title from event based on type
  const title = "Event"

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
            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowUpRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}







