/**
 * GITHUB OAUTH CALLBACK
 * 
 * GET /api/auth/github/callback - Handle GitHub OAuth callback
 * 
 * Exchanges authorization code for access token
 * Fetches user information from GitHub
 * Creates/updates user in database
 * Sets session/cookie
 */

import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

interface GitHubTokenResponse {
  access_token: string
  token_type: string
  scope: string
}

interface GitHubUser {
  id: number
  login: string
  name: string
  email: string
  avatar_url: string
  bio: string
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get("code")
    const state = searchParams.get("state")
    const error = searchParams.get("error")

    if (error) {
      console.error("[OAuth Callback] Error from GitHub:", error)
      return NextResponse.redirect(
        new URL(`/?error=${encodeURIComponent(error)}`, request.url)
      )
    }

    if (!code) {
      console.error("[OAuth Callback] No code received")
      return NextResponse.redirect(
        new URL("/?error=no_code", request.url)
      )
    }

    // Validate state for CSRF protection
    const storedState = request.cookies.get("oauth_state")?.value
    if (!state || !storedState || state !== storedState) {
      console.error("[OAuth Callback] State mismatch - possible CSRF attack")
      return NextResponse.redirect(
        new URL("/?error=invalid_state", request.url)
      )
    }

    const clientId = process.env.GITHUB_CLIENT_ID
    const clientSecret = process.env.GITHUB_CLIENT_SECRET
    
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
    console.log('[OAuth Callback] Redirect URI:', redirectUri)
    console.log('[OAuth Callback] VERCEL_URL:', process.env.VERCEL_URL)
    console.log('[OAuth Callback] Host:', request.headers.get('host'))

    if (!clientId || !clientSecret) {
      return NextResponse.redirect(
        new URL("/?error=oauth_not_configured", request.url)
      )
    }

    // Exchange code for access token
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
        state,
      }),
    })

    if (!tokenResponse.ok) {
      throw new Error("Failed to exchange code for token")
    }

    const tokenData = (await tokenResponse.json()) as GitHubTokenResponse

    if (tokenData.error) {
      return NextResponse.redirect(
        new URL(`/?error=${encodeURIComponent(tokenData.error)}`, request.url)
      )
    }

    // Fetch user information from GitHub
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        Accept: "application/vnd.github.v3+json",
      },
    })

    if (!userResponse.ok) {
      throw new Error("Failed to fetch user information")
    }

    const githubUser = (await userResponse.json()) as GitHubUser

    // TODO: Store user in database
    // const user = await userService.createOrUpdate({
    //   githubId: githubUser.id,
    //   githubLogin: githubUser.login,
    //   githubAvatarUrl: githubUser.avatar_url,
    //   githubAccessToken: encrypt(tokenData.access_token), // Encrypt before storing
    // })

    // TODO: Create session/cookie
    // const session = await createSession(user.id)
    // const response = NextResponse.redirect(new URL("/", request.url))
    // response.cookies.set("session", session.token, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === "production",
    //   sameSite: "lax",
    //   maxAge: 60 * 60 * 24 * 7, // 7 days
    // })

    // Determine if we're in production (Vercel or local)
    const isProduction = process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production"
    const isSecure = request.headers.get("x-forwarded-proto") === "https" || isProduction
    
    // Get domain from request for cookie domain setting
    const host = request.headers.get("host") || ""
    const domain = host.includes("localhost") ? undefined : host.split(":")[0]
    
    // Redirect to dashboard after successful login
    const dashboardUrl = new URL("/dashboard", request.url)
    dashboardUrl.searchParams.set("github_login", "success")
    const response = NextResponse.redirect(dashboardUrl)
    
    // Clear OAuth state cookie (no longer needed)
    response.cookies.delete("oauth_state")
    
    // Store user info in cookie temporarily (TODO: use proper session management)
    response.cookies.set("github_user", JSON.stringify({
      id: githubUser.id,
      login: githubUser.login,
      avatar_url: githubUser.avatar_url,
      name: githubUser.name || null,
      email: githubUser.email || null,
      bio: githubUser.bio || null,
    }), {
      httpOnly: false, // TODO: Set to true with proper session
      secure: isSecure,
      sameSite: "lax",
      path: "/",
      ...(domain && !domain.includes("localhost") ? { domain } : {}), // Set domain for production
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    // Store access token temporarily (TODO: encrypt and store in database)
    response.cookies.set("github_access_token", tokenData.access_token, {
      httpOnly: true, // More secure - not accessible via JavaScript
      secure: isSecure,
      sameSite: "lax",
      path: "/",
      ...(domain && !domain.includes("localhost") ? { domain } : {}), // Set domain for production
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    console.log("[OAuth Callback] Successfully authenticated user:", githubUser.login)
    return response
  } catch (error) {
    console.error("GitHub OAuth callback error:", error)
    return NextResponse.redirect(
      new URL("/?error=oauth_failed", request.url)
    )
  }
}

