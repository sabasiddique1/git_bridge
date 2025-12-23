/**
 * LOGOUT API ROUTE
 * 
 * POST /api/auth/logout - Logout user
 * 
 * Clears session/cookie
 */

import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: true })
  
  // Clear all auth cookies
  response.cookies.delete("github_user")
  response.cookies.delete("github_access_token")
  response.cookies.delete("oauth_state")
  // TODO: Clear proper session cookie when implemented
  
  return response
}

