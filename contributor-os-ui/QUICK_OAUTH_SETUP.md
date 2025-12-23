# Quick OAuth Setup - Next Steps

## ✅ What's Done

- ✅ Client ID saved: `Ov23liBtrfGkYOKWhWsA`
- ✅ `.env.local` file created

## ⚠️ What You Need to Do

### Step 1: Get Your Client Secret

1. Go to: https://github.com/settings/developers
2. Click on your **Contributor OS** OAuth app
3. Find **"Client secrets"** section
4. Click **"Generate a new client secret"**
5. **Copy the secret immediately** (you won't see it again!)

### Step 2: Add Client Secret to `.env.local`

Open `.env.local` and replace `your_client_secret_here` with your actual secret:

```env
GITHUB_CLIENT_ID=Ov23liBtrfGkYOKWhWsA
GITHUB_CLIENT_SECRET=your_actual_secret_here  ← Replace this!
GITHUB_REDIRECT_URI=http://localhost:3000/api/auth/github/callback
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Step 3: Restart Server

**IMPORTANT:** You MUST restart the server after adding the Client Secret!

```bash
# Stop current server (Ctrl+C in terminal)
# Then restart:
cd /Users/saba/Desktop/open_pulse/contributor-os-ui
pnpm dev
```

### Step 4: Test OAuth

1. Go to: http://localhost:3000/login
2. Click "Sign in with GitHub"
3. Should redirect to GitHub authorization
4. After authorizing, you'll be redirected back to dashboard

## 🎯 Current Status

- ✅ Client ID: Saved
- ⏳ Client Secret: Need to add
- ⏳ Server: Need to restart after adding secret

## 🔍 Verify Setup

After adding Client Secret and restarting, test:

```bash
curl http://localhost:3000/api/auth/github
```

Should redirect to GitHub (not show error).



