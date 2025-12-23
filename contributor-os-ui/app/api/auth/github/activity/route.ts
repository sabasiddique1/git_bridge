/**
 * GITHUB ACTIVITY API
 * 
 * GET /api/auth/github/activity - Fetch user's GitHub activity events
 * 
 * Fetches comprehensive activity from user's open source repositories including:
 * - Pull Requests (opened, closed, merged)
 * - Issues (opened, closed)
 * - Comments (on PRs/issues)
 * - Reviews (PR reviews)
 * - Commits (pushed to PRs)
 * - Pushes (to repositories)
 * - Notes (user's notes linked to PRs/issues)
 */

import { NextRequest, NextResponse } from "next/server"
import type { AppEvent, PullRequestEvent, IssueEvent, CommentEvent, ReviewEvent } from "@/types/events"

interface GitHubPR {
  id: number
  number: number
  title: string
  body: string | null
  state: "open" | "closed"
  merged_at: string | null
  created_at: string
  updated_at: string
  user: {
    login: string
    avatar_url: string
  }
  repository: {
    id: number
    name: string
    full_name: string
    owner: {
      login: string
      type: string
    }
    language: string | null
    license: {
      key: string
      name: string
    } | null
  }
  html_url: string
  base: {
    ref: string
  }
  head: {
    ref: string
  }
}

interface GitHubIssue {
  id: number
  number: number
  title: string
  body: string | null
  state: "open" | "closed"
  created_at: string
  updated_at: string
  user: {
    login: string
    avatar_url: string
  }
  repository: {
    id: number
    name: string
    full_name: string
    owner: {
      login: string
      type: string
    }
    language: string | null
    license: {
      key: string
      name: string
    } | null
  }
  html_url: string
  pull_request?: {
    url: string
  }
}

interface GitHubComment {
  id: number
  body: string
  created_at: string
  updated_at: string
  user: {
    login: string
    avatar_url: string
  }
  html_url: string
  issue_url?: string
  pull_request_url?: string
}

interface GitHubReview {
  id: number
  state: "APPROVED" | "CHANGES_REQUESTED" | "COMMENTED"
  body: string | null
  submitted_at: string
  user: {
    login: string
    avatar_url: string
  }
  html_url: string
  pull_request_url: string
}

export async function GET(request: NextRequest) {
  try {
    console.log("[Activity API] Starting activity fetch...")
    
    // Get access token from cookie
    const accessTokenCookie = request.cookies.get("github_access_token")
    
    if (!accessTokenCookie || !accessTokenCookie.value) {
      console.error("[Activity API] No access token found in cookies")
      return NextResponse.json(
        { error: "Not authenticated", events: [] },
        { status: 401 }
      )
    }

    const accessToken = accessTokenCookie.value
    console.log("[Activity API] Access token found (length:", accessToken.length, "), fetching user info...")

    // Get user info to verify token is valid
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    })

    if (!userResponse.ok) {
      const errorText = await userResponse.text().catch(() => "Unknown error")
      console.error(`[Activity API] Failed to fetch user info: ${userResponse.status} ${errorText}`)
      console.error(`[Activity API] This means the access token is invalid or expired`)
      return NextResponse.json(
        { error: "Invalid or expired access token", events: [] },
        { status: 401 }
      )
    }

    const user = await userResponse.json()
    const userLogin = user.login
    console.log(`[Activity API] ✅ Authenticated as user: ${userLogin} (ID: ${user.id})`)

    // Get user's open source repositories (same logic as repos endpoint)
    const reposUrl = new URL("/api/auth/github/repos", request.url)
    console.log(`[Activity API] Fetching repos from: ${reposUrl.toString()}`)
    
    const reposResponse = await fetch(reposUrl, {
      headers: {
        Cookie: request.headers.get("cookie") || "",
      },
    })

    console.log(`[Activity API] Repos response status: ${reposResponse.status} ${reposResponse.statusText}`)

    if (!reposResponse.ok) {
      const errorText = await reposResponse.text().catch(() => "Unknown error")
      console.error(`[Activity API] Failed to fetch repos: ${reposResponse.status} ${errorText}`)
      
      if (reposResponse.status === 401) {
        return NextResponse.json({ 
          events: [], 
          error: "Not authenticated. Please log in with GitHub.",
          authenticated: false
        }, { status: 401 })
      }
      
      return NextResponse.json({ 
        events: [], 
        error: `Failed to fetch repositories: ${reposResponse.status}` 
      })
    }

    const reposData = await reposResponse.json()
    console.log(`[Activity API] Repos data:`, {
      hasRepos: !!reposData.repos,
      reposLength: reposData.repos?.length || 0,
      error: reposData.error,
    })
    
    const repos = reposData.repos || []
    const repoFullNames = repos.map((r: any) => r.fullName || r.full_name)

    console.log(`[Activity API] Found ${repoFullNames.length} repositories:`, repoFullNames.slice(0, 5))

    if (repoFullNames.length === 0) {
      console.log("[Activity API] No repositories found, returning empty events")
      return NextResponse.json({ 
        events: [],
        message: "No open source repositories found. Make sure you have public repositories with licenses."
      })
    }

    const events: AppEvent[] = []

    // ALSO: Fetch user's activity events from GitHub Events API
    // This captures activity across ALL repositories, not just owned ones
    // Try BOTH endpoints: /user/events (authenticated) and /users/{username}/events/public (public)
    console.log(`[Activity API] ===== FETCHING FROM GITHUB EVENTS API =====`)
    console.log(`[Activity API] User login: ${userLogin}`)
    
    try {
      let eventsToProcess: any[] = []
      
      // First, try authenticated /user/events endpoint (works with private activity)
      const userEventsUrl = `https://api.github.com/user/events?per_page=100`
      console.log(`[Activity API] Trying authenticated endpoint: ${userEventsUrl}`)
      
      const userEventsResponse = await fetch(userEventsUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "Contributor-OS",
        },
      })
      
      console.log(`[Activity API] Authenticated endpoint response: ${userEventsResponse.status} ${userEventsResponse.statusText}`)
      
      if (userEventsResponse.ok) {
        const authenticatedEvents = await userEventsResponse.json()
        console.log(`[Activity API] ✅ Authenticated endpoint returned ${authenticatedEvents.length} events`)
        eventsToProcess = authenticatedEvents
      } else {
        const errorText = await userEventsResponse.text().catch(() => "Unknown error")
        console.warn(`[Activity API] ⚠️ Authenticated endpoint failed: ${userEventsResponse.status} - ${errorText}`)
      }
      
      // Also try public events endpoint (in case user made activity public)
      const publicEventsUrl = `https://api.github.com/users/${userLogin}/events/public?per_page=100`
      console.log(`[Activity API] Also trying public endpoint: ${publicEventsUrl}`)
      
      const publicEventsResponse = await fetch(publicEventsUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "Contributor-OS",
        },
      })
      
      console.log(`[Activity API] Public endpoint response: ${publicEventsResponse.status} ${publicEventsResponse.statusText}`)
      
      if (publicEventsResponse.ok) {
        const publicEvents = await publicEventsResponse.json()
        console.log(`[Activity API] ✅ Public endpoint returned ${publicEvents.length} events`)
        
        // Merge events from both endpoints, deduplicate by event ID
        const existingIds = new Set(eventsToProcess.map((e: any) => e.id))
        const newEvents = publicEvents.filter((e: any) => !existingIds.has(e.id))
        eventsToProcess = [...eventsToProcess, ...newEvents]
        console.log(`[Activity API] Combined total: ${eventsToProcess.length} unique events`)
      } else {
        const publicErrorText = await publicEventsResponse.text().catch(() => "Unknown error")
        console.warn(`[Activity API] ⚠️ Public endpoint failed: ${publicEventsResponse.status} - ${publicErrorText}`)
      }
      
      if (eventsToProcess.length > 0) {
        console.log(`[Activity API] ✅ Successfully fetched ${eventsToProcess.length} total events from GitHub`)
        console.log(`[Activity API] Sample event types:`, eventsToProcess.slice(0, 5).map((e: any) => ({
          type: e.type,
          repo: e.repo?.full_name,
          created: e.created_at,
          actor: e.actor?.login,
        })))
      } else {
        console.warn(`[Activity API] ⚠️ No events found from either endpoint`)
      }
      
      if (eventsToProcess.length > 0) {
        const userEvents = eventsToProcess
        
        // Initialize counters
        let processedCount = 0
        let skippedCount = 0
        
        // Log all event types we received
        const eventTypeCounts = userEvents.reduce((acc: any, e: any) => {
          acc[e.type] = (acc[e.type] || 0) + 1
          return acc
        }, {})
        console.log(`[Activity API] Event types received from GitHub:`, eventTypeCounts)
        
        // Process GitHub events and convert to our event format
        // IMPORTANT: Process ALL events, not just from owned repos
        // This captures contributions to other repositories
        console.log(`[Activity API] Processing ${userEvents.length} events from GitHub...`)
        console.log(`[Activity API] User login to match: "${userLogin}"`)
        
        for (const ghEvent of userEvents.slice(0, 100)) { // Limit to 100 most recent
          try {
            // GitHub Events API structure: repo is an object with {id, name}
            // We need to get full_name from the PR/Issue payload or construct it
            let eventRepoFullName: string | undefined
            
            // Try to get repo from event.repo (GitHub Events API format)
            if (ghEvent.repo && typeof ghEvent.repo === 'object') {
              // GitHub Events API: repo has {id, name} where name is "owner/repo"
              if (ghEvent.repo.name) {
                eventRepoFullName = ghEvent.repo.name
              } else if (ghEvent.repo.full_name) {
                eventRepoFullName = ghEvent.repo.full_name
              }
            }
            
            // For PullRequestEvents, also check the PR payload for repo info
            if (!eventRepoFullName && ghEvent.type === "PullRequestEvent" && ghEvent.payload?.pull_request) {
              const pr = ghEvent.payload.pull_request
              eventRepoFullName = pr.head?.repo?.full_name || pr.base?.repo?.full_name
            }
            
            // For IssuesEvents, check the issue payload
            if (!eventRepoFullName && ghEvent.type === "IssuesEvent" && ghEvent.payload?.issue) {
              const issue = ghEvent.payload.issue
              // Issues don't always have repo in payload, but we can get it from the issue URL
              if (issue.html_url) {
                const urlMatch = issue.html_url.match(/github\.com\/([^\/]+\/[^\/]+)/)
                if (urlMatch) {
                  eventRepoFullName = urlMatch[1]
                }
              }
            }
            
            // Log PullRequestEvents for debugging
            if (ghEvent.type === "PullRequestEvent") {
              const eventIndex = userEvents.indexOf(ghEvent)
              console.log(`[Activity API] 🔍 PullRequestEvent #${eventIndex + 1}:`, {
                repoFromEvent: ghEvent.repo,
                repoFromPR: ghEvent.payload?.pull_request?.head?.repo?.full_name || ghEvent.payload?.pull_request?.base?.repo?.full_name,
                finalRepo: eventRepoFullName || 'MISSING',
                action: ghEvent.payload?.action,
                prUser: ghEvent.payload?.pull_request?.user?.login,
                prNumber: ghEvent.payload?.pull_request?.number,
                prTitle: ghEvent.payload?.pull_request?.title?.substring(0, 40),
              })
            }
            
            if (!eventRepoFullName) {
              skippedCount++
              if (ghEvent.type === "PullRequestEvent") {
                console.warn(`[Activity API] ⚠️ Skipping PullRequestEvent - no repo info found`)
              }
              continue
            }
            
            // Convert GitHub event types to our event types
            const action = ghEvent.payload?.action // opened, closed, etc.
            
            if (ghEvent.type === "PullRequestEvent" && ghEvent.payload?.pull_request) {
              const pr = ghEvent.payload.pull_request
              const prUserLogin = pr.user?.login
              const actorLogin = ghEvent.actor?.login
              
              // IMPORTANT: GitHub Events API structure
              // - ghEvent.actor.login = user who performed the action (opened/closed/merged)
              // - pr.user.login = PR author (often undefined in Events API payload)
              // For PullRequestEvents in Events API, if actor is the user, they performed the action!
              
              const isUserActor = actorLogin?.toLowerCase() === userLogin.toLowerCase()
              const isRelevantAction = action === "opened" || action === "closed" || action === "merged"
              
              // Log first few PR events for debugging
              if (userEvents.indexOf(ghEvent) < 5) {
                console.log(`[Activity API] 🔍 PullRequestEvent found:`, {
                  action: action,
                  actor: actorLogin,
                  prUser: prUserLogin,
                  expectedUser: userLogin,
                  isUserActor: isUserActor,
                  prNumber: pr.number,
                  prTitle: pr.title?.substring(0, 50) || 'NO TITLE',
                  repo: eventRepoFullName,
                })
              }
              
              // Process PR events if user is the actor (they performed the action)
              if (isUserActor && isRelevantAction) {
                // Use repo from PR if event repo is missing
                const repoFullName = eventRepoFullName || pr.head?.repo?.full_name || pr.base?.repo?.full_name
                if (!repoFullName) {
                  console.warn(`[Activity API] ⚠️ Skipping PR - no repo info: PR #${pr.number}`)
                  skippedCount++
                  continue
                }
                let eventType: "github.pr.opened" | "github.pr.closed" | "github.pr.merged" = "github.pr.opened"
                let prState: "open" | "closed" | "merged" = "open"
                
                if (action === "closed") {
                  prState = pr.merged ? "merged" : "closed"
                  eventType = pr.merged ? "github.pr.merged" : "github.pr.closed"
                }
                
                const repoInfo = typeof ghEvent.repo === 'object' && ghEvent.repo !== null 
                  ? ghEvent.repo 
                  : { id: pr.head?.repo?.id || pr.base?.repo?.id || 0, name: repoFullName.split("/")[1] || "" }
                
                const prEvent: PullRequestEvent = {
                  id: `gh-event-pr-${pr.id}-${ghEvent.id}`,
                  type: eventType,
                  timestamp: new Date(ghEvent.created_at),
                  source: "github",
                  repository: {
                    id: repoInfo.id || 0,
                    name: repoInfo.name || repoFullName.split("/")[1] || "",
                    fullName: repoFullName,
                    owner: repoFullName.split("/")[0],
                    url: `https://github.com/${repoFullName}`,
                  },
                  actor: {
                    login: actorLogin || pr.user?.login || userLogin,
                    avatarUrl: ghEvent.actor?.avatar_url || pr.user?.avatar_url || "",
                  },
                  pullRequest: {
                    number: pr.number,
                    title: pr.title || `PR #${pr.number}`,
                    body: pr.body || undefined,
                    state: prState,
                    url: pr.html_url || `https://github.com/${repoFullName}/pull/${pr.number}`,
                    baseRef: pr.base?.ref || "main",
                    headRef: pr.head?.ref || "main",
                  },
                }
                events.push(prEvent)
                processedCount++
                const prTitle = pr.title || `PR #${pr.number}`
                console.log(`[Activity API] ✅ Added PR event: ${eventType} - ${prTitle.substring(0, 40)}...`)
              } else {
                skippedCount++
                if (userEvents.indexOf(ghEvent) < 5) {
                  console.log(`[Activity API] ⚠️ Skipped PR event:`, {
                    reason: !isUserActor ? 'user not actor' : 'action not relevant',
                    actor: actorLogin,
                    prUser: prUserLogin,
                    expectedUser: userLogin,
                    action: action
                  })
                }
              }
            } else if (ghEvent.type === "IssuesEvent" && ghEvent.payload?.issue) {
              const issue = ghEvent.payload.issue
              const issueUserLogin = issue.user?.login
              
              // Debug: Log Issue event details (only first few)
              if (userEvents.indexOf(ghEvent) < 3) {
                console.log(`[Activity API] Issue Event found:`, {
                  type: ghEvent.type,
                  action: action,
                  issueUser: issueUserLogin,
                  expectedUser: userLogin,
                  match: issueUserLogin?.toLowerCase() === userLogin.toLowerCase(),
                  isPR: !!issue.pull_request,
                  issueNumber: issue.number,
                  issueTitle: issue.title?.substring(0, 30),
                })
              }
              
              // Process issue events - check if user is author
              const isUserAuthor = issueUserLogin?.toLowerCase() === userLogin.toLowerCase()
              const isRelevantAction = action === "opened" || action === "closed"
              
              if (isUserAuthor && !issue.pull_request && isRelevantAction) {
                const issueEvent: IssueEvent = {
                  id: `gh-event-issue-${issue.id}-${ghEvent.id}`,
                  type: action === "opened" ? "github.issue.opened" : "github.issue.closed",
                  timestamp: new Date(ghEvent.created_at),
                  source: "github",
                  repository: {
                    id: ghEvent.repo.id,
                    name: ghEvent.repo.name,
                    fullName: eventRepoFullName,
                    owner: eventRepoFullName.split("/")[0],
                    url: `https://github.com/${eventRepoFullName}`,
                  },
                  actor: {
                    login: issue.user.login,
                    avatarUrl: issue.user.avatar_url,
                  },
                  issue: {
                    number: issue.number,
                    title: issue.title,
                    body: issue.body || undefined,
                    state: issue.state as "open" | "closed",
                    url: issue.html_url,
                  },
                }
                events.push(issueEvent)
                processedCount++
                console.log(`[Activity API] ✅ Added Issue event: ${action} - ${issue.title.substring(0, 40)}...`)
              } else {
                skippedCount++
                if (userEvents.indexOf(ghEvent) < 3) {
                  console.log(`[Activity API] ⚠️ Skipped Issue event:`, {
                    reason: !isUserAuthor ? 'user not author' : issue.pull_request ? 'is PR' : 'action not relevant',
                    issueUser: issueUserLogin,
                    expectedUser: userLogin,
                    action: action
                  })
                }
              }
            } else if (ghEvent.type === "PullRequestReviewEvent" && ghEvent.payload?.review) {
              // Handle PR reviews
              const review = ghEvent.payload.review
              const pr = ghEvent.payload.pull_request
              const reviewUserLogin = review.user?.login
              
              const isUserReviewer = reviewUserLogin?.toLowerCase() === userLogin.toLowerCase()
              
              if (userEvents.indexOf(ghEvent) < 3) {
                console.log(`[Activity API] Review Event found:`, {
                  type: ghEvent.type,
                  reviewUser: reviewUserLogin,
                  expectedUser: userLogin,
                  match: isUserReviewer,
                  prNumber: pr?.number,
                })
              }
              
              if (isUserReviewer && pr) {
                const reviewEvent: ReviewEvent = {
                  id: `gh-event-review-${review.id}-${ghEvent.id}`,
                  type: "github.pr.reviewed",
                  timestamp: new Date(ghEvent.created_at),
                  source: "github",
                  repository: {
                    id: ghEvent.repo.id,
                    name: ghEvent.repo.name,
                    fullName: eventRepoFullName,
                    owner: eventRepoFullName.split("/")[0],
                    url: `https://github.com/${eventRepoFullName}`,
                  },
                  actor: {
                    login: review.user.login,
                    avatarUrl: review.user.avatar_url,
                  },
                  review: {
                    id: review.id,
                    state: review.state.toLowerCase() as "approved" | "changes_requested" | "commented",
                    body: review.body || undefined,
                    url: review.html_url,
                    pullRequestNumber: pr.number,
                    pullRequestTitle: pr.title,
                    pullRequestUrl: pr.html_url,
                  },
                }
                events.push(reviewEvent)
                processedCount++
                console.log(`[Activity API] ✅ Added Review event: ${review.state} - PR #${pr.number}`)
              } else {
                skippedCount++
              }
            } else {
              skippedCount++
              // Log unhandled event types for debugging
              if (!["PushEvent", "CreateEvent", "DeleteEvent", "WatchEvent", "ForkEvent"].includes(ghEvent.type)) {
                console.log(`[Activity API] ⚠️ Unhandled event type: ${ghEvent.type} (repo: ${ghEvent.repo?.full_name})`)
              }
            }
          } catch (eventError) {
            console.error(`[Activity API] Error processing GitHub event:`, eventError)
            // Continue with next event
          }
        }
        console.log(`[Activity API] ===== GITHUB EVENTS API SUMMARY =====`)
        console.log(`[Activity API] Total events from GitHub: ${userEvents.length}`)
        console.log(`[Activity API] Processed: ${processedCount}`)
        console.log(`[Activity API] Skipped: ${skippedCount}`)
        console.log(`[Activity API] Events added to timeline: ${events.length}`)
        
        if (events.length === 0 && userEvents.length > 0) {
          console.error(`[Activity API] ❌❌❌ PROBLEM DETECTED ❌❌❌`)
          console.error(`[Activity API] GitHub returned ${userEvents.length} events but 0 were processed!`)
          console.error(`[Activity API] User login from GitHub API: "${userLogin}"`)
          console.error(`[Activity API] Sample event details:`, userEvents.slice(0, 3).map((e: any) => ({
            type: e.type,
            actor: e.actor?.login,
            prUser: e.payload?.pull_request?.user?.login,
            issueUser: e.payload?.issue?.user?.login,
            reviewUser: e.payload?.review?.user?.login,
            action: e.payload?.action,
          })))
          console.error(`[Activity API] Check if username matching is failing!`)
        }
      } else {
        console.warn(`[Activity API] Failed to fetch user events: ${userEventsResponse.status}`)
      }
    } catch (userEventsError) {
      console.error(`[Activity API] Error fetching user events:`, userEventsError)
      // Continue with repository-based fetching
    }

    // Fetch events for each repository
    console.log(`[Activity API] Processing ${repoFullNames.length} repositories...`)
    
    for (const repoFullName of repoFullNames) {
      const [owner, repo] = repoFullName.split("/")
      console.log(`[Activity API] Processing repository: ${repoFullName}`)

      try {
        // 1. Fetch ALL Pull Requests (open, closed, merged) where user is author
        // Fetch all pages to get all time activity
        let allPRs: GitHubPR[] = []
        let page = 1
        let hasMore = true
        
        while (hasMore) {
          const prsUrl = `https://api.github.com/repos/${owner}/${repo}/pulls?state=all&per_page=100&page=${page}&sort=created&direction=desc`
          console.log(`[Activity API] Fetching PRs from: ${prsUrl}`)
          
          const prsResponse = await fetch(prsUrl, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: "application/vnd.github.v3+json",
            },
          })

          if (prsResponse.ok) {
            const prs: GitHubPR[] = await prsResponse.json()
            console.log(`[Activity API] Received ${prs.length} PRs from ${repoFullName} (page ${page})`)
            
            // Filter PRs where user is author
            const userPRs = prs.filter(pr => pr.user.login === userLogin)
            console.log(`[Activity API] Found ${userPRs.length} PRs authored by ${userLogin} in ${repoFullName}`)
            allPRs.push(...userPRs)
            
            // If we got less than 100, we've reached the end
            if (prs.length < 100) {
              hasMore = false
            } else {
              page++
            }
          } else {
            const errorText = await prsResponse.text().catch(() => "Unknown error")
            console.error(`[Activity API] Error fetching PRs for ${repoFullName}: ${prsResponse.status} ${errorText}`)
            hasMore = false
          }
        }
        
        console.log(`[Activity API] Total PRs found in ${repoFullName}: ${allPRs.length}`)
        
        // Create events for all PRs
        for (const pr of allPRs) {
          // Determine PR state and event type
          let prState: "open" | "closed" | "merged" = pr.state === "open" ? "open" : "closed"
          let eventType: "github.pr.opened" | "github.pr.closed" | "github.pr.merged" = "github.pr.opened"
          
          if (pr.merged_at) {
            prState = "merged"
            eventType = "github.pr.merged"
          } else if (pr.state === "closed") {
            eventType = "github.pr.closed"
          }

          const prEvent: PullRequestEvent = {
            id: `pr-${pr.id}`,
            type: eventType,
            timestamp: new Date(pr.created_at),
            source: "github",
            repository: {
              id: pr.repository.id,
              name: pr.repository.name,
              fullName: pr.repository.full_name,
              owner: pr.repository.owner.login,
              language: pr.repository.language || undefined,
              url: `https://github.com/${pr.repository.full_name}`,
            },
            actor: {
              login: pr.user.login,
              avatarUrl: pr.user.avatar_url,
            },
            pullRequest: {
              number: pr.number,
              title: pr.title,
              body: pr.body || undefined,
              state: prState,
              url: pr.html_url,
              baseRef: pr.base.ref,
              headRef: pr.head.ref,
            },
          }

          events.push(prEvent)
        }

        // 2. Fetch Issues (open and closed) where user is author
        let allIssues: GitHubIssue[] = []
        page = 1
        hasMore = true
        
        while (hasMore) {
          const issuesUrl = `https://api.github.com/repos/${owner}/${repo}/issues?state=all&per_page=100&page=${page}&sort=created&direction=desc`
          console.log(`[Activity API] Fetching issues from: ${issuesUrl}`)
          
          const issuesResponse = await fetch(issuesUrl, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: "application/vnd.github.v3+json",
            },
          })

          if (issuesResponse.ok) {
            const issues: GitHubIssue[] = await issuesResponse.json()
            console.log(`[Activity API] Received ${issues.length} issues from ${repoFullName} (page ${page})`)
            
            // Filter out PRs (they have pull_request property) and filter by user
            const userIssues = issues.filter(
              issue => !issue.pull_request && issue.user.login === userLogin
            )
            console.log(`[Activity API] Found ${userIssues.length} issues authored by ${userLogin} in ${repoFullName}`)
            allIssues.push(...userIssues)
            
            if (issues.length < 100) {
              hasMore = false
            } else {
              page++
            }
          } else {
            const errorText = await issuesResponse.text().catch(() => "Unknown error")
            console.error(`[Activity API] Error fetching issues for ${repoFullName}: ${issuesResponse.status} ${errorText}`)
            hasMore = false
          }
        }
        
        console.log(`[Activity API] Total issues found in ${repoFullName}: ${allIssues.length}`)
        
        // Create events for all issues
        for (const issue of allIssues) {
          const issueEvent: IssueEvent = {
            id: `issue-${issue.id}`,
            type: issue.state === "open" ? "github.issue.opened" : "github.issue.closed",
            timestamp: new Date(issue.created_at),
            source: "github",
            repository: {
              id: issue.repository.id,
              name: issue.repository.name,
              fullName: issue.repository.full_name,
              owner: issue.repository.owner.login,
              language: issue.repository.language || undefined,
              url: `https://github.com/${issue.repository.full_name}`,
            },
            actor: {
              login: issue.user.login,
              avatarUrl: issue.user.avatar_url,
            },
            issue: {
              number: issue.number,
              title: issue.title,
              body: issue.body || undefined,
              state: issue.state as "open" | "closed",
              url: issue.html_url,
            },
          }

          events.push(issueEvent)
        }

        // 3. Fetch PR Reviews where user is reviewer
        // Get PRs first, then fetch reviews for each
        const prsForReviewsResponse = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/pulls?state=all&per_page=50&sort=updated&direction=desc`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: "application/vnd.github.v3+json",
            },
          }
        )

        if (prsForReviewsResponse.ok) {
          const prsForReviews: GitHubPR[] = await prsForReviewsResponse.json()
          
          for (const pr of prsForReviews) {
            try {
              const reviewsResponse = await fetch(
                `https://api.github.com/repos/${owner}/${repo}/pulls/${pr.number}/reviews`,
                {
                  headers: {
                    Authorization: `Bearer ${accessToken}`,
                    Accept: "application/vnd.github.v3+json",
                  },
                }
              )

              if (reviewsResponse.ok) {
                const reviews: GitHubReview[] = await reviewsResponse.json()
                
                for (const review of reviews) {
                  // Only include reviews by the user
                  if (review.user.login === userLogin) {
                    const reviewEvent: ReviewEvent = {
                      id: `review-${review.id}`,
                      type: "github.pr.reviewed",
                      timestamp: new Date(review.submitted_at),
                      source: "github",
                      repository: {
                        id: pr.repository.id,
                        name: pr.repository.name,
                        fullName: pr.repository.full_name,
                        owner: pr.repository.owner.login,
                        language: pr.repository.language || undefined,
                        url: `https://github.com/${pr.repository.full_name}`,
                      },
                      actor: {
                        login: review.user.login,
                        avatarUrl: review.user.avatar_url,
                      },
                      review: {
                        id: review.id,
                        state: review.state.toLowerCase() as "approved" | "changes_requested" | "commented",
                        body: review.body || undefined,
                        url: review.html_url,
                        pullRequestNumber: pr.number,
                        pullRequestTitle: pr.title,
                        pullRequestUrl: pr.html_url,
                      },
                    }

                    events.push(reviewEvent)
                  }
                }
              }
            } catch (reviewError) {
              console.error(`[Activity API] Error fetching reviews for PR ${pr.number} in ${repoFullName}:`, reviewError)
              // Continue with next PR
            }
          }
        }

        // 4. Fetch Comments on Issues/PRs where user is author
        // Get issues/PRs first, then fetch comments
        const issuesForCommentsResponse = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/issues?state=all&per_page=50&sort=updated&direction=desc`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: "application/vnd.github.v3+json",
            },
          }
        )

        if (issuesForCommentsResponse.ok) {
          const issuesForComments: GitHubIssue[] = await issuesForCommentsResponse.json()
          
          for (const issue of issuesForComments) {
            try {
              const commentsResponse = await fetch(
                `https://api.github.com/repos/${owner}/${repo}/issues/${issue.number}/comments`,
                {
                  headers: {
                    Authorization: `Bearer ${accessToken}`,
                    Accept: "application/vnd.github.v3+json",
                  },
                }
              )

              if (commentsResponse.ok) {
                const comments: GitHubComment[] = await commentsResponse.json()
                
                for (const comment of comments) {
                  // Only include comments by the user
                  if (comment.user.login === userLogin) {
                    const isPR = !!issue.pull_request
                    
                    const commentEvent: CommentEvent = {
                      id: `comment-${comment.id}`,
                      type: "github.comment.created",
                      timestamp: new Date(comment.created_at),
                      source: "github",
                      repository: {
                        id: issue.repository.id,
                        name: issue.repository.name,
                        fullName: issue.repository.full_name,
                        owner: issue.repository.owner.login,
                        language: issue.repository.language || undefined,
                        url: `https://github.com/${issue.repository.full_name}`,
                      },
                      actor: {
                        login: comment.user.login,
                        avatarUrl: comment.user.avatar_url,
                      },
                      comment: {
                        id: comment.id,
                        body: comment.body,
                        url: comment.html_url,
                        associatedWith: {
                          type: isPR ? "pr" : "issue",
                          number: issue.number,
                        },
                      },
                    }

                    events.push(commentEvent)
                  }
                }
              }
            } catch (commentError) {
              console.error(`[Activity API] Error fetching comments for issue ${issue.number} in ${repoFullName}:`, commentError)
              // Continue with next issue
            }
          }
        }

      } catch (error) {
        console.error(`[Activity API] Error fetching events for ${repoFullName}:`, error)
        // Continue with other repos
      }
    }

    // Sort events by timestamp (most recent first)
    events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

    // Return ALL events (no limit - showing all time activity)
    console.log(`[Activity API] ===== SUMMARY =====`)
    console.log(`[Activity API] Processed ${repoFullNames.length} repositories`)
    console.log(`[Activity API] Total events fetched: ${events.length}`)
    console.log(`[Activity API] Event breakdown:`)
    const eventTypes = events.reduce((acc, e) => {
      acc[e.type] = (acc[e.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    console.log(`[Activity API]`, eventTypes)
    
    if (events.length === 0) {
      console.warn(`[Activity API] WARNING: No events found! This could mean:`)
      console.warn(`[Activity API] - User has no PRs/issues in these repositories`)
      console.warn(`[Activity API] - User has no reviews/comments in these repositories`)
      console.warn(`[Activity API] - These are forks with no user contributions`)
      console.warn(`[Activity API] - Consider fetching activity from repositories user contributes to (not just owns)`)
    }

    return NextResponse.json({ 
      events: events, // Return all events, no limit
      total: events.length
    })
  } catch (error) {
    console.error("Error fetching GitHub activity:", error)
    return NextResponse.json(
      { error: "Failed to fetch activity", events: [] },
      { status: 500 }
    )
  }
}

