/**
 * EVENTS QUERY HOOKS
 * 
 * TanStack Query hooks for fetching and managing events.
 * 
 * TODO: Add pagination support
 * TODO: Add infinite scroll queries
 * TODO: Implement real-time updates via WebSocket
 */

import { useQuery } from "@tanstack/react-query"
import { eventsApi } from "@/services/api-service"
import type { EventFilter } from "@/types/events"

const EVENTS_QUERY_KEY = "events"

export function useEvents(filter?: EventFilter) {
  return useQuery({
    queryKey: [EVENTS_QUERY_KEY, filter],
    queryFn: async () => {
      console.log("[useEvents] Fetching events with filter:", filter)
      try {
        const result = await eventsApi.list(filter)
        console.log("[useEvents] Received events:", result?.length || 0)
        return result
      } catch (err) {
        console.error("[useEvents] Error fetching events:", err)
        throw err
      }
    },
    staleTime: 1000 * 60, // 1 minute
    retry: 1, // Retry once on failure
  })
}

export function useEventById(id: string) {
  return useQuery({
    queryKey: [EVENTS_QUERY_KEY, id],
    queryFn: () => eventsApi.getById(id),
    enabled: !!id,
  })
}







