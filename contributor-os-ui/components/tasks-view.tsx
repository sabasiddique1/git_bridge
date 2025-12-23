"use client"

import { useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, GitPullRequest, CircleDot, ExternalLink, MoreHorizontal, Calendar, Loader2, Filter, X, CheckCircle2, AlertCircle, GitMerge, GitBranch, Eye, FileCode } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTasks } from "@/hooks/queries/use-tasks"
import type { Task } from "@/types"

const statusColors = {
  pending: "bg-green-500/20 text-green-600 dark:text-green-400", // Green for pending/open
  waiting: "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400", // Yellow for waiting
  done: "bg-purple-500/20 text-purple-600 dark:text-purple-400", // Purple for done/merged
}

const statusLabels = {
  pending: "Pending",
  waiting: "Waiting",
  done: "Done",
}

// PR state tags - GitHub color scheme
const prStateColors = {
  merged: "bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30", // Purple like GitHub
  closed: "bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30", // Red like GitHub
  open: "bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30", // Green like GitHub
}

const prStateLabels = {
  merged: "Merged",
  closed: "Closed",
  open: "Open",
}

interface TaskFilters {
  prState: "all" | "open" | "closed" | "merged"
  hasConflicts: "all" | "yes" | "no"
  reviewState: "all" | "pending_review" | "draft" | "none"
  repository: string
  language: string
}

export function TasksView() {
  console.log("[TasksView] Component rendering...")
  const { data: tasks = [], isLoading, error } = useTasks()

  // Filter state
  const [filters, setFilters] = useState<TaskFilters>({
    prState: "all",
    hasConflicts: "all",
    reviewState: "all",
    repository: "all",
    language: "all",
  })

  // Debug logging
  console.log("[TasksView] State:", { 
    isLoading, 
    error: error?.message, 
    tasksCount: tasks?.length || 0,
    filters,
  })

  // Get unique repositories and languages from tasks
  const repositories = useMemo(() => {
    const repos = new Set<string>()
    tasks.forEach((task: Task) => {
      if (task.linkedRepo) repos.add(task.linkedRepo)
    })
    return Array.from(repos).sort()
  }, [tasks])

  const languages = useMemo(() => {
    // Languages would come from repository data - for now return empty
    // TODO: Add language to Task type when fetching from API
    return []
  }, [tasks])

  // Convert Task type to display format
  const displayTasks = useMemo(() => {
    let filtered = tasks.map((task: Task) => ({
      id: task.id,
      title: task.title,
      type: task.linkedPrNumber ? "pr" as const : task.linkedIssueNumber ? "issue" as const : "custom" as const,
      repo: task.linkedRepo,
      status: task.status,
      completed: task.status === "done",
      linkedUrl: task.linkedPrNumber && task.linkedRepo
        ? `https://github.com/${task.linkedRepo}/pull/${task.linkedPrNumber}`
        : undefined,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      prState: task.prState,
      hasConflicts: task.hasConflicts,
      reviewState: task.reviewState,
    }))

    // Apply filters
    if (filters.prState !== "all") {
      filtered = filtered.filter((t) => t.prState === filters.prState)
    }

    if (filters.hasConflicts !== "all") {
      if (filters.hasConflicts === "yes") {
        filtered = filtered.filter((t) => t.hasConflicts === true)
      } else {
        filtered = filtered.filter((t) => !t.hasConflicts)
      }
    }

    if (filters.reviewState !== "all") {
      if (filters.reviewState === "none") {
        filtered = filtered.filter((t) => !t.reviewState)
      } else {
        filtered = filtered.filter((t) => t.reviewState === filters.reviewState)
      }
    }

    if (filters.repository !== "all") {
      filtered = filtered.filter((t) => t.repo === filters.repository)
    }

    return filtered
  }, [tasks, filters])

  const incompleteTasks = displayTasks.filter((t) => !t.completed)
  const completedTasks = displayTasks.filter((t) => t.completed)

  const hasActiveFilters = filters.prState !== "all" || 
                          filters.hasConflicts !== "all" || 
                          filters.reviewState !== "all" || 
                          filters.repository !== "all"

  const clearFilters = () => {
    setFilters({
      prState: "all",
      hasConflicts: "all",
      reviewState: "all",
      repository: "all",
      language: "all",
    })
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <span className="text-muted-foreground">Loading your pull requests...</span>
          <span className="text-xs text-muted-foreground mt-2">This may take a moment</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center">
          <p className="text-sm text-destructive">Failed to load tasks. Please try again.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Tasks</h2>
          <p className="text-sm text-muted-foreground">
            {incompleteTasks.length} {incompleteTasks.length === 1 ? "task" : "tasks"} remaining
            {displayTasks.length > 0 && ` • ${displayTasks.length} total from open source PRs`}
            {hasActiveFilters && ` (filtered)`}
          </p>
        </div>
        <Button className="gap-2" disabled>
          <Plus className="h-4 w-4" />
          Add Task
        </Button>
      </div>

      {/* Filters */}
      <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
              <Filter className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Filter Pull Requests</h3>
              <p className="text-xs text-muted-foreground">
                {hasActiveFilters 
                  ? `${displayTasks.length} PR${displayTasks.length !== 1 ? 's' : ''} match your filters`
                  : `Filter by state, conflicts, review status, or repository`}
              </p>
            </div>
          </div>
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="h-8 gap-1.5 text-xs"
            >
              <X className="h-3.5 w-3.5" />
              Clear All
            </Button>
          )}
        </div>
        
        {/* Active Filters Badges */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 mb-4 pb-4 border-b border-border">
            <span className="text-xs font-medium text-muted-foreground">Active:</span>
            {filters.prState !== "all" && (
              <Badge variant="secondary" className="gap-1.5 h-6 px-2 text-xs">
                <GitBranch className="h-3 w-3" />
                {filters.prState === "open" && "Open"}
                {filters.prState === "closed" && "Closed"}
                {filters.prState === "merged" && "Merged"}
                <button
                  onClick={() => setFilters({ ...filters, prState: "all" })}
                  className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </Badge>
            )}
            {filters.hasConflicts !== "all" && (
              <Badge variant="secondary" className="gap-1.5 h-6 px-2 text-xs">
                <AlertCircle className="h-3 w-3" />
                {filters.hasConflicts === "yes" ? "Has Conflicts" : "No Conflicts"}
                <button
                  onClick={() => setFilters({ ...filters, hasConflicts: "all" })}
                  className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </Badge>
            )}
            {filters.reviewState !== "all" && (
              <Badge variant="secondary" className="gap-1.5 h-6 px-2 text-xs">
                <Eye className="h-3 w-3" />
                {filters.reviewState === "pending_review" && "Pending Review"}
                {filters.reviewState === "draft" && "Draft"}
                {filters.reviewState === "none" && "No Review"}
                <button
                  onClick={() => setFilters({ ...filters, reviewState: "all" })}
                  className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </Badge>
            )}
            {filters.repository !== "all" && (
              <Badge variant="secondary" className="gap-1.5 h-6 px-2 text-xs">
                <FileCode className="h-3 w-3" />
                {filters.repository}
                <button
                  onClick={() => setFilters({ ...filters, repository: "all" })}
                  className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </Badge>
            )}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* PR State Filter */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <GitBranch className="h-3.5 w-3.5 text-muted-foreground" />
              PR State
            </label>
            <Select
              value={filters.prState}
              onValueChange={(value) => setFilters({ ...filters, prState: value as any })}
            >
              <SelectTrigger className="h-10 w-full">
                <SelectValue placeholder="All States" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-muted-foreground" />
                    All States
                  </div>
                </SelectItem>
                <SelectItem value="open">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    Open
                  </div>
                </SelectItem>
                <SelectItem value="closed">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-red-500" />
                    Closed
                  </div>
                </SelectItem>
                <SelectItem value="merged">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-purple-500" />
                    Merged
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Conflicts Filter */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5 text-muted-foreground" />
              Conflicts
            </label>
            <Select
              value={filters.hasConflicts}
              onValueChange={(value) => setFilters({ ...filters, hasConflicts: value as any })}
            >
              <SelectTrigger className="h-10 w-full">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="yes">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-3.5 w-3.5 text-yellow-500" />
                    Has Conflicts
                  </div>
                </SelectItem>
                <SelectItem value="no">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                    No Conflicts
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Review State Filter */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5 text-muted-foreground" />
              Review Status
            </label>
            <Select
              value={filters.reviewState}
              onValueChange={(value) => setFilters({ ...filters, reviewState: value as any })}
            >
              <SelectTrigger className="h-10 w-full">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending_review">
                  <div className="flex items-center gap-2">
                    <Eye className="h-3.5 w-3.5 text-blue-500" />
                    Pending Review
                  </div>
                </SelectItem>
                <SelectItem value="draft">
                  <div className="flex items-center gap-2">
                    <FileCode className="h-3.5 w-3.5 text-muted-foreground" />
                    Draft
                  </div>
                </SelectItem>
                <SelectItem value="none">
                  <div className="flex items-center gap-2">
                    <X className="h-3.5 w-3.5 text-muted-foreground" />
                    No Review
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Repository Filter */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <FileCode className="h-3.5 w-3.5 text-muted-foreground" />
              Repository
            </label>
            <Select
              value={filters.repository}
              onValueChange={(value) => setFilters({ ...filters, repository: value })}
            >
              <SelectTrigger className="h-10 w-full">
                <SelectValue placeholder="All Repositories" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                <SelectItem value="all">All Repositories</SelectItem>
                {repositories.length > 0 ? (
                  repositories.map((repo) => (
                    <SelectItem key={repo} value={repo}>
                      <span className="font-mono text-xs">{repo}</span>
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>No repositories found</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {displayTasks.length === 0 && (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <GitPullRequest className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No tasks found</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Tasks are automatically created from your open source pull requests.
          </p>
          <p className="text-xs text-muted-foreground">
            Create a pull request in an open source repository to see it here.
          </p>
        </div>
      )}

      {/* Task List */}
      {displayTasks.length > 0 && (
        <>
          <div className="space-y-2">
            {incompleteTasks.map((task) => (
              <TaskItem key={task.id} task={task} onToggle={() => {}} />
            ))}
          </div>

          {/* Completed Section */}
          {completedTasks.length > 0 && (
            <div className="space-y-2 pt-4">
              <p className="text-sm font-medium text-muted-foreground">Completed ({completedTasks.length})</p>
              {completedTasks.map((task) => (
                <TaskItem key={task.id} task={task} onToggle={() => {}} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function TaskItem({ task, onToggle }: { 
  task: {
    id: string
    title: string
    type: "pr" | "issue" | "custom"
    repo?: string
    status: "pending" | "waiting" | "done"
    completed: boolean
    linkedUrl?: string
    createdAt: Date | string
    updatedAt: Date | string
  }
  onToggle: (id: string) => void 
}) {
  const TypeIcon = task.type === "pr" ? GitPullRequest : task.type === "issue" ? CircleDot : null
  
  // Format date for display
  const formatDate = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date
    const now = new Date()
    const diffTime = now.getTime() - d.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Yesterday"
    if (diffDays < 7) return `${diffDays} days ago`
    return d.toLocaleDateString()
  }

  return (
    <div
      className={cn(
        "group flex items-center gap-4 rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/50",
        task.completed && "opacity-60",
      )}
    >
      <Checkbox 
        checked={task.completed} 
        onCheckedChange={() => onToggle(task.id)} 
        className="h-5 w-5"
        disabled={task.status === "done"} // Can't uncheck merged PRs
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {TypeIcon && <TypeIcon className={cn("h-4 w-4", task.type === "pr" ? "text-chart-1" : "text-chart-3")} />}
          <span className={cn("font-medium text-foreground", task.completed && "line-through")}>{task.title}</span>
          {task.linkedUrl && (
            <a 
              href={task.linkedUrl} 
              target="_blank"
              rel="noopener noreferrer"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
            </a>
          )}
        </div>
        {task.repo && (
          <p className="mt-1 text-xs font-mono text-muted-foreground">{task.repo}</p>
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          {formatDate(task.updatedAt)}
        </span>
        
        {/* PR State Tag (Merged/Closed/Open) - GitHub colors */}
        {task.prState && (
          <Badge className={cn("text-xs border", prStateColors[task.prState])}>
            {prStateLabels[task.prState]}
          </Badge>
        )}
        
        {/* Conflicts Tag - Yellow like GitHub */}
        {task.hasConflicts && (
          <Badge className="text-xs bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30">
            Conflicts
          </Badge>
        )}
        
        {/* Review State Tag */}
        {task.reviewState === "pending_review" && (
          <Badge className="text-xs bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30">
            Pending Review
          </Badge>
        )}
        {task.reviewState === "draft" && (
          <Badge className="text-xs bg-muted/20 text-muted-foreground">
            Draft
          </Badge>
        )}
        
        {/* Task Status Badge - Commented out for now */}
        {/* <Badge className={cn("text-xs", statusColors[task.status])}>
          {statusLabels[task.status]}
        </Badge> */}
        {task.linkedUrl && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <a href={task.linkedUrl} target="_blank" rel="noopener noreferrer">
                  View on GitHub
                </a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  )
}
