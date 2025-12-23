/**
 * EVENT-DRIVEN ARCHITECTURE CORE TYPES
 * 
 * Everything in Contributor OS revolves around EVENTS.
 * GitHub webhooks, user actions, task creation, etc. all generate events.
 * Timeline, calendar, tasks, notifications, and AI all derive from the same event stream.
 */

/**
 * Base event type that all events extend
 * TODO: Implement event persistence layer (PostgreSQL event store)
 * TODO: Add event versioning for schema evolution
 */
export interface BaseEvent {
  id: string
  type: EventType
  timestamp: Date
  source: EventSource
  metadata?: Record<string, unknown>
}

/**
 * Event types in the system
 * TODO: Expand as new event types are discovered
 */
export type EventType =
  | "github.pr.opened"
  | "github.pr.closed"
  | "github.pr.merged"
  | "github.pr.review_requested"
  | "github.pr.reviewed"
  | "github.issue.opened"
  | "github.issue.closed"
  | "github.comment.created"
  | "github.comment.updated"
  | "task.created"
  | "task.completed"
  | "task.updated"
  | "note.created"
  | "note.updated"
  | "user.action"

/**
 * Event source - where the event originated
 */
export type EventSource = "github" | "user" | "system" | "ai"

/**
 * GitHub-specific event payloads
 * TODO: Align with GitHub webhook payload structure
 */
export interface GitHubEvent extends BaseEvent {
  source: "github"
  repository: {
    id: number
    name: string
    fullName: string
    owner: string
    language?: string
    url: string
  }
  actor: {
    login: string
    avatarUrl: string
  }
}

export interface PullRequestEvent extends GitHubEvent {
  type: "github.pr.opened" | "github.pr.closed" | "github.pr.merged" | "github.pr.review_requested" | "github.pr.reviewed"
  pullRequest: {
    number: number
    title: string
    body?: string
    state: "open" | "closed" | "merged"
    url: string
    baseRef: string
    headRef: string
  }
}

export interface IssueEvent extends GitHubEvent {
  type: "github.issue.opened" | "github.issue.closed"
  issue: {
    number: number
    title: string
    body?: string
    state: "open" | "closed"
    url: string
    labels?: string[]
  }
}

export interface CommentEvent extends GitHubEvent {
  type: "github.comment.created" | "github.comment.updated"
  comment: {
    id: number
    body: string
    url: string
    associatedWith: {
      type: "pr" | "issue"
      number: number
    }
  }
}

/**
 * Task event payloads
 * TODO: Link tasks to PRs/issues via event references
 */
export interface TaskEvent extends BaseEvent {
  source: "user" | "system"
  type: "task.created" | "task.completed" | "task.updated"
  task: {
    id: string
    title: string
    description?: string
    status: "pending" | "waiting" | "done"
    linkedEventId?: string // Reference to related GitHub event
    linkedPrNumber?: number
    linkedIssueNumber?: number
  }
}

/**
 * Note event payloads
 * TODO: Implement Notion-like linking system
 */
export interface NoteEvent extends BaseEvent {
  source: "user"
  type: "note.created" | "note.updated"
  note: {
    id: string
    title: string
    content: string
    linkedEventIds?: string[]
    linkedPrNumbers?: number[]
    linkedIssueNumbers?: number[]
  }
}

/**
 * Union type for all events
 */
export type AppEvent = PullRequestEvent | IssueEvent | CommentEvent | TaskEvent | NoteEvent

/**
 * Event filter criteria
 * TODO: Implement advanced filtering (date ranges, repo filters, etc.)
 */
export interface EventFilter {
  types?: EventType[]
  sources?: EventSource[]
  repositories?: string[]
  languages?: string[]
  needsAction?: boolean
  dateRange?: {
    from: Date
    to: Date
  }
}

/**
 * Event stream subscription
 * TODO: Implement WebSocket-based real-time event streaming
 */
export interface EventSubscription {
  id: string
  filter: EventFilter
  callback: (event: AppEvent) => void
}







