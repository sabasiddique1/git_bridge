/**
 * GITHUB PULL REQUESTS API
 * 
 * GET /api/auth/github/pull-requests - Fetch user's open source PRs
 * 
 * Fetches all pull requests where the authenticated user is the author
 * from open source repositories (repos with licenses)
 */

import { NextRequest, NextResponse } from "next/server"

interface GitHubPR {
  id: number
  number: number
  title: string
  body: string | null
  state: "open" | "closed" | "merged"
  url: string
  html_url: string
  created_at: string
  updated_at: string
  user: {
    login: string
    avatar_url: string
  }
  // GitHub search API returns repository info in different places
  repository_url?: string // API URL to get repo details
  repository?: {
    id?: number
    name?: string
    full_name?: string
    owner?: {
      login?: string
      type?: string
    }
    language?: string | null
    license?: {
      key?: string
      name?: string
    } | null
  }
  // Sometimes repo info is in pull_request object
  pull_request?: {
    url: string
    html_url: string
    diff_url: string
    patch_url: string
  }
}

interface PullRequest {
  id: number
  number: number
  title: string
  body: string | null
  state: "open" | "closed" | "merged"
  url: string
  createdAt: string
  updatedAt: string
  author: {
    login: string
    avatarUrl: string
  }
  repository: {
    id: number
    name: string
    fullName: string
    owner: string
    ownerType: string
    language: string | null
    license: string | null
  }
  baseRef: string
  headRef: string
  hasConflicts?: boolean
  mergeableState?: string | null
  reviewState?: "draft" | "pending_review" | null
}

/**
 * Check if a repository should be included (public repos where user contributed)
 * Simplified logic: Include all public repos (open source by definition)
 * Exclude only private repos and user's own personal repos without community interest
 */
function isOpenSourceRepository(repo: any, userLogin: string): boolean {
  // Exclude private repos
  if (repo.private) {
    console.log(`[PRs API] Excluding ${repo.full_name}: private repo`)
    return false
  }

  // Include all organization repos (they're public and likely open source)
  if (repo.owner?.type === "Organization") {
    console.log(`[PRs API] Including ${repo.full_name}: organization repo`)
    return true
  }

  // Include repos owned by others (public repos you contributed to)
  if (repo.owner?.login !== userLogin) {
    console.log(`[PRs API] Including ${repo.full_name}: public repo owned by ${repo.owner?.login}`)
    return true
  }

  // For user's own repos, include if:
  // - Has a license (open source intent)
  // - Has open-source topics
  // - Has community interest (stars/forks)
  // - Is not a fork (original project)
  
  const openSourceTopics = [
    "open-source",
    "opensource",
    "hacktoberfest",
    "oss",
    "open-source-project",
  ]
  const repoTopics = repo.topics || []
  const hasOpenSourceTopic = repoTopics.some((topic: string) =>
    openSourceTopics.includes(topic.toLowerCase())
  )

  if (hasOpenSourceTopic) {
    console.log(`[PRs API] Including ${repo.full_name}: has open-source topics`)
    return true
  }

  if (repo.license && repo.license.key) {
    console.log(`[PRs API] Including ${repo.full_name}: has license`)
    return true
  }

  if (!repo.fork && (repo.stargazers_count > 0 || repo.forks_count > 0)) {
    console.log(`[PRs API] Including ${repo.full_name}: has community interest`)
    return true
  }

  // Exclude user's own repos that are forks without license/topics
  if (repo.fork && !repo.license) {
    console.log(`[PRs API] Excluding ${repo.full_name}: user's fork without license`)
    return false
  }

  // Include user's own non-fork repos (likely their open source projects)
  if (!repo.fork) {
    console.log(`[PRs API] Including ${repo.full_name}: user's own non-fork repo`)
    return true
  }

  console.log(`[PRs API] Excluding ${repo.full_name}: user's personal repo without open source indicators`)
  return false
}

export async function GET(request: NextRequest) {
  try {
    // Get access token from cookie
    const accessTokenCookie = request.cookies.get("github_access_token")
    
    if (!accessTokenCookie || !accessTokenCookie.value) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      )
    }

    const accessToken = accessTokenCookie.value

    // Get user info to filter PRs by author
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    })

    if (!userResponse.ok) {
      throw new Error("Failed to fetch user information")
    }

    const user = await userResponse.json()
    const userLogin = user.login

    // Fetch all user's PRs (as author) - including open, closed, and merged
    // GitHub API: Search for PRs where user is author
    // Note: We'll fetch open and closed separately since GitHub search doesn't support "merged" state directly
    const openQuery = `author:${userLogin} type:pr state:open`
    const closedQuery = `author:${userLogin} type:pr state:closed`
    
    console.log(`[PRs API] Fetching PRs for user: ${userLogin}`)
    console.log(`[PRs API] Search queries: "${openQuery}" and "${closedQuery}"`)
    
    const [openResponse, closedResponse] = await Promise.all([
      fetch(`https://api.github.com/search/issues?q=${encodeURIComponent(openQuery)}&per_page=100&sort=updated`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      }),
      fetch(`https://api.github.com/search/issues?q=${encodeURIComponent(closedQuery)}&per_page=100&sort=updated`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      }),
    ])

    // Handle responses - process successful ones even if one fails
    let openData = { items: [] }
    let closedData = { items: [] }
    
    try {
      if (openResponse.ok) {
        openData = await openResponse.json()
        console.log(`[PRs API] Found ${openData.items?.length || 0} open PRs`)
      } else {
        const errorText = await openResponse.text().catch(() => "Unknown error")
        console.warn(`[PRs API] Failed to fetch open PRs: ${openResponse.status}`, errorText.substring(0, 200))
      }
    } catch (error) {
      console.error("[PRs API] Error parsing open PRs response:", error)
    }
    
    try {
      if (closedResponse.ok) {
        closedData = await closedResponse.json()
        console.log(`[PRs API] Found ${closedData.items?.length || 0} closed PRs`)
      } else {
        const errorText = await closedResponse.text().catch(() => "Unknown error")
        console.warn(`[PRs API] Failed to fetch closed PRs: ${closedResponse.status}`, errorText.substring(0, 200))
      }
    } catch (error) {
      console.error("[PRs API] Error parsing closed PRs response:", error)
    }
    
    // If both failed, return empty array
    if (!openResponse.ok && !closedResponse.ok) {
      console.error("[PRs API] Both open and closed PR requests failed")
      return NextResponse.json({ pullRequests: [], total: 0 })
    }
    
    const prs: GitHubPR[] = [...(openData.items || []), ...(closedData.items || [])]

    console.log(`[PRs API] Total PRs found: ${prs.length}`)
    if (prs.length > 0) {
      // Log first PR structure to debug - show ALL available fields
      const firstPR = prs[0]
      console.log(`[PRs API] First PR full structure:`, JSON.stringify({
        id: firstPR?.id,
        number: firstPR?.number,
        title: firstPR?.title,
        html_url: firstPR?.html_url,
        url: firstPR?.url,
        repository_url: firstPR?.repository_url,
        repository: firstPR?.repository,
        // Check all possible locations for repo info
        allKeys: Object.keys(firstPR || {}),
      }, null, 2))
      
      // Test extraction from first PR
      let testRepoName = firstPR?.repository?.full_name
      if (!testRepoName && firstPR?.html_url) {
        const match = firstPR.html_url.match(/github\.com\/([^\/]+\/[^\/]+)\/pull/)
        testRepoName = match ? match[1] : null
        console.log(`[PRs API] Extracted repo name from html_url: "${testRepoName}"`)
      }
      
      // Extract repo names from html_url if repository object is missing
      const repoNames = prs.slice(0, 10).map(pr => {
        if (pr.repository?.full_name) return pr.repository.full_name
        // Extract from html_url: https://github.com/owner/repo/pull/123
        const match = pr.html_url?.match(/github\.com\/([^\/]+\/[^\/]+)\/pull/)
        return match ? match[1] : 'unknown'
      })
      console.log(`[PRs API] Sample repo names (first 10):`, repoNames)
    }

    // Filter for open source repositories
    // Use similar logic to repos API: public repos that are likely open source
    const openSourcePRs: PullRequest[] = []

    console.log(`[PRs API] Processing ${prs.length} PRs to filter for open source repos`)

    let processedCount = 0
    let skippedCount = 0
    
    for (const pr of prs) {
      // Extract repository full_name from multiple possible locations
      let repoFullName = pr.repository?.full_name
      
      // If not in repository object, extract from html_url
      if (!repoFullName && pr.html_url) {
        const match = pr.html_url.match(/github\.com\/([^\/]+\/[^\/]+)\/pull/)
        if (match) {
          repoFullName = match[1]
          if (processedCount < 5) {
            console.log(`[PRs API] ✓ Extracted repo "${repoFullName}" from URL for PR #${pr.number}`)
          }
        }
      }
      
      // If still not found, try repository_url
      if (!repoFullName && pr.repository_url) {
        const match = pr.repository_url.match(/\/repos\/([^\/]+\/[^\/]+)$/)
        if (match) {
          repoFullName = match[1]
          if (processedCount < 5) {
            console.log(`[PRs API] ✓ Extracted repo "${repoFullName}" from repository_url for PR #${pr.number}`)
          }
        }
      }
      
      if (!repoFullName) {
        skippedCount++
        if (skippedCount <= 3) {
          console.warn(`[PRs API] ✗ PR #${pr.number} missing repository info, html_url: ${pr.html_url}`)
        }
        continue
      }
      
      processedCount++
      
      // Get repository details to check if it's open source
      const repoApiUrl = `https://api.github.com/repos/${repoFullName}`
      
      if (processedCount <= 3) {
        console.log(`[PRs API] Fetching repo details for: ${repoFullName} (PR #${pr.number})`)
      }
      
      const repoResponse = await fetch(repoApiUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      })

      if (repoResponse.ok) {
        const repo = await repoResponse.json()
        
        if (processedCount <= 3) {
          console.log(`[PRs API] Repo details for ${repoFullName}:`, {
            name: repo.name,
            full_name: repo.full_name,
            private: repo.private,
            owner_type: repo.owner?.type,
            owner_login: repo.owner?.login,
            has_license: !!repo.license,
            language: repo.language,
          })
        }
        
        // Check if repository is open source using similar logic to repos API
        const isOpenSource = isOpenSourceRepository(repo, userLogin)
        
        if (isOpenSource) {
          if (openSourcePRs.length < 5) {
            console.log(`[PRs API] ✓ Including PR #${pr.number} from ${repoFullName} (open source repo)`)
          }
          try {
            // Get full PR details - construct PR API URL from repository and PR number
            const prApiUrl = `https://api.github.com/repos/${repoFullName}/pulls/${pr.number}`
            const fullPRResponse = await fetch(prApiUrl, {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: "application/vnd.github.v3+json",
              },
            })

            if (fullPRResponse.ok) {
              const fullPR = await fullPRResponse.json()
              
              // Determine PR state (merged, closed, or open)
              let state: "open" | "closed" | "merged" = "open"
              if (fullPR.merged_at) {
                state = "merged"
              } else if (fullPR.state === "closed") {
                state = "closed"
              }
              
              // Check for merge conflicts
              const hasConflicts = fullPR.mergeable === false || 
                                   fullPR.mergeable_state === 'dirty' ||
                                   fullPR.mergeable_state === 'blocked'

              openSourcePRs.push({
                id: fullPR.id,
                number: fullPR.number,
                title: fullPR.title,
                body: fullPR.body,
                state,
                url: fullPR.html_url,
                createdAt: fullPR.created_at,
                updatedAt: fullPR.updated_at,
                author: {
                  login: fullPR.user.login,
                  avatarUrl: fullPR.user.avatar_url,
                },
                repository: {
                  id: repo.id,
                  name: repo.name,
                  fullName: repo.full_name,
                  owner: repo.owner.login,
                  ownerType: repo.owner.type,
                  language: repo.language,
                  license: repo.license?.name || repo.license?.key || null,
                },
                baseRef: fullPR.base.ref,
                headRef: fullPR.head.ref,
                hasConflicts: hasConflicts,
                mergeableState: fullPR.mergeable_state || null,
                reviewState: fullPR.draft ? 'draft' : (fullPR.requested_reviewers?.length > 0 ? 'pending_review' : null),
              })
            } else {
              console.warn(`[PRs API] Failed to fetch PR details for ${repoFullName}#${pr.number}:`, fullPRResponse.status)
            }
          } catch (error) {
            console.error(`[PRs API] Error fetching PR details for ${repoFullName}#${pr.number}:`, error)
          }
        } else {
          console.log(`[PRs API] Excluding PR #${pr.number} from ${repoFullName} (not open source)`)
        }
      } else {
        const errorText = await repoResponse.text().catch(() => '')
        console.warn(`[PRs API] Failed to fetch repository ${repoFullName}:`, repoResponse.status, errorText.substring(0, 100))
      }
    }

    // Sort by updated date (most recent first)
    openSourcePRs.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )

    console.log(`[PRs API] Summary:`)
    console.log(`  - Total PRs found: ${prs.length}`)
    console.log(`  - Processed: ${processedCount}`)
    console.log(`  - Skipped (no repo name): ${skippedCount}`)
    console.log(`  - Open source PRs included: ${openSourcePRs.length}`)
    console.log(`[PRs API] Returning ${openSourcePRs.length} open source PRs out of ${prs.length} total PRs`)
    
    if (openSourcePRs.length === 0 && prs.length > 0) {
      console.warn(`[PRs API] ⚠️  WARNING: Found ${prs.length} PRs but all were filtered out!`)
      console.warn(`[PRs API] Processed: ${processedCount}, Skipped: ${skippedCount}`)
      
      // Show sample of what we tried to process
      const sampleRepos = prs.slice(0, 10).map(pr => {
        if (pr.repository?.full_name) return pr.repository.full_name
        const match = pr.html_url?.match(/github\.com\/([^\/]+\/[^\/]+)\/pull/)
        return match ? match[1] : 'unknown'
      })
      console.warn(`[PRs API] Sample repos attempted:`, sampleRepos)
    }

    return NextResponse.json({ 
      pullRequests: openSourcePRs,
      total: openSourcePRs.length
    })
  } catch (error) {
    console.error("Error fetching pull requests:", error)
    return NextResponse.json(
      { error: "Failed to fetch pull requests" },
      { status: 500 }
    )
  }
}

