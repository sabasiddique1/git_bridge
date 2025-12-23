/**
 * GITHUB ACTIVITY API
 * 
 * GET /api/auth/github/activity - Fetch user's GitHub activity events
 * 
 * Fetches activity from user's open source repositories including:
 * - Pull Requests (opened, closed, merged)
 * - Issues (opened, closed)
 * - Comments (on PRs/issues)
 * - Reviews (PR reviews)
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
    // Get access token from cookie
    const accessTokenCookie = request.cookies.get("github_access_token")
    
    if (!accessTokenCookie || !accessTokenCookie.value) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      )
    }

    const accessToken = accessTokenCookie.value

    // Get user info
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

    // Get user's open source repositories (same logic as repos endpoint)
    const reposResponse = await fetch(
      new URL("/api/auth/github/repos", request.url),
      {
        headers: {
          Cookie: request.headers.get("cookie") || "",
        },
      }
    )

    if (!reposResponse.ok) {
      return NextResponse.json({ events: [] })
    }

    const reposData = await reposResponse.json()
    const repos = reposData.repos || []
    const repoFullNames = repos.map((r: any) => r.fullName)

    if (repoFullNames.length === 0) {
      return NextResponse.json({ events: [] })
    }

    const events: AppEvent[] = []

    // Fetch events for each repository
    for (const repoFullName of repoFullNames) {
      const [owner, repo] = repoFullName.split("/")

      try {
        // 1. Fetch Pull Requests where user is author
        const prsResponse = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/pulls?state=all&per_page=100&sort=updated`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: "application/vnd.github.v3+json",
            },
          }
        )

        if (prsResponse.ok) {
          const prs: GitHubPR[] = await prsResponse.json()
          
          for (const pr of prs) {
            // Only include PRs where user is author
            if (pr.user.login === userLogin) {
              let prState: "open" | "closed" | "merged" = "open"
              let eventType: PullRequestEvent["type"]

              if (pr.merged_at) {
                prState = "merged"
                eventType = "github.pr.merged"
              } else if (pr.state === "closed") {
                prState = "closed"
                eventType = "github.pr.closed"
              } else {
                eventType = "github.pr.opened"
              }

              const prEvent: PullRequestEvent = {
                id: `pr-${pr.id}`,
                type: eventType,
                timestamp: new Date(pr.updated_at),
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
          }
        }

        // 2. Fetch Issues where user is author
        const issuesResponse = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/issues?state=all&per_page=100&sort=updated&creator=${userLogin}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: "application/vnd.github.v3+json",
            },
          }
        )

        if (issuesResponse.ok) {
          const issues: GitHubIssue[] = await issuesResponse.json()
          
          for (const issue of issues) {
            // Skip PRs (they're already handled)
            if (issue.pull_request) continue

            const issueEvent: IssueEvent = {
              id: `issue-${issue.id}`,
              type: issue.state === "closed" ? "github.issue.closed" : "github.issue.opened",
              timestamp: new Date(issue.updated_at),
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
                state: issue.state,
                url: issue.html_url,
              },
            }

            events.push(issueEvent)
          }
        }

        // 3. Fetch PR Reviews where user is reviewer
        // Get PRs first, then fetch reviews for each
        const prsForReviewsResponse = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/pulls?state=all&per_page=50&sort=updated`,
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
          }
        }

        // 4. Fetch Comments on Issues/PRs where user is author
        // Get issues/PRs first, then fetch comments
        const issuesForCommentsResponse = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/issues?state=all&per_page=50&sort=updated`,
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
                        title: issue.title,
                        url: issue.html_url,
                      },
                    },
                  }

                  events.push(commentEvent)
                }
              }
            }
          }
        }

      } catch (error) {
        console.error(`Error fetching events for ${repoFullName}:`, error)
        // Continue with other repos
      }
    }

    // Sort events by timestamp (most recent first)
    events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

    // Limit to most recent 100 events
    const limitedEvents = events.slice(0, 100)

    return NextResponse.json({ 
      events: limitedEvents,
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

