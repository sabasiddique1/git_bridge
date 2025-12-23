"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, GitPullRequest, CircleDot, ExternalLink, MoreHorizontal, Calendar } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Task {
  id: string
  title: string
  type: "pr" | "issue" | "custom"
  repo?: string
  priority: "high" | "medium" | "low"
  dueDate?: string
  completed: boolean
  linkedUrl?: string
}

const mockTasks: Task[] = [
  {
    id: "1",
    title: "Address review comments on hydration fix",
    type: "pr",
    repo: "vercel/next.js",
    priority: "high",
    dueDate: "Today",
    completed: false,
    linkedUrl: "#",
  },
  {
    id: "2",
    title: "Write tests for useOptimistic hook",
    type: "pr",
    repo: "facebook/react",
    priority: "high",
    completed: false,
    linkedUrl: "#",
  },
  {
    id: "3",
    title: "Investigate turbopack CSS modules bug",
    type: "issue",
    repo: "vercel/next.js",
    priority: "medium",
    dueDate: "Tomorrow",
    completed: false,
    linkedUrl: "#",
  },
  {
    id: "4",
    title: "Review migration guide PR",
    type: "pr",
    repo: "vercel/next.js",
    priority: "low",
    completed: true,
    linkedUrl: "#",
  },
  {
    id: "5",
    title: "Update personal README with new contributions",
    type: "custom",
    priority: "low",
    completed: false,
  },
]

const priorityColors = {
  high: "bg-destructive/20 text-destructive",
  medium: "bg-chart-3/20 text-chart-3",
  low: "bg-muted text-muted-foreground",
}

export function TasksView() {
  const [tasks, setTasks] = useState(mockTasks)

  const toggleTask = (id: string) => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)))
  }

  const incompleteTasks = tasks.filter((t) => !t.completed)
  const completedTasks = tasks.filter((t) => t.completed)

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Tasks</h2>
          <p className="text-sm text-muted-foreground">{incompleteTasks.length} tasks remaining</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Task
        </Button>
      </div>

      {/* Task List */}
      <div className="space-y-2">
        {incompleteTasks.map((task) => (
          <TaskItem key={task.id} task={task} onToggle={toggleTask} />
        ))}
      </div>

      {/* Completed Section */}
      {completedTasks.length > 0 && (
        <div className="space-y-2 pt-4">
          <p className="text-sm font-medium text-muted-foreground">Completed ({completedTasks.length})</p>
          {completedTasks.map((task) => (
            <TaskItem key={task.id} task={task} onToggle={toggleTask} />
          ))}
        </div>
      )}
    </div>
  )
}

function TaskItem({ task, onToggle }: { task: Task; onToggle: (id: string) => void }) {
  const TypeIcon = task.type === "pr" ? GitPullRequest : task.type === "issue" ? CircleDot : null

  return (
    <div
      className={cn(
        "group flex items-center gap-4 rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/50",
        task.completed && "opacity-60",
      )}
    >
      <Checkbox checked={task.completed} onCheckedChange={() => onToggle(task.id)} className="h-5 w-5" />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {TypeIcon && <TypeIcon className={cn("h-4 w-4", task.type === "pr" ? "text-chart-1" : "text-chart-3")} />}
          <span className={cn("font-medium text-foreground", task.completed && "line-through")}>{task.title}</span>
          {task.linkedUrl && (
            <a href={task.linkedUrl} className="opacity-0 group-hover:opacity-100 transition-opacity">
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
            </a>
          )}
        </div>
        {task.repo && <p className="mt-1 text-xs font-mono text-muted-foreground">{task.repo}</p>}
      </div>

      <div className="flex items-center gap-2">
        {task.dueDate && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {task.dueDate}
          </span>
        )}
        <Badge className={cn("text-xs", priorityColors[task.priority])}>{task.priority}</Badge>
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
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem>Change Priority</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
