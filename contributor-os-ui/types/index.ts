/**
 * Central type exports
 * TODO: Organize types by domain as the codebase grows
 */

export * from "./events"

/**
 * Repository types
 * TODO: Expand with full GitHub repository structure
 */
export interface Repository {
  id: number
  name: string
  fullName: string
  owner: string
  description?: string
  language?: string
  stars: number
  url: string
  isSubscribed: boolean
  isPinned: boolean
}

/**
 * Task types
 * TODO: Add task priority, due dates, assignees
 */
export interface Task {
  id: string
  title: string
  description?: string
  status: "pending" | "waiting" | "done"
  createdAt: Date
  updatedAt: Date
  linkedEventId?: string
  linkedPrNumber?: number
  linkedIssueNumber?: number
  linkedRepo?: string
  // PR-specific metadata for tags
  prState?: "open" | "closed" | "merged"
  hasConflicts?: boolean
  reviewState?: "draft" | "pending_review" | null
}

/**
 * Note types
 * TODO: Add markdown rendering, tags, folders
 */
export interface Note {
  id: string
  title: string
  content: string
  createdAt: Date
  updatedAt: Date
  linkedEventIds: string[]
  linkedPrNumbers: number[]
  linkedIssueNumbers: number[]
}

/**
 * Notification types
 * TODO: Add notification preferences, grouping, read/unread states
 */
export interface Notification {
  id: string
  type: "action_required" | "mention" | "review" | "update"
  title: string
  message: string
  eventId: string
  timestamp: Date
  read: boolean
  actionUrl?: string
}

/**
 * Dashboard stats
 * TODO: Add more metrics as needed
 */
export interface DashboardStats {
  openPRs: number
  openIssues: number
  pendingTasks: number
  needsAction: number
  recentActivityCount: number
}







