"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Filter } from "lucide-react"
import { TimelineItem, type TimelineItemProps, type ActivityType } from "./timeline-item"

const filters = ["All", "Needs Action", "PRs", "Issues", "Reviews"]

interface TimelineViewProps {
  items?: TimelineItemProps[]
  onLoadMore?: () => void
  hasMore?: boolean
}

const mockTimeline: TimelineItemProps[] = [
  {
    id: "1",
    type: "pr",
    title: "fix: resolve hydration mismatch in App Router",
    repo: "vercel/next.js",
    author: "you",
    timestamp: "2 min ago",
    status: "review_requested",
    needsAction: true,
    url: "https://github.com/vercel/next.js/pull/12345",
  },
  {
    id: "2",
    type: "comment",
    title: "@contributor mentioned you in #45892",
    repo: "facebook/react",
    author: "gaearon",
    timestamp: "15 min ago",
    needsAction: true,
    url: "https://github.com/facebook/react/issues/45892",
  },
  {
    id: "3",
    type: "merge",
    title: "feat: add new useOptimistic hook",
    repo: "facebook/react",
    author: "acdlite",
    timestamp: "1 hour ago",
    url: "https://github.com/facebook/react/pull/12346",
  },
  {
    id: "4",
    type: "review",
    title: "Changes requested on your PR #1234",
    repo: "tailwindlabs/tailwindcss",
    author: "adamwathan",
    timestamp: "2 hours ago",
    needsAction: true,
    url: "https://github.com/tailwindlabs/tailwindcss/pull/1234",
  },
  {
    id: "5",
    type: "issue",
    title: "Bug: CSS modules not working with turbopack",
    repo: "vercel/next.js",
    author: "you",
    timestamp: "3 hours ago",
    status: "open",
    url: "https://github.com/vercel/next.js/issues/12347",
  },
  {
    id: "6",
    type: "pr",
    title: "docs: update migration guide for v14",
    repo: "vercel/next.js",
    author: "leerob",
    timestamp: "5 hours ago",
    url: "https://github.com/vercel/next.js/pull/12348",
  },
]

export function TimelineView({ items = mockTimeline, onLoadMore, hasMore = false }: TimelineViewProps) {
  const [activeFilter, setActiveFilter] = useState("All")

  const filteredItems = items.filter((item) => {
    if (activeFilter === "All") return true
    if (activeFilter === "Needs Action") return item.needsAction
    if (activeFilter === "PRs") return item.type === "pr"
    if (activeFilter === "Issues") return item.type === "issue"
    if (activeFilter === "Reviews") return item.type === "review"
    return true
  })

  const needsActionCount = items.filter((item) => item.needsAction).length

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
                className={
                  activeFilter === filter ? "bg-secondary text-secondary-foreground text-sm" : "text-sm"
                }
              >
                {filter}
                {filter === "Needs Action" && needsActionCount > 0 && (
                  <Badge variant="destructive" className="ml-2 h-5 px-1.5">
                    {needsActionCount}
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
        {filteredItems.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
            No timeline items found
          </div>
        ) : (
          filteredItems.map((item) => <TimelineItem key={item.id} {...item} />)
        )}
      </div>

      {/* Load More */}
      {(hasMore || onLoadMore) && (
        <div className="flex justify-center pt-4">
          <Button variant="outline" className="text-muted-foreground bg-transparent" onClick={onLoadMore}>
            Load more activity
          </Button>
        </div>
      )}
    </div>
  )
}
