/**
 * GET CURRENT USER
 * 
 * GET /api/auth/me - Get current authenticated user
 * 
 * Returns user information from session
 */

import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // TODO: Get user from session/cookie
    // const session = request.cookies.get("session")
    // if (!session) {
    //   return NextResponse.json({ user: null }, { status: 401 })
    // }
    // const user = await userService.getById(session.userId)
    
    // Temporary: Get from cookie
    const githubUserCookie = request.cookies.get("github_user")
    
    if (!githubUserCookie) {
      return NextResponse.json({ user: null })
    }

    try {
      const user = JSON.parse(githubUserCookie.value)
      // Ensure all fields are present
      return NextResponse.json({ 
        user: {
          id: user.id,
          login: user.login,
          avatar_url: user.avatar_url,
          name: user.name || null,
          email: user.email || null,
          bio: user.bio || null,
        }
      })
    } catch (error) {
      console.error("Error parsing user cookie:", error)
      return NextResponse.json({ user: null })
    }
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    )
  }
}

