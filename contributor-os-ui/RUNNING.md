# 🚀 Contributor OS - Running Guide

## ✅ Server Status

**The development server is now running!**

- **Frontend:** http://localhost:3000
- **API Base:** http://localhost:3000/api

## 📍 Available Routes

### Frontend Pages
- **Dashboard:** http://localhost:3000/dashboard
- **Timeline:** http://localhost:3000/
- **Tasks:** http://localhost:3000/tasks
- **Calendar:** http://localhost:3000/calendar
- **Repositories:** http://localhost:3000/repos
- **Notes:** http://localhost:3000/notes

### API Endpoints

#### Events
- `GET /api/events` - List events
- `GET /api/events/:id` - Get event by ID

#### Dashboard
- `GET /api/dashboard/stats` - Dashboard statistics

#### Tasks
- `GET /api/tasks` - List tasks
- `POST /api/tasks` - Create task
- `GET /api/tasks/:id` - Get task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

#### Repositories
- `GET /api/repos` - List repositories
- `POST /api/repos/:id/subscribe` - Subscribe to repository
- `DELETE /api/repos/:id/subscribe` - Unsubscribe from repository

#### Notes
- `GET /api/notes` - List notes
- `POST /api/notes` - Create note
- `GET /api/notes/:id` - Get note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note

#### Webhooks
- `POST /api/webhooks/github` - GitHub webhook endpoint

## 🧪 Test API Endpoints

```bash
# Dashboard stats
curl http://localhost:3000/api/dashboard/stats

# Events
curl http://localhost:3000/api/events

# Tasks
curl http://localhost:3000/api/tasks

# Create a task
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Task","status":"pending"}'

# Create a note
curl -X POST http://localhost:3000/api/notes \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Note","content":"This is a test note"}'
```

## 📝 Current Status

- ✅ **Frontend:** Fully functional with UI components
- ✅ **API Routes:** All routes created and responding
- ⚠️ **Database:** Not yet connected (returns mock/empty data)
- ⚠️ **Services:** Not yet implemented (routes use placeholders)

## 🎯 Next Steps

To make the app fully functional:

1. **Set up PostgreSQL database** (see `MILESTONE_1_SETUP.md`)
2. **Install database client:** `pnpm add pg @types/pg`
3. **Create service layer** to connect API routes to database
4. **Add environment variables** (`.env.local`)
5. **Test with real data**

## 🛑 Stop Server

To stop the development server:
```bash
# Find and kill the process
lsof -ti:3000 | xargs kill -9
```

Or press `Ctrl+C` in the terminal where it's running.

## 📚 Documentation

- **Architecture:** See `ARCHITECTURE.md`
- **Integration Roadmap:** See `INTEGRATION_ROADMAP.md`
- **Milestone 1 Setup:** See `MILESTONE_1_SETUP.md`





