# Milestone 1: Foundation & Authentication - Setup Guide

## ✅ What's Been Created

### API Routes (Next.js)
- ✅ `/api/events` - List events
- ✅ `/api/events/[id]` - Get event by ID
- ✅ `/api/dashboard/stats` - Dashboard statistics
- ✅ `/api/tasks` - List/Create tasks
- ✅ `/api/tasks/[id]` - Get/Update/Delete task
- ✅ `/api/repos` - List repositories
- ✅ `/api/repos/[id]/subscribe` - Subscribe/Unsubscribe
- ✅ `/api/notes` - List/Create notes
- ✅ `/api/notes/[id]` - Get/Update/Delete note
- ✅ `/api/webhooks/github` - GitHub webhook endpoint

### Database Schema
- ✅ `lib/db/schema.sql` - Complete PostgreSQL schema
  - Events table (core)
  - Tasks table
  - Notes table
  - Repositories table
  - User subscriptions table
  - Users table

## 🚧 Next Steps to Complete Milestone 1

### 1. Set Up PostgreSQL Database

```bash
# Install PostgreSQL (if not already installed)
# macOS
brew install postgresql@14
brew services start postgresql@14

# Create database
createdb contributor_os

# Run schema
psql contributor_os < lib/db/schema.sql
```

Or use a cloud PostgreSQL service (Supabase, Neon, Railway, etc.)

### 2. Install Database Client

```bash
cd contributor-os-ui
pnpm add pg @types/pg
# or use Prisma/TypeORM/Drizzle
```

### 3. Set Up Environment Variables

Create `.env.local`:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/contributor_os

# GitHub OAuth (for future)
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
GITHUB_WEBHOOK_SECRET=your_webhook_secret

# API
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### 4. Implement Database Connection

Create `lib/db/client.ts`:

```typescript
import { Pool } from 'pg'

export const db = new Pool({
  connectionString: process.env.DATABASE_URL,
})
```

### 5. Implement Service Layer

Create service files:
- `lib/services/event-service.ts` - Event CRUD operations
- `lib/services/task-service.ts` - Task CRUD operations
- `lib/services/note-service.ts` - Note CRUD operations
- `lib/services/repo-service.ts` - Repository operations
- `lib/services/dashboard-service.ts` - Dashboard stats

### 6. Connect API Routes to Services

Update API routes to use services instead of placeholders.

### 7. Add Authentication Middleware

Create `lib/auth/middleware.ts` for protecting API routes.

## 📝 Current Status

- ✅ API route structure created
- ✅ Database schema defined
- ❌ Database connection not implemented
- ❌ Service layer not implemented
- ❌ API routes still return placeholders
- ❌ Authentication not implemented

## 🎯 Completion Criteria

Milestone 1 is complete when:
- [ ] PostgreSQL database is set up and running
- [ ] Database schema is applied
- [ ] Database client is connected
- [ ] Service layer is implemented
- [ ] API routes use services (not placeholders)
- [ ] Basic authentication is working
- [ ] All API endpoints return real data (even if empty)

## 🔄 Testing

Test API endpoints:

```bash
# Events
curl http://localhost:3000/api/events

# Dashboard stats
curl http://localhost:3000/api/dashboard/stats

# Tasks
curl http://localhost:3000/api/tasks
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Task","status":"pending"}'
```

## 📚 Resources

- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [GitHub Webhooks](https://docs.github.com/en/webhooks)





