/**
 * AUTHENTICATION MIDDLEWARE
 * 
 * Middleware to protect API routes
 * 
 * TODO: Implement proper session validation
 * TODO: Add JWT token validation
 */

import { NextRequest, NextResponse } from "next/server"

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string
    githubId: number
    githubLogin: string
    githubAvatarUrl: string
  }
}

/**
 * Middleware to check if user is authenticated
 */
export async function requireAuth(
  request: NextRequest
): Promise<{ user: any; error: null } | { user: null; error: NextResponse }> {
  // TODO: Validate session token
  // const session = request.cookies.get("session")
  // if (!session) {
  //   return { user: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
  // }
  // const user = await validateSession(session.value)
  // if (!user) {
  //   return { user: null, error: NextResponse.json({ error: "Invalid session" }, { status: 401 }) }
  // }
  
  // Temporary: Check github_user cookie
  const githubUserCookie = request.cookies.get("github_user")
  
  if (!githubUserCookie) {
    return {
      user: null,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    }
  }

  try {
    const user = JSON.parse(githubUserCookie.value)
    return { user, error: null }
  } catch {
    return {
      user: null,
      error: NextResponse.json({ error: "Invalid session" }, { status: 401 }),
    }
  }
}

/**
 * Wrapper for API routes that require authentication
 */
export function withAuth(
  handler: (request: AuthenticatedRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    const authResult = await requireAuth(request)
    
    if (authResult.error) {
      return authResult.error
    }

    const authenticatedRequest = request as AuthenticatedRequest
    authenticatedRequest.user = authResult.user

    return handler(authenticatedRequest)
  }
}

