# Contributor OS

> A real-time operating system for open-source contributors. Track your GitHub activity, manage tasks, and stay on top of your open-source contributions.

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8)](https://tailwindcss.com/)

## 🌟 Overview

Contributor OS is a comprehensive platform designed for open-source contributors to centralize and manage their GitHub activity. Built on an event-driven architecture, everything revolves around **events** - GitHub webhooks, user actions, and contributions all flow through a unified event stream.

### Key Features

- 🔐 **GitHub OAuth Integration** - Secure authentication with GitHub
- 📊 **Public Dashboard** - View your profile and open-source repositories
- 📅 **Unified Timeline** - See all your GitHub activity in one place
- ✅ **Task Management** - Lightweight task tracking linked to PRs/issues
- 📅 **Calendar View** - Visualize your contributions over time
- 📝 **Notes** - Notion-like thinking space for your ideas
- 🔔 **Real-time Notifications** - Stay updated on what needs your attention
- 🏢 **Repository Management** - Track and manage your subscribed repos

## 🏗️ Architecture

Contributor OS is built on an **event-driven architecture** where:

- GitHub webhooks → Events
- User actions → Events  
- Task creation → Events

Timeline, calendar, tasks, notifications, and AI all derive from the same event stream.

### Tech Stack

**Frontend:**
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Radix UI
- Zustand (client state)
- TanStack Query (server state)

**Backend (Scaffolded):**
- Next.js API Routes
- Event-driven service layer
- WebSocket-ready structure

**Database (Conceptual):**
- PostgreSQL
- Event-based timeline model

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- GitHub account (for OAuth)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd contributor-os-ui

# Install dependencies
pnpm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your GitHub OAuth credentials
```

### GitHub OAuth Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App:
   - **Homepage URL:** `http://localhost:3000`
   - **Callback URL:** `http://localhost:3000/api/auth/github/callback`
3. Copy Client ID and generate Client Secret
4. Add to `.env.local`:
   ```env
   GITHUB_CLIENT_ID=your_client_id
   GITHUB_CLIENT_SECRET=your_client_secret
   GITHUB_REDIRECT_URI=http://localhost:3000/api/auth/github/callback
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```

### Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
contributor-os-ui/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── dashboard/         # Public dashboard
│   ├── login/             # Login page
│   └── ...
├── features/              # Feature-based components
│   ├── dashboard/         # Dashboard feature
│   ├── timeline/         # Timeline feature (CORE)
│   ├── tasks/            # Tasks feature
│   ├── calendar/         # Calendar feature
│   ├── repos/            # Repositories feature
│   ├── notes/            # Notes feature
│   └── notifications/    # Notifications feature
├── components/           # Shared UI components
├── stores/              # Zustand stores (client state)
├── hooks/               # Custom React hooks
├── services/            # API and service layer
└── types/               # TypeScript type definitions
```

## 🎯 Features in Detail

### Public Dashboard
- Accessible without login
- Shows welcome screen for visitors
- Displays user profile and open-source repositories when logged in
- Filters repositories to show only open-source projects (with licenses)

### Unified Timeline
- Event-driven activity feed
- Filter by type (PRs, Issues, Reviews, etc.)
- Real-time updates (WebSocket-ready)
- "Needs Action" filtering

### Task Management
- Lightweight task tracking
- Link tasks to PRs/issues
- Status: pending / waiting / done
- Quick actions and filtering

### Calendar View
- Visualize contributions by date
- Day/Week/Month views
- Event grouping and details

### Notes
- Notion-like markdown editor
- Link notes to PRs/issues
- Search and organization

## 🔧 Development

```bash
# Development
pnpm dev

# Build
pnpm build

# Start production
pnpm start

# Lint
pnpm lint
```

## 📚 Documentation

- [Architecture Guide](./ARCHITECTURE.md) - Detailed architecture documentation
- [Integration Roadmap](./INTEGRATION_ROADMAP.md) - Implementation roadmap and milestones
- [GitHub OAuth Setup](./GITHUB_OAUTH_SETUP_GUIDE.md) - OAuth configuration guide
- [Public Dashboard Setup](./PUBLIC_DASHBOARD_SETUP.md) - Dashboard features

## 🗺️ Roadmap

### Completed ✅
- Feature-based folder structure
- Event-driven architecture types
- Zustand stores for client state
- TanStack Query hooks
- GitHub OAuth integration
- Public dashboard with user profiles
- Open-source repository filtering
- API route structure

### In Progress 🚧
- Database integration (PostgreSQL)
- Real-time WebSocket updates
- Backend API implementation
- Event persistence

### Planned 📋
- AI-powered insights
- Advanced filtering and search
- Contribution analytics
- Team collaboration features

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [Radix UI](https://www.radix-ui.com/)
- Icons from [Lucide](https://lucide.dev/)
- Styling with [Tailwind CSS](https://tailwindcss.com/)

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

**Built with ❤️ for the open-source community**
