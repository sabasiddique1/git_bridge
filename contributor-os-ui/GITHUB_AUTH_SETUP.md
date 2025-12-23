# GitHub OAuth Authentication Setup Guide

## ✅ What's Been Implemented

### API Routes
- ✅ `GET /api/auth/github` - Initiate GitHub OAuth flow
- ✅ `GET /api/auth/github/callback` - Handle OAuth callback
- ✅ `GET /api/auth/me` - Get current user
- ✅ `POST /api/auth/logout` - Logout user

### Components
- ✅ `GitHubLoginButton` - Button to start OAuth flow
- ✅ `UserMenu` - User menu with logout option
- ✅ Login page at `/login`

### Middleware
- ✅ `lib/auth/middleware.ts` - Authentication middleware (ready for use)

## 🚧 Setup Steps

### 1. Create GitHub OAuth App

1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Click "New OAuth App"
3. Fill in:
   - **Application name:** Contributor OS
   - **Homepage URL:** `http://localhost:3000` (or your production URL)
   - **Authorization callback URL:** `http://localhost:3000/api/auth/github/callback` (or your production URL)
4. Click "Register application"
5. Copy the **Client ID** and generate a **Client Secret**

### 2. Set Environment Variables

Create or update `.env.local`:

```env
# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here
GITHUB_REDIRECT_URI=http://localhost:3000/api/auth/github/callback

# API URL (for production)
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 3. Update Database Schema (When Ready)

The users table is already in `lib/db/schema.sql`. When you connect the database, the OAuth callback will store:
- GitHub ID
- GitHub login/username
- GitHub avatar URL
- Encrypted access token

### 4. Test the Flow

1. Start the dev server: `pnpm dev`
2. Navigate to `/login` or click "Sign in with GitHub"
3. You'll be redirected to GitHub
4. Authorize the app
5. You'll be redirected back and logged in

## 📝 Current Implementation Status

### ✅ Completed
- OAuth flow initiation
- OAuth callback handling
- User information fetching from GitHub
- Cookie-based session (temporary)
- Login/logout UI components

### 🚧 TODO (Next Steps)
- [ ] Store user in database (currently only in cookie)
- [ ] Implement proper session management (JWT or server sessions)
- [ ] Encrypt GitHub access token before storing
- [ ] Add user to database on first login
- [ ] Update user info on subsequent logins
- [ ] Protect API routes with authentication middleware
- [ ] Add user ID to all database operations

## 🔒 Security Notes

**Current Implementation:**
- Uses cookies for temporary session storage
- Access token is fetched but not yet stored securely
- No encryption for sensitive data yet

**Production Requirements:**
- Use HTTP-only cookies for sessions
- Encrypt access tokens before storing
- Implement proper session expiration
- Add CSRF protection
- Use secure cookies in production

## 🧪 Testing

```bash
# Test OAuth initiation
curl http://localhost:3000/api/auth/github

# Test current user (after login)
curl http://localhost:3000/api/auth/me

# Test logout
curl -X POST http://localhost:3000/api/auth/logout
```

## 📚 GitHub OAuth Scopes

Current scopes requested:
- `read:user` - Read user profile information
- `user:email` - Read user email addresses
- `repo` - Full control of private repositories (for fetching user repos)

You can adjust scopes in `app/api/auth/github/route.ts` if needed.

## 🔄 Next Steps

1. **Set up GitHub OAuth App** (see step 1 above)
2. **Add environment variables** (see step 2 above)
3. **Test the login flow**
4. **Connect to database** to store users properly
5. **Implement proper session management**
6. **Protect API routes** with authentication middleware

## 📖 Resources

- [GitHub OAuth Documentation](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

