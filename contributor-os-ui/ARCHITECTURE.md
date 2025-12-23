# Contributor OS - Architecture Documentation

## Overview

Contributor OS is a real-time operating system for open-source contributors built with a scalable, event-driven architecture. Everything in the app revolves around **EVENTS**.

## Tech Stack

### Frontend
- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS** (existing Vercel theme preserved)
- **Radix UI** (component library)
- **Zustand** (client state management)
- **TanStack Query** (server state management)

### Backend (Scaffolded)
- **NestJS-style** service separation
- **API routes** as boundaries
- **Event-driven architecture**

### Realtime
- **WebSocket-ready** structure (placeholders)

### Database (Conceptual)
- **PostgreSQL**
- **Event-based timeline model**

## Project Structure

```
contributor-os-ui/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Dashboard page
│   ├── calendar/          # Calendar page
│   ├── notes/             # Notes page
│   ├── repos/             # Repositories page
│   ├── tasks/             # Tasks page
│   └── page.tsx           # Timeline (home) page
│
├── features/              # Feature-based components
│   ├── dashboard/        # Dashboard feature
│   ├── timeline/         # Timeline feature (CORE)
│   ├── tasks/            # Tasks feature
│   ├── calendar/         # Calendar feature
│   ├── repos/            # Repositories feature
│   ├── notes/            # Notes feature
│   └── notifications/    # Notifications feature
│
├── components/           # Shared UI components
│   ├── ui/               # Radix UI components
│   ├── app-shell.tsx     # Main app layout
│   ├── sidebar.tsx       # Navigation sidebar
│   └── header.tsx        # App header
│
├── stores/               # Zustand stores (client state)
│   ├── event-store.ts    # Event state management
│   ├── ui-store.ts       # UI state (notifications, sidebar)
│   └── task-store.ts     # Task state management
│
├── hooks/                # Custom React hooks
│   ├── queries/          # TanStack Query hooks
│   │   ├── use-events.ts
│   │   ├── use-dashboard.ts
│   │   ├── use-tasks.ts
│   │   └── use-repos.ts
│   └── use-realtime-events.ts  # WebSocket hook
│
├── services/             # API & service layer
│   ├── api-service.ts    # REST API client
│   ├── event-service.ts  # Event management
│   └── websocket-service.ts  # WebSocket client
│
├── types/                # TypeScript types
│   ├── events.ts         # Event-driven architecture types
│   └── index.ts          # Shared types
│
└── lib/                  # Utilities
    ├── query-client.ts   # TanStack Query setup
    └── utils.ts          # Helper functions
```

## Core Architectural Principle

**Everything revolves around EVENTS.**

- GitHub webhook → Event
- User action → Event
- Task creation → Event
- Timeline, calendar, tasks, notifications, and AI all derive from the same event stream

## Event Types

Events are defined in `types/events.ts`:

- `github.pr.opened` / `github.pr.closed` / `github.pr.merged`
- `github.pr.review_requested` / `github.pr.reviewed`
- `github.issue.opened` / `github.issue.closed`
- `github.comment.created` / `github.comment.updated`
- `task.created` / `task.completed` / `task.updated`
- `note.created` / `note.updated`

## State Management

### Client State (Zustand)
- **Event Store**: Manages event stream and filters
- **UI Store**: Manages UI state (notifications, sidebar)
- **Task Store**: Manages task state

### Server State (TanStack Query)
- **useEvents**: Fetch and cache events
- **useDashboardStats**: Dashboard statistics
- **useTasks**: Task CRUD operations
- **useRepos**: Repository management

## Features

### 1. Dashboard (`/dashboard`)
- Overview statistics
- "Needs My Action" section
- Recent activity preview

### 2. Timeline (`/`)
- Unified activity timeline
- Event list with filters
- Real-time updates (WebSocket-ready)

### 3. Tasks (`/tasks`)
- Lightweight task management
- Tasks linked to PRs/issues
- Status: pending / waiting / done

### 4. Calendar (`/calendar`)
- Day / Week structure
- Activity placeholders

### 5. Repositories (`/repos`)
- Subscribed repos
- Language badges
- Contribution tracking

### 6. Notes (`/notes`)
- Notion-like thinking space
- Markdown-friendly
- Linked to PRs/issues

### 7. Notifications
- In-app notification panel
- Real-time updates (WebSocket-ready)

## TODO / Future Implementation

### Backend
- [ ] Implement API endpoints
- [ ] Set up PostgreSQL event store
- [ ] Implement GitHub webhook handlers
- [ ] Add authentication

### Realtime
- [ ] Implement WebSocket server
- [ ] Add reconnection logic
- [ ] Implement event streaming

### Features
- [ ] Connect all features to real APIs
- [ ] Implement event filtering
- [ ] Add infinite scroll/pagination
- [ ] Add markdown editor for notes
- [ ] Implement task linking to events

### AI (Future)
- [ ] Add AI service interfaces
- [ ] Implement event analysis
- [ ] Add smart suggestions

## Development

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

## Notes

- The existing Vercel UI and theme are preserved
- Components are scaffolded with placeholders
- Architecture is ready for backend integration
- All TODO comments indicate future implementation points







