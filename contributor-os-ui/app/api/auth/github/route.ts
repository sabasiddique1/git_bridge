/**
 * GITHUB OAUTH INITIATION
 * 
 * GET /api/auth/github - Initiate GitHub OAuth flow
 * 
 * Redirects user to GitHub OAuth authorization page
 */

import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

export async function GET(request: NextRequest) {
  const clientId = process.env.GITHUB_CLIENT_ID
  
  // Determine redirect URI based on environment
  let redirectUri = process.env.GITHUB_REDIRECT_URI
  
  if (!redirectUri) {
    // In Vercel (production, preview, or development), use VERCEL_URL
    if (process.env.VERCEL_URL) {
      const protocol = process.env.VERCEL_ENV === 'production' ? 'https' : 'https'
      redirectUri = `${protocol}://${process.env.VERCEL_URL}/api/auth/github/callback`
    }
    // Fallback to NEXT_PUBLIC_API_URL if set
    else if (process.env.NEXT_PUBLIC_API_URL) {
      redirectUri = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/github/callback`
    }
    // Use request headers to detect URL (for Vercel edge/other platforms)
    else {
      const host = request.headers.get('host')
      const protocol = request.headers.get('x-forwarded-proto') || 
                      (host?.includes('localhost') ? 'http' : 'https')
      redirectUri = `${protocol}://${host}/api/auth/github/callback`
    }
  }
  
  if (!clientId) {
    return NextResponse.json(
      { error: "GitHub OAuth not configured. Please set GITHUB_CLIENT_ID" },
      { status: 500 }
    )
  }

  // Generate state for CSRF protection
  const state = crypto.randomUUID()
  
  // Store state in session/cookie (TODO: implement proper session storage)
  // For now, we'll pass it in the callback
  
  const scope = "read:user user:email repo"
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=${state}`
  
  return NextResponse.redirect(githubAuthUrl)
}

