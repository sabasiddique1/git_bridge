/**
 * DATABASE SCHEMA
 * 
 * PostgreSQL schema for Contributor OS
 * 
 * TODO: Set up PostgreSQL database
 * TODO: Run migrations
 * TODO: Add indexes for performance
 */

-- Events table (core of the system)
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(100) NOT NULL,
  source VARCHAR(50) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  metadata JSONB,
  
  -- GitHub-specific fields
  repository_id INTEGER,
  repository_name VARCHAR(255),
  repository_full_name VARCHAR(255),
  repository_owner VARCHAR(255),
  repository_language VARCHAR(50),
  repository_url TEXT,
  
  actor_login VARCHAR(255),
  actor_avatar_url TEXT,
  
  -- Event-specific data (stored as JSONB for flexibility)
  event_data JSONB NOT NULL,
  
  -- Flags
  needs_action BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for events
CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
CREATE INDEX IF NOT EXISTS idx_events_source ON events(source);
CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_events_repository_full_name ON events(repository_full_name);
CREATE INDEX IF NOT EXISTS idx_events_needs_action ON events(needs_action) WHERE needs_action = TRUE;

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL, -- TODO: Link to users table
  title VARCHAR(500) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, waiting, done
  
  -- Links to events/PRs/issues
  linked_event_id UUID REFERENCES events(id),
  linked_pr_number INTEGER,
  linked_issue_number INTEGER,
  linked_repo VARCHAR(255),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for tasks
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_linked_event_id ON tasks(linked_event_id);

-- Notes table
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL, -- TODO: Link to users table
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL, -- Markdown content
  
  -- Links to events/PRs/issues (stored as arrays)
  linked_event_ids UUID[],
  linked_pr_numbers INTEGER[],
  linked_issue_numbers INTEGER[],
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for notes
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at DESC);

-- Repositories table
CREATE TABLE IF NOT EXISTS repositories (
  id SERIAL PRIMARY KEY,
  github_id INTEGER UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  owner VARCHAR(255) NOT NULL,
  description TEXT,
  language VARCHAR(50),
  stars INTEGER DEFAULT 0,
  forks INTEGER DEFAULT 0,
  url TEXT NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- User repository subscriptions (many-to-many)
CREATE TABLE IF NOT EXISTS user_repository_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL, -- TODO: Link to users table
  repository_id INTEGER NOT NULL REFERENCES repositories(id),
  is_pinned BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  UNIQUE(user_id, repository_id)
);

-- Indexes for subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON user_repository_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_repository_id ON user_repository_subscriptions(repository_id);

-- Users table (basic structure - expand as needed)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  github_id INTEGER UNIQUE NOT NULL,
  github_login VARCHAR(255) NOT NULL,
  github_avatar_url TEXT,
  github_access_token TEXT, -- Encrypted
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for users
CREATE INDEX IF NOT EXISTS idx_users_github_id ON users(github_id);
CREATE INDEX IF NOT EXISTS idx_users_github_login ON users(github_login);






