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
    console.log(`[Events API] Fetching activity from /api/auth/github/activity`)
    const activityUrl = new URL("/api/auth/github/activity", request.url)
    console.log(`[Events API] Activity URL: ${activityUrl.toString()}`)
    
    const activityResponse = await fetch(activityUrl, {
      headers: {
        Cookie: request.headers.get("cookie") || "",
      },
    })

    console.log(`[Events API] Activity response status: ${activityResponse.status} ${activityResponse.statusText}`)

    if (!activityResponse.ok) {
      // If not authenticated, return empty array
      if (activityResponse.status === 401) {
        console.error(`[Events API] Not authenticated (401) - user needs to log in`)
        return NextResponse.json([])
      }
      const errorText = await activityResponse.text().catch(() => "Unknown error")
      console.error(`[Events API] Failed to fetch activity: ${activityResponse.status} ${errorText}`)
      throw new Error(`Failed to fetch activity: ${activityResponse.status} ${errorText}`)
    }

    const activityData = await activityResponse.json()
    console.log(`[Events API] Activity data received:`, {
      hasEvents: !!activityData.events,
      eventsLength: activityData.events?.length || 0,
      total: activityData.total,
      error: activityData.error,
    })
    
    let events: AppEvent[] = activityData.events || []

    console.log(`[Events API] Received ${events.length} events from activity API`)
    if (events.length > 0) {
      console.log(`[Events API] Sample events:`, events.slice(0, 3).map(e => ({ 
        id: e.id,
        type: e.type, 
        timestamp: e.timestamp,
        repo: "repository" in e ? e.repository.fullName : "N/A"
      })))
    } else {
      console.warn(`[Events API] No events received from activity API`)
    }

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
      // Filter for events that need action - ONLY OPEN PRs and OPEN issues (exclude merged/closed)
      events = events.filter((e) => {
        // Check PR events - only include if PR state is "open"
        if (e.type === "github.pr.opened" || e.type === "github.pr.review_requested") {
          if ("pullRequest" in e) {
            const prEvent = e as any
            // Only include if PR is actually open (not closed or merged)
            return prEvent.pullRequest?.state === "open"
          }
          return true // Include if we can't verify state
        }
        // Check issue events - only include if issue state is "open"
        if (e.type === "github.issue.opened") {
          if ("issue" in e) {
            const issueEvent = e as any
            // Only include if issue is actually open (not closed)
            return issueEvent.issue?.state === "open"
          }
          return true // Include if we can't verify state
        }
        return false
      })
    }

    console.log(`[Events API] Returning ${events.length} events after filtering`)
    return NextResponse.json(events)
  } catch (error) {
    console.error("[Events API] Error fetching events:", error)
    return NextResponse.json(
      { error: "Failed to fetch events", events: [] },
      { status: 500 }
    )
  }
}





