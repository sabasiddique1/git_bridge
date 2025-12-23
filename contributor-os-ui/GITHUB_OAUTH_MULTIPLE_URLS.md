# How to Add Multiple Callback URLs to GitHub OAuth App

## 📋 The Form You're Seeing

The GitHub OAuth app creation form only shows **one** "Authorization callback URL" field. Here's how to add both URLs:

---

## ✅ Method 1: Add Both URLs in One Field (Comma-Separated)

Some GitHub interfaces allow **comma-separated URLs** in the callback field. Try this:

**In the "Authorization callback URL" field, enter:**
```
http://localhost:3000/api/auth/github/callback, https://your-app-name.vercel.app/api/auth/github/callback
```

(Replace `your-app-name.vercel.app` with your actual Vercel URL)

**Fill the rest:**
```
Application name: Contributor OS
Homepage URL: https://your-app-name.vercel.app
Authorization callback URL: http://localhost:3000/api/auth/github/callback, https://your-app-name.vercel.app/api/auth/github/callback
```

---

## ✅ Method 2: Add Second URL After Creation (Recommended)

If comma-separated doesn't work, GitHub allows you to add additional callback URLs **after** creating the app:

### Step 1: Create the App with One URL

**Fill in the form:**
```
Application name: Contributor OS
Homepage URL: https://your-app-name.vercel.app
Authorization callback URL: http://localhost:3000/api/auth/github/callback
```

Click **"Register application"**

### Step 2: Edit the App to Add Second URL

1. After creation, you'll see your OAuth app page
2. Look for an **"Edit"** button or settings icon
3. Click it to edit the app
4. In the **"Authorization callback URL"** field, you might see:
   - Option to add multiple URLs
   - Or a way to add additional callback URLs
   - Or you can try comma-separated: `http://localhost:3000/api/auth/github/callback, https://your-app-name.vercel.app/api/auth/github/callback`
5. Save changes

---

## ✅ Method 3: Use Only Vercel URL (If Localhost Not Needed)

If you're only deploying to Vercel and don't need localhost:

**Fill in:**
```
Application name: Contributor OS
Homepage URL: https://your-app-name.vercel.app
Authorization callback URL: https://your-app-name.vercel.app/api/auth/github/callback
```

Then for localhost development, you can:
- Create a **separate OAuth app** just for localhost
- Or use the Vercel URL even for localhost (if you're okay with redirecting to Vercel)

---

## 🎯 Recommended Approach

**For now, create the app with your Vercel URL:**

```
Application name: Contributor OS
Homepage URL: https://your-app-name.vercel.app
Authorization callback URL: https://your-app-name.vercel.app/api/auth/github/callback
```

**Then:**
1. After creation, try to edit it and add localhost URL
2. Or create a second OAuth app for localhost development
3. Use different credentials in `.env.local` vs Vercel

---

## 📝 What to Put in the Form Right Now

Based on your deployed app, fill in:

```
Application name: Contributor OS
Homepage URL: https://your-app-name.vercel.app
Application description: (optional) Your personal OS for open-source contributions
Authorization callback URL: https://your-app-name.vercel.app/api/auth/github/callback
```

**After creating:**
- Try editing to add localhost URL
- Or use this for production and create a separate dev app

---

## 🔍 Finding Your Vercel URL

Your Vercel app URL should be something like:
- `https://contributor-os.vercel.app`
- `https://your-project-name.vercel.app`
- Check your Vercel dashboard for the exact URL

---

## ✅ After Creation

1. **Copy the Client ID** (visible immediately)
2. **Generate and copy Client Secret**
3. **Add to Vercel Environment Variables:**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add: `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `GITHUB_REDIRECT_URI`, `NEXT_PUBLIC_API_URL`
4. **Redeploy** your Vercel app

---

## 💡 Pro Tip

If you can't add multiple URLs to one app, create **two OAuth apps**:
- **Production App:** Use Vercel URL (for deployed app)
- **Development App:** Use localhost URL (for local development)

Then use different credentials in each environment!



