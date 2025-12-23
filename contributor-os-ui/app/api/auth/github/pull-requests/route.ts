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
 * Check if a repository is open source - STRICT: Must have a license
 * Only include repos that have an open source license
 */
function isOpenSourceRepository(repo: any, userLogin: string): boolean {
  // Exclude private repos
  if (repo.private) {
    console.log(`[PRs API] Excluding ${repo.full_name}: private repo`)
    return false
  }

  // STRICT: Must have a license to be considered open source
  if (!repo.license || !repo.license.key) {
    console.log(`[PRs API] Excluding ${repo.full_name}: no license (not open source)`)
    return false
  }

  // Exclude "NOASSERTION" and "NONE" licenses (not real open source licenses)
  if (repo.license.key === "NOASSERTION" || repo.license.key === "NONE") {
    console.log(`[PRs API] Excluding ${repo.full_name}: invalid license (${repo.license.key})`)
    return false
  }

  // If it has a valid license, it's open source
  console.log(`[PRs API] Including ${repo.full_name}: has open source license (${repo.license.key})`)
  return true
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

    // Step 1: Extract repo names and deduplicate
    const repoMap = new Map<string, { prs: typeof prs }>()
    
    for (const pr of prs) {
      // Extract repository full_name from multiple possible locations
      let repoFullName = pr.repository?.full_name
      
      // If not in repository object, extract from html_url
      if (!repoFullName && pr.html_url) {
        const match = pr.html_url.match(/github\.com\/([^\/]+\/[^\/]+)\/pull/)
        if (match) {
          repoFullName = match[1]
        }
      }
      
      // If still not found, try repository_url
      if (!repoFullName && pr.repository_url) {
        const match = pr.repository_url.match(/\/repos\/([^\/]+\/[^\/]+)$/)
        if (match) {
          repoFullName = match[1]
        }
      }
      
      if (repoFullName) {
        if (!repoMap.has(repoFullName)) {
          repoMap.set(repoFullName, { prs: [] })
        }
        repoMap.get(repoFullName)!.prs.push(pr)
      }
    }

    console.log(`[PRs API] Found ${repoMap.size} unique repositories`)

    // Step 2: Fetch repository details in parallel (batch of 10 at a time)
    const repoDetails = new Map<string, any>()
    const repoEntries = Array.from(repoMap.entries())
    const BATCH_SIZE = 10

    for (let i = 0; i < repoEntries.length; i += BATCH_SIZE) {
      const batch = repoEntries.slice(i, i + BATCH_SIZE)
      console.log(`[PRs API] Fetching repo details batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(repoEntries.length / BATCH_SIZE)}`)
      
      const repoPromises = batch.map(async ([repoFullName, { prs }]) => {
        try {
          const repoResponse = await fetch(`https://api.github.com/repos/${repoFullName}`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: "application/vnd.github.v3+json",
            },
          })

          if (repoResponse.ok) {
            const repo = await repoResponse.json()
            const isOpenSource = isOpenSourceRepository(repo, userLogin)
            if (isOpenSource) {
              repoDetails.set(repoFullName, repo)
              return { repoFullName, repo, prs }
            }
          }
          return null
        } catch (error) {
          console.error(`[PRs API] Error fetching repo ${repoFullName}:`, error)
          return null
        }
      })

      const results = await Promise.all(repoPromises)
      const openSourceRepos = results.filter(Boolean) as Array<{ repoFullName: string; repo: any; prs: typeof prs }>

      // Step 3: Fetch PR details in parallel for open source repos (batch of 5 PRs at a time)
      for (const { repoFullName, repo, prs: repoPRs } of openSourceRepos) {
        for (let j = 0; j < repoPRs.length; j += 5) {
          const prBatch = repoPRs.slice(j, j + 5)
          
          const prPromises = prBatch.map(async (pr) => {
            try {
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

                // Determine review state with better logic
                // Priority: draft > pending_review > null
                let reviewState: "draft" | "pending_review" | null = null
                
                if (fullPR.draft) {
                  reviewState = 'draft'
                } else if (state === 'open') {
                  // For open PRs, check if review is requested or pending
                  // Check requested_reviewers (individual users)
                  const hasRequestedReviewers = fullPR.requested_reviewers && fullPR.requested_reviewers.length > 0
                  // Check requested_teams (teams)
                  const hasRequestedTeams = fullPR.requested_teams && fullPR.requested_teams.length > 0
                  // Check if PR is open and not merged (needs review)
                  // If PR is open, not draft, and has reviewers requested, it's pending review
                  if (hasRequestedReviewers || hasRequestedTeams) {
                    reviewState = 'pending_review'
                  } else {
                    // Open PR without explicit reviewers might still need review
                    // But we'll only mark as pending_review if reviewers are explicitly requested
                    reviewState = null
                  }
                }
                // Closed/merged PRs don't need review, so reviewState stays null

                console.log(`[PRs API] PR #${fullPR.number} review state:`, {
                  draft: fullPR.draft,
                  state,
                  requested_reviewers: fullPR.requested_reviewers?.length || 0,
                  requested_teams: fullPR.requested_teams?.length || 0,
                  reviewState,
                })

                return {
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
                  reviewState: reviewState,
                } as PullRequest
              }
              return null
            } catch (error) {
              console.error(`[PRs API] Error fetching PR ${repoFullName}#${pr.number}:`, error)
              return null
            }
          })

          const prResults = await Promise.all(prPromises)
          const validPRs = prResults.filter(Boolean) as PullRequest[]
          openSourcePRs.push(...validPRs)
        }
      }

      // Small delay between batches to avoid rate limiting
      if (i + BATCH_SIZE < repoEntries.length) {
        await new Promise(resolve => setTimeout(resolve, 200))
      }
    }

    // Sort by updated date (most recent first)
    openSourcePRs.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )

    console.log(`[PRs API] Summary:`)
    console.log(`  - Total PRs found: ${prs.length}`)
    console.log(`  - Unique repositories: ${repoMap.size}`)
    console.log(`  - Open source repositories: ${repoDetails.size}`)
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

