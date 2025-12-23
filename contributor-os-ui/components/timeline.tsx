"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GitPullRequest, CircleDot, MessageSquare, GitMerge, Eye, Clock, Filter, ArrowUpRight } from "lucide-react"

type ActivityType = "pr" | "issue" | "comment" | "review" | "merge"

interface TimelineItem {
  id: string
  type: ActivityType
  title: string
  repo: string
  author: string
  timestamp: string
  status?: string
  needsAction?: boolean
}

const mockTimeline: TimelineItem[] = [
  {
    id: "1",
    type: "pr",
    title: "fix: resolve hydration mismatch in App Router",
    repo: "vercel/next.js",
    author: "you",
    timestamp: "2 min ago",
    status: "review_requested",
    needsAction: true,
  },
  {
    id: "2",
    type: "comment",
    title: "@contributor mentioned you in #45892",
    repo: "facebook/react",
    author: "gaearon",
    timestamp: "15 min ago",
    needsAction: true,
  },
  {
    id: "3",
    type: "merge",
    title: "feat: add new useOptimistic hook",
    repo: "facebook/react",
    author: "acdlite",
    timestamp: "1 hour ago",
  },
  {
    id: "4",
    type: "review",
    title: "Changes requested on your PR #1234",
    repo: "tailwindlabs/tailwindcss",
    author: "adamwathan",
    timestamp: "2 hours ago",
    needsAction: true,
  },
  {
    id: "5",
    type: "issue",
    title: "Bug: CSS modules not working with turbopack",
    repo: "vercel/next.js",
    author: "you",
    timestamp: "3 hours ago",
    status: "open",
  },
  {
    id: "6",
    type: "pr",
    title: "docs: update migration guide for v14",
    repo: "vercel/next.js",
    author: "leerob",
    timestamp: "5 hours ago",
  },
]

const typeConfig: Record<ActivityType, { icon: typeof GitPullRequest; color: string; label: string }> = {
  pr: { icon: GitPullRequest, color: "text-chart-1", label: "Pull Request" },
  issue: { icon: CircleDot, color: "text-chart-3", label: "Issue" },
  comment: { icon: MessageSquare, color: "text-chart-2", label: "Comment" },
  review: { icon: Eye, color: "text-chart-5", label: "Review" },
  merge: { icon: GitMerge, color: "text-primary", label: "Merged" },
}

const filters = ["All", "Needs Action", "PRs", "Issues", "Reviews"]

export function Timeline() {
  const [activeFilter, setActiveFilter] = useState("All")

  const filteredItems = mockTimeline.filter((item) => {
    if (activeFilter === "All") return true
    if (activeFilter === "Needs Action") return item.needsAction
    if (activeFilter === "PRs") return item.type === "pr"
    if (activeFilter === "Issues") return item.type === "issue"
    if (activeFilter === "Reviews") return item.type === "review"
    return true
  })

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
                    3
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
      <div className="space-y-2">
        {filteredItems.map((item) => {
          const config = typeConfig[item.type]
          const Icon = config.icon
          return (
            <div
              key={item.id}
              className={cn(
                "group relative flex items-start gap-4 rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-[0_0_15px_rgba(var(--glow))]",
                item.needsAction && "border-l-2 border-l-primary",
              )}
            >
              {/* Icon */}
              <div
                className={cn("mt-0.5 flex h-8 w-8 items-center justify-center rounded-md bg-secondary", config.color)}
              >
                <Icon className="h-4 w-4" />
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                      {item.title}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="font-mono text-xs">{item.repo}</span>
                      <span>•</span>
                      <span>by {item.author}</span>
                      <span>•</span>
                      <span>{item.timestamp}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.needsAction && (
                      <Badge className="bg-primary/20 text-primary hover:bg-primary/30">Needs Action</Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ArrowUpRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Load More */}
      <div className="flex justify-center pt-4">
        <Button variant="outline" className="text-muted-foreground bg-transparent">
          Load more activity
        </Button>
      </div>
    </div>
  )
}
