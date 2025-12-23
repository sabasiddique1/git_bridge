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
      redirectUri = `https://${process.env.VERCEL_URL}/api/auth/github/callback`
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
  
  // Debug: Log redirect URI (remove in production)
  console.log('[OAuth] Redirect URI:', redirectUri)
  console.log('[OAuth] VERCEL_URL:', process.env.VERCEL_URL)
  console.log('[OAuth] Host:', request.headers.get('host'))
  
  if (!clientId) {
    return NextResponse.json(
      { error: "GitHub OAuth not configured. Please set GITHUB_CLIENT_ID" },
      { status: 500 }
    )
  }

  // Generate state for CSRF protection
  const state = crypto.randomUUID()
  
  const scope = "read:user user:email repo"
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=${state}`
  
  // Store state in httpOnly cookie for validation in callback
  const response = NextResponse.redirect(githubAuthUrl)
  response.cookies.set("oauth_state", state, {
    httpOnly: true,
    secure: process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10, // 10 minutes
  })
  
  return response
}

