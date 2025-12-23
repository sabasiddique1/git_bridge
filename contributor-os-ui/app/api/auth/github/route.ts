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
    // In production (Vercel), use NEXT_PUBLIC_API_URL or construct from request
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
      (request.headers.get('host') ? `${request.headers.get('x-forwarded-proto') || 'https'}://${request.headers.get('host')}` : null) ||
      'http://localhost:3000'
    redirectUri = `${baseUrl}/api/auth/github/callback`
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

