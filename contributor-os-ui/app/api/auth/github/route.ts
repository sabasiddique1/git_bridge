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
  const redirectUri = process.env.GITHUB_REDIRECT_URI || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/auth/github/callback`
  
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

