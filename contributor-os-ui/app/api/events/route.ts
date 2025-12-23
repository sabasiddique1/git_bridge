/**
 * EVENTS API ROUTE
 * 
 * GET /api/events - List events with filtering
 * 
 * Fetches real GitHub activity events from user's open source repositories
 */

import { NextRequest, NextResponse } from "next/server"
import type { EventFilter, AppEvent } from "@/types/events"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const filter: EventFilter = {
      types: searchParams.get("types")?.split(",").filter(Boolean) as any,
      sources: searchParams.get("sources")?.split(",").filter(Boolean) as any,
      repositories: searchParams.get("repositories")?.split(",").filter(Boolean),
      languages: searchParams.get("languages")?.split(",").filter(Boolean),
      needsAction: searchParams.get("needsAction") === "true",
    }

    // Fetch real GitHub activity events
    const activityResponse = await fetch(
      new URL("/api/auth/github/activity", request.url),
      {
        headers: {
          Cookie: request.headers.get("cookie") || "",
        },
      }
    )

    if (!activityResponse.ok) {
      // If not authenticated, return empty array
      if (activityResponse.status === 401) {
        return NextResponse.json([])
      }
      throw new Error("Failed to fetch activity")
    }

    const activityData = await activityResponse.json()
    let events: AppEvent[] = activityData.events || []

    // Apply filters
    if (filter.types && filter.types.length > 0) {
      events = events.filter((e) => filter.types!.includes(e.type))
    }

    if (filter.sources && filter.sources.length > 0) {
      events = events.filter((e) => filter.sources!.includes(e.source))
    }

    if (filter.repositories && filter.repositories.length > 0) {
      events = events.filter((e) => {
        if ("repository" in e) {
          return filter.repositories!.includes(e.repository.fullName)
        }
        return false
      })
    }

    if (filter.languages && filter.languages.length > 0) {
      events = events.filter((e) => {
        if ("repository" in e && e.repository.language) {
          return filter.languages!.includes(e.repository.language)
        }
        return false
      })
    }

    if (filter.needsAction) {
      // Filter for events that need action (open PRs, review requests, etc.)
      events = events.filter((e) => {
        if (e.type === "github.pr.opened" || e.type === "github.pr.review_requested") {
          return true
        }
        if (e.type === "github.issue.opened") {
          return true
        }
        return false
      })
    }

    return NextResponse.json(events)
  } catch (error) {
    console.error("Error fetching events:", error)
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    )
  }
}





