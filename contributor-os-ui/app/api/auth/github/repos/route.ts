/**
 * GITHUB USER REPOSITORIES API
 * 
 * GET /api/auth/github/repos - Get user's open source repositories
 * 
 * Fetches user's repositories from GitHub and filters for open source ones
 */

import { NextRequest, NextResponse } from "next/server"

interface GitHubRepo {
  id: number
  name: string
  full_name: string
  description: string | null
  language: string | null
  stargazers_count: number
  forks_count: number
  html_url: string
  is_private: boolean
  is_fork: boolean
  license: {
    key: string
    name: string
    spdx_id: string
  } | null
  owner: {
    login: string
    type: string
    avatar_url: string
  }
  topics: string[]
  created_at: string
  updated_at: string
  pushed_at: string
}

/**
 * Check if a repository is considered "open source"
 * Criteria:
 * - Public (not private)
 * - Has a license (indicates open source intent)
 * - Not a personal project (organization-owned or has open-source topics)
 */
function isOpenSourceRepo(repo: GitHubRepo, userLogin: string): boolean {
  // Must be public
  if (repo.is_private) {
    return false
  }

  // Must have a license (indicates open source intent)
  if (!repo.license) {
    return false
  }

  // Organization repos are more likely to be open source
  if (repo.owner.type === "Organization") {
    return true
  }

  // Check if repo has open-source related topics
  const openSourceTopics = [
    "open-source",
    "opensource",
    "hacktoberfest",
    "oss",
    "open-source-project",
  ]
  const hasOpenSourceTopic = repo.topics.some((topic) =>
    openSourceTopics.includes(topic.toLowerCase())
  )

  if (hasOpenSourceTopic) {
    return true
  }

  // If owned by user but has license and is not a fork, consider it open source
  // (user's own open source projects)
  if (repo.owner.login === userLogin && !repo.is_fork && repo.license) {
    return true
  }

  // Exclude personal projects (user's own repos without open source indicators)
  // This is a heuristic - you may want to adjust based on your needs
  if (repo.owner.login === userLogin && repo.owner.type === "User") {
    // Only include if it has significant stars or forks (indicates community interest)
    if (repo.stargazers_count > 5 || repo.forks_count > 2) {
      return true
    }
    return false
  }

  return false
}

export async function GET(request: NextRequest) {
  try {
    // Get user from cookie/session
    const githubUserCookie = request.cookies.get("github_user")
    
    if (!githubUserCookie) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      )
    }

    const user = JSON.parse(githubUserCookie.value)
    
    // TODO: Get access token from database/session
    // For now, we need to store it during OAuth callback
    // This is a placeholder - you'll need to store the token securely
    
    // Get access token from cookie (temporary - should be in database)
    const accessTokenCookie = request.cookies.get("github_access_token")
    
    if (!accessTokenCookie) {
      return NextResponse.json(
        { error: "GitHub access token not found" },
        { status: 401 }
      )
    }

    const accessToken = accessTokenCookie.value

    // Fetch user's repositories from GitHub API
    const reposResponse = await fetch("https://api.github.com/user/repos?per_page=100&sort=updated", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    })

    if (!reposResponse.ok) {
      throw new Error("Failed to fetch repositories from GitHub")
    }

    const repos: GitHubRepo[] = await reposResponse.json()

    // Filter for open source repositories
    const openSourceRepos = repos
      .filter((repo) => isOpenSourceRepo(repo, user.login))
      .map((repo) => ({
        id: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        description: repo.description,
        language: repo.language,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        url: repo.html_url,
        license: repo.license?.name || null,
        owner: repo.owner.login,
        ownerType: repo.owner.type,
        ownerAvatar: repo.owner.avatar_url,
        topics: repo.topics,
        createdAt: repo.created_at,
        updatedAt: repo.updated_at,
        pushedAt: repo.pushed_at,
      }))
      .sort((a, b) => b.stars - a.stars) // Sort by stars descending

    return NextResponse.json({
      repos: openSourceRepos,
      total: openSourceRepos.length,
    })
  } catch (error) {
    console.error("Error fetching GitHub repositories:", error)
    return NextResponse.json(
      { error: "Failed to fetch repositories" },
      { status: 500 }
    )
  }
}




