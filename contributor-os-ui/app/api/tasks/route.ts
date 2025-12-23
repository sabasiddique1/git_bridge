/**
 * TASKS API ROUTE
 * 
 * GET /api/tasks - List tasks (converted from user's open source PRs)
 * POST /api/tasks - Create task
 * 
 * Tasks are automatically created from user's open source PRs where they are the author.
 */

import { NextRequest, NextResponse } from "next/server"
import type { Task } from "@/types"

export async function GET(request: NextRequest) {
  try {
    console.log("[Tasks API] Starting fetch...")
    const cookies = request.headers.get("cookie") || ""
    console.log("[Tasks API] Cookies present:", cookies ? "Yes" : "No")
    
    // Get user's open source PRs and convert them to tasks
    const prsUrl = new URL("/api/auth/github/pull-requests", request.url)
    console.log("[Tasks API] Fetching from:", prsUrl.toString())
    
    const prsResponse = await fetch(prsUrl, {
      headers: {
        Cookie: cookies,
      },
    })

    console.log("[Tasks API] PRs API response status:", prsResponse.status)

    if (!prsResponse.ok) {
      // If not authenticated, return empty array
      if (prsResponse.status === 401) {
        console.log("[Tasks API] Not authenticated (401), returning empty array")
        return NextResponse.json([])
      }
      const errorText = await prsResponse.text()
      console.error("[Tasks API] Failed to fetch pull requests:", prsResponse.status, errorText.substring(0, 200))
      throw new Error(`Failed to fetch pull requests: ${prsResponse.status}`)
    }

    const prsData = await prsResponse.json()
    const prs = prsData.pullRequests || []
    
    console.log(`[Tasks API] Fetched ${prs.length} pull requests`)

    // Convert PRs to Tasks
    const tasks: Task[] = prs.map((pr: any) => {
      // Determine task status based on PR state
      let status: Task["status"] = "pending"
      if (pr.state === "merged") {
        status = "done"
      } else if (pr.state === "closed") {
        status = "waiting" // Closed but not merged - waiting for review/merge
      } else {
        status = "pending" // Open PR - pending action
      }

      // Ensure repository data exists
      const repoFullName = pr.repository?.fullName || pr.repository?.full_name || "unknown"
      
      return {
        id: `pr-${pr.id}`,
        title: pr.title || `PR #${pr.number}`,
        description: pr.body || `Pull Request #${pr.number} in ${repoFullName}`,
        status,
        createdAt: new Date(pr.createdAt || pr.created_at),
        updatedAt: new Date(pr.updatedAt || pr.updated_at),
        linkedEventId: `github.pr.${pr.state === "merged" ? "merged" : pr.state === "closed" ? "closed" : "opened"}-${pr.id}`,
        linkedPrNumber: pr.number,
        linkedIssueNumber: null,
        linkedRepo: repoFullName,
        // Add PR metadata for tags
        prState: pr.state, // "open" | "closed" | "merged"
        hasConflicts: pr.hasConflicts || false,
        reviewState: pr.reviewState || null, // "draft" | "pending_review" | null
      }
    })
    
    console.log(`[Tasks API] Converted ${tasks.length} PRs to tasks`)

    return NextResponse.json(tasks)
  } catch (error) {
    console.error("[Tasks API] Error fetching tasks:", error)
    // Return empty array instead of error to prevent UI breakage
    return NextResponse.json([])
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // TODO: Validate task data
    // TODO: Create task in database
    // const task = await taskService.create(body)
    
    // Placeholder: Return created task
    const task: Task = {
      id: `task-${Date.now()}`,
      title: body.title || "New Task",
      description: body.description,
      status: body.status || "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
      linkedEventId: body.linkedEventId,
      linkedPrNumber: body.linkedPrNumber,
      linkedIssueNumber: body.linkedIssueNumber,
      linkedRepo: body.linkedRepo,
    }

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error("Error creating task:", error)
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    )
  }
}





