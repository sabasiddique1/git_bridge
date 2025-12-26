"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GitPullRequest, CircleDot, MessageSquare, GitMerge, Eye, ArrowUpRight, LucideIcon } from "lucide-react"

export type ActivityType = "pr" | "issue" | "comment" | "review" | "merge"

export interface TimelineItemProps {
  id: string
  type: ActivityType
  title: string
  repo: string
  author: string
  timestamp: string
  status?: string
  needsAction?: boolean
  url?: string
  onClick?: () => void
}

const typeConfig: Record<ActivityType, { icon: LucideIcon; color: string; label: string }> = {
  pr: { icon: GitPullRequest, color: "text-chart-1", label: "Pull Request" },
  issue: { icon: CircleDot, color: "text-chart-3", label: "Issue" },
  comment: { icon: MessageSquare, color: "text-chart-2", label: "Comment" },
  review: { icon: Eye, color: "text-chart-5", label: "Review" },
  merge: { icon: GitMerge, color: "text-primary", label: "Merged" },
}

export function TimelineItem({
  id,
  type,
  title,
  repo,
  author,
  timestamp,
  status,
  needsAction,
  url,
  onClick,
}: TimelineItemProps) {
  const config = typeConfig[type]
  const Icon = config.icon

  const handleClick = () => {
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer")
    } else if (onClick) {
      onClick()
    }
  }

  return (
    <div
      className={cn(
        "group relative flex items-start gap-4 rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-[0_0_15px_rgba(var(--glow))]",
        needsAction && "border-l-2 border-l-primary",
        (url || onClick) && "cursor-pointer",
      )}
      onClick={handleClick}
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
              <span className="font-mono text-xs">{repo}</span>
              <span>•</span>
              <span>by {author}</span>
              <span>•</span>
              <span>{timestamp}</span>
              {status && (
                <>
                  <span>•</span>
                  <span className="text-xs capitalize">{status.replace("_", " ")}</span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {needsAction && (
              <Badge className="bg-primary/20 text-primary hover:bg-primary/30">Needs Action</Badge>
            )}
            {(url || onClick) && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation()
                  handleClick()
                }}
              >
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
