# Can You Use Production OAuth App for Localhost?

## 🎯 Quick Answer

**NO** - You cannot use the Vercel callback URL for localhost because GitHub requires an **exact match**.

**BUT** - You CAN use the **same OAuth app** (same Client ID/Secret) if you add **both callback URLs** to it.

---

## ❌ Why You Can't Use Vercel URL for Localhost

When you run locally:
- Your app runs on: `http://localhost:3000`
- Callback URL becomes: `http://localhost:3000/api/auth/github/callback`

If your OAuth app only has:
- `https://your-app.vercel.app/api/auth/github/callback`

GitHub will **reject** the localhost callback because it doesn't match exactly.

---

## ✅ Solution: Add Both URLs to Same App

### Option 1: Same OAuth App with Both URLs (Best)

1. **Create OAuth app with Vercel URL:**
   ```
   Callback URL: https://your-app.vercel.app/api/auth/github/callback
   ```

2. **Edit the app and add localhost URL:**
   - Go to your OAuth app settings
   - Edit the callback URL field
   - Add: `http://localhost:3000/api/auth/github/callback`
   - (Try comma-separated or GitHub's interface for multiple URLs)

3. **Use same credentials everywhere:**
   - Same `GITHUB_CLIENT_ID` for both
   - Same `GITHUB_CLIENT_SECRET` for both
   - Different `GITHUB_REDIRECT_URI` in each environment

**In `.env.local` (localhost):**
```env
GITHUB_CLIENT_ID=same_id
GITHUB_CLIENT_SECRET=same_secret
GITHUB_REDIRECT_URI=http://localhost:3000/api/auth/github/callback
```

**In Vercel Environment Variables:**
```env
GITHUB_CLIENT_ID=same_id
GITHUB_CLIENT_SECRET=same_secret
GITHUB_REDIRECT_URI=https://your-app.vercel.app/api/auth/github/callback
```

---

### Option 2: Separate OAuth Apps (If You Can't Add Both URLs)

If GitHub doesn't let you add multiple callback URLs:

**App 1: Production**
```
Name: Contributor OS (Prod)
Callback: https://your-app.vercel.app/api/auth/github/callback
```

**App 2: Development**
```
Name: Contributor OS (Dev)
Callback: http://localhost:3000/api/auth/github/callback
```

Then use different credentials in each environment.

---

## 📝 Summary

| Question | Answer |
|----------|--------|
| Can I use Vercel URL for localhost? | ❌ No - URLs must match exactly |
| Can I use same OAuth app for both? | ✅ Yes - if you add both callback URLs |
| Do I need separate apps? | Only if you can't add both URLs to one app |

---

## 🎯 What You Should Do

**Try this first:**

1. Create OAuth app with your Vercel URL
2. After creation, try to edit and add localhost URL
3. If that works → Use same credentials for both ✅
4. If that doesn't work → Create separate dev app

**Most likely:** You'll need to create a **separate OAuth app for localhost** because GitHub's interface might not easily support multiple callback URLs in one app.

---

## 💡 Recommendation

**For simplicity, create two apps:**

- **Production App:** Use in Vercel (with Vercel URL)
- **Development App:** Use locally (with localhost URL)

This is the most reliable approach and avoids any callback URL matching issues!



