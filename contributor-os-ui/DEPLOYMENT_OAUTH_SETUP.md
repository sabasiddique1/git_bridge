# OAuth Setup for Deployed App (Vercel)

## 🎯 Quick Answer

**NO** - You cannot use the Vercel URL for localhost. But you can add **BOTH URLs** to the same OAuth app!

---

## ✅ Solution: Add Multiple Callback URLs

GitHub allows you to add multiple callback URLs to a single OAuth app. This way, you can use the same Client ID/Secret for both localhost and Vercel.

### Step 1: Edit Your Existing OAuth App

1. Go to: https://github.com/settings/developers
2. Click on your **Contributor OS** OAuth app
3. Click **"Edit"** or the settings icon

### Step 2: Add Vercel Callback URL

In the **Authorization callback URL** field, you can add multiple URLs separated by commas, OR GitHub might have a separate field for additional callbacks.

**If GitHub shows a single callback field:**
- Keep: `http://localhost:3000/api/auth/github/callback`
- Add: `https://your-app-name.vercel.app/api/auth/github/callback`

**If GitHub has separate fields:**
- Primary callback: `http://localhost:3000/api/auth/github/callback`
- Additional callback: `https://your-app-name.vercel.app/api/auth/github/callback`

### Step 3: Update Environment Variables

**For Local Development (`.env.local`):**
```env
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
GITHUB_REDIRECT_URI=http://localhost:3000/api/auth/github/callback
NEXT_PUBLIC_API_URL=http://localhost:3000
```

**For Vercel Production:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add:
   ```env
   GITHUB_CLIENT_ID=your_client_id (same as localhost)
   GITHUB_CLIENT_SECRET=your_client_secret (same as localhost)
   GITHUB_REDIRECT_URI=https://your-app-name.vercel.app/api/auth/github/callback
   NEXT_PUBLIC_API_URL=https://your-app-name.vercel.app
   ```

---

## 🔄 Alternative: Separate OAuth Apps

If GitHub doesn't support multiple callbacks in one app, create two separate apps:

### App 1: Development
```
Name: Contributor OS (Dev)
Homepage: http://localhost:3000
Callback: http://localhost:3000/api/auth/github/callback
```

### App 2: Production
```
Name: Contributor OS (Prod)
Homepage: https://your-app-name.vercel.app
Callback: https://your-app-name.vercel.app/api/auth/github/callback
```

Then use different credentials in each environment.

---

## 📝 Current Setup Check

**Your `.env.local` (localhost):**
- Should use: `http://localhost:3000/api/auth/github/callback`

**Your Vercel Environment Variables:**
- Should use: `https://your-app-name.vercel.app/api/auth/github/callback`

**Same Client ID/Secret** can be used for both if you add both callback URLs to the OAuth app!

---

## ✅ Verification

After setting up:

1. **Test Localhost:**
   - Go to: http://localhost:3000/login
   - Should redirect to GitHub and back

2. **Test Vercel:**
   - Go to: https://your-app-name.vercel.app/login
   - Should redirect to GitHub and back

Both should work with the same OAuth app if both callback URLs are added!



