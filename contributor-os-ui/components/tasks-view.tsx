"use client"

import { useMemo } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, GitPullRequest, CircleDot, ExternalLink, MoreHorizontal, Calendar, Loader2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useTasks } from "@/hooks/queries/use-tasks"
import type { Task } from "@/types"

const statusColors = {
  pending: "bg-chart-1/20 text-chart-1",
  waiting: "bg-chart-3/20 text-chart-3",
  done: "bg-muted text-muted-foreground",
}

const statusLabels = {
  pending: "Pending",
  waiting: "Waiting",
  done: "Done",
}

// PR state tags
const prStateColors = {
  merged: "bg-primary/20 text-primary",
  closed: "bg-muted/20 text-muted-foreground",
  open: "bg-chart-1/20 text-chart-1",
}

const prStateLabels = {
  merged: "Merged",
  closed: "Closed",
  open: "Open",
}

export function TasksView() {
  console.log("[TasksView] Component rendering...")
  const { data: tasks = [], isLoading, error } = useTasks()

  // Debug logging
  console.log("[TasksView] State:", { 
    isLoading, 
    error: error?.message, 
    tasksCount: tasks?.length || 0,
    tasks: tasks?.slice(0, 3) // Log first 3 tasks
  })

  // Convert Task type to display format
  const displayTasks = useMemo(() => {
    return tasks.map((task: Task) => ({
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
  }, [tasks])

  const incompleteTasks = displayTasks.filter((t) => !t.completed)
  const completedTasks = displayTasks.filter((t) => t.completed)

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
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Tasks</h2>
          <p className="text-sm text-muted-foreground">
            {incompleteTasks.length} {incompleteTasks.length === 1 ? "task" : "tasks"} remaining
            {displayTasks.length > 0 && ` • ${displayTasks.length} total from open source PRs`}
          </p>
        </div>
        <Button className="gap-2" disabled>
          <Plus className="h-4 w-4" />
          Add Task
        </Button>
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
        
        {/* PR State Tag (Merged/Closed/Open) */}
        {task.prState && (
          <Badge className={cn("text-xs", prStateColors[task.prState])}>
            {prStateLabels[task.prState]}
          </Badge>
        )}
        
        {/* Conflicts Tag */}
        {task.hasConflicts && (
          <Badge className="text-xs bg-destructive/20 text-destructive border-destructive/50">
            Conflicts
          </Badge>
        )}
        
        {/* Review State Tag */}
        {task.reviewState === "pending_review" && (
          <Badge className="text-xs bg-chart-5/20 text-chart-5">
            Pending Review
          </Badge>
        )}
        {task.reviewState === "draft" && (
          <Badge className="text-xs bg-muted/20 text-muted-foreground">
            Draft
          </Badge>
        )}
        
        {/* Task Status Badge */}
        <Badge className={cn("text-xs", statusColors[task.status])}>
          {statusLabels[task.status]}
        </Badge>
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
