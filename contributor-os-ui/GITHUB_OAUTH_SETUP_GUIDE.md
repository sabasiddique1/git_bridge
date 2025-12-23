# GitHub OAuth Setup Guide - Step by Step

## 🔴 Error You're Seeing

```
{"error":"GitHub OAuth not configured. Please set GITHUB_CLIENT_ID"}
```

This means the GitHub OAuth credentials are missing. Follow these steps:

---

## 📋 Step-by-Step Setup

### Step 1: Create GitHub OAuth App

1. **Go to GitHub:**
   - Visit: https://github.com/settings/developers
   - Or: GitHub → Your Profile → Settings → Developer settings → OAuth Apps

2. **Create New OAuth App:**
   - Click **"New OAuth App"** button (or "Register a new application")

3. **Fill in the Form:**

   **For LOCAL DEVELOPMENT (what you're doing now):**
   ```
   Application name: Contributor OS (Dev)
   Homepage URL: http://localhost:3000
   Authorization callback URL: http://localhost:3000/api/auth/github/callback
   ```

   **For PRODUCTION/VERCEL (when you deploy):**
   ```
   Application name: Contributor OS
   Homepage URL: https://your-app-name.vercel.app
   Authorization callback URL: https://your-app-name.vercel.app/api/auth/github/callback
   ```

   ⚠️ **IMPORTANT:** 
   - Use **localhost URLs** for local development
   - Use **Vercel URL** only when deploying to production
   - You can create **separate OAuth apps** for dev and production, OR
   - GitHub allows **multiple callback URLs** in one app (see below)

4. **Click "Register application"**

5. **Copy Your Credentials:**
   - **Client ID** - Copy this (it's visible immediately)
   - **Client Secret** - Click "Generate a new client secret" and copy it
   - ⚠️ **Important:** Save the client secret now - you won't be able to see it again!

---

## 🌐 Localhost vs Vercel URLs

### For Local Development (Right Now):
```
Homepage URL: http://localhost:3000
Callback URL: http://localhost:3000/api/auth/github/callback
```

### For Vercel Production (When Deployed):
```
Homepage URL: https://your-app-name.vercel.app
Callback URL: https://your-app-name.vercel.app/api/auth/github/callback
```

### Option 1: Separate OAuth Apps (Recommended)
- Create one OAuth app for development (localhost)
- Create another OAuth app for production (Vercel URL)
- Use different `.env.local` files or environment variables

### Option 2: Single OAuth App with Multiple Callbacks
GitHub allows you to add multiple callback URLs:
1. Create OAuth app with localhost URLs
2. After creation, edit the app
3. Add your Vercel callback URL as an additional callback URL
4. Use the same Client ID/Secret for both environments

---

### Step 2: Create Environment File

Create a file named `.env.local` in the project root (`contributor-os-ui/.env.local`):

```bash
cd /Users/saba/Desktop/open_pulse/contributor-os-ui
touch .env.local
```

---

### Step 3: Add Credentials to `.env.local`

Open `.env.local` and add:

**For LOCAL DEVELOPMENT:**
```env
# GitHub OAuth Credentials (Local Development)
GITHUB_CLIENT_ID=your_client_id_here
GITHUB_CLIENT_SECRET=your_client_secret_here
GITHUB_REDIRECT_URI=http://localhost:3000/api/auth/github/callback

# API URL
NEXT_PUBLIC_API_URL=http://localhost:3000
```

**For PRODUCTION (Vercel):**
In Vercel dashboard → Settings → Environment Variables, add:
```env
GITHUB_CLIENT_ID=your_production_client_id
GITHUB_CLIENT_SECRET=your_production_client_secret
GITHUB_REDIRECT_URI=https://your-app-name.vercel.app/api/auth/github/callback
NEXT_PUBLIC_API_URL=https://your-app-name.vercel.app
```

**Replace:**
- `your_client_id_here` with your actual Client ID
- `your_client_secret_here` with your actual Client Secret

**Example:**
```env
GITHUB_CLIENT_ID=abc123def456ghi789
GITHUB_CLIENT_SECRET=xyz789secret123abc456def789
GITHUB_REDIRECT_URI=http://localhost:3000/api/auth/github/callback
NEXT_PUBLIC_API_URL=http://localhost:3000
```

---

### Step 4: Restart Development Server

**Important:** You MUST restart the server after adding environment variables!

1. **Stop the current server:**
   - Press `Ctrl+C` in the terminal where it's running
   - Or kill the process: `lsof -ti:3000 | xargs kill -9`

2. **Start it again:**
   ```bash
   cd /Users/saba/Desktop/open_pulse/contributor-os-ui
   pnpm dev
   ```

---

### Step 5: Test

1. Go to: http://localhost:3000/login
2. Click "Sign in with GitHub"
3. You should be redirected to GitHub authorization page
4. Authorize the app
5. You'll be redirected back to the dashboard

---

## 🔍 Troubleshooting

### Error Still Appears?

1. **Check `.env.local` exists:**
   ```bash
   ls -la .env.local
   ```

2. **Check file contents:**
   ```bash
   cat .env.local
   ```
   Make sure there are no extra spaces or quotes around values.

3. **Verify variable names:**
   - Must be exactly: `GITHUB_CLIENT_ID`
   - Must be exactly: `GITHUB_CLIENT_SECRET`
   - Case-sensitive!

4. **Restart server:**
   - Environment variables are only loaded when the server starts
   - Make sure you restarted after adding them

5. **Check for typos:**
   - No spaces around `=`
   - No quotes unless the value itself has spaces
   - No trailing spaces

### Wrong Callback URL?

**For Local Development:**
Make sure the callback URL in GitHub matches exactly:
```
http://localhost:3000/api/auth/github/callback
```

**For Production:**
Make sure it matches your Vercel URL:
```
https://your-app-name.vercel.app/api/auth/github/callback
```

### For Production Deployment:

When deploying to Vercel:

1. **Update GitHub OAuth App:**
   - Edit your OAuth app
   - Update callback URL to your Vercel URL
   - Or add it as an additional callback URL

2. **Add Environment Variables in Vercel:**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add all the same variables from `.env.local`
   - Use your production OAuth app credentials

3. **Redeploy:**
   - Vercel will automatically use the new environment variables

---

## 📝 Quick Checklist

- [ ] Created GitHub OAuth App
- [ ] Used **localhost URLs** for local development
- [ ] Copied Client ID
- [ ] Generated and copied Client Secret
- [ ] Created `.env.local` file
- [ ] Added credentials to `.env.local`
- [ ] Restarted development server
- [ ] Tested login flow

---

## 🎯 Example `.env.local` File (Local Development)

```env
# GitHub OAuth (Local Development)
GITHUB_CLIENT_ID=Iv1.8a61f9b3a7aba766
GITHUB_CLIENT_SECRET=your_secret_here_do_not_share
GITHUB_REDIRECT_URI=http://localhost:3000/api/auth/github/callback

# API
NEXT_PUBLIC_API_URL=http://localhost:3000
```

**Note:** These are example values. Use your actual credentials!

---

## 🔒 Security Notes

- ⚠️ **Never commit `.env.local` to git** (it's already in `.gitignore`)
- ⚠️ **Never share your Client Secret**
- ⚠️ **Use different OAuth apps for development and production** (recommended)
- ⚠️ **Or use separate callback URLs in the same app**

---

## ✅ Success Indicators

When it's working, you should:
1. See no error when clicking "Sign in with GitHub"
2. Be redirected to GitHub authorization page
3. After authorizing, see your dashboard with user info
4. See your open source repositories displayed

---

## 📌 Summary

**For NOW (Local Development):**
- ✅ Use: `http://localhost:3000`
- ✅ Use: `http://localhost:3000/api/auth/github/callback`

**For LATER (Vercel Production):**
- ✅ Use: `https://your-app-name.vercel.app`
- ✅ Use: `https://your-app-name.vercel.app/api/auth/github/callback`
- ✅ Add environment variables in Vercel dashboard
