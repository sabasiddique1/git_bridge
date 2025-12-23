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
  
  // Clear session cookie
  response.cookies.delete("github_user")
  // TODO: Clear proper session cookie when implemented
  
  return response
}

